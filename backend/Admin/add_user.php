<?php
    session_start();

    // Check if user has the proper role
    if (!isset($_SESSION['user']['role']) || 
        ($_SESSION['user']['role'] !== 'Admin' && $_SESSION['user']['role'] !== 'Cashier')) {
        http_response_code(403); // Forbidden
        exit(json_encode(['error' => 'Access denied']));
    }
    
    include '../server.php';

    if ($_SERVER['REQUEST_METHOD'] == 'POST') {
        $fname = trim($_POST['add_fname'] ?? '');
        $lname = trim($_POST['add_lname'] ?? '');
        $role = trim($_POST['add_role'] ?? '');
        $username = filter_input(INPUT_POST, 'add_username', FILTER_SANITIZE_FULL_SPECIAL_CHARS);
        $password = filter_input(INPUT_POST, 'add_userpass', FILTER_SANITIZE_FULL_SPECIAL_CHARS);
        
        $response = ['success' => false, 'message' => ''];
        
        $hashedPassword = password_hash($password, PASSWORD_BCRYPT);

        // Handle the file upload (if an image is provided)
        $fileName = null;
        $uploadDir = $_SERVER['DOCUMENT_ROOT'] . '/Kape_Cinco/backend/User/';
        $currentDate = date('YmdHis');

        if (isset($_FILES['add_userimage']) && $_FILES['add_userimage']['error'] === UPLOAD_ERR_OK) {
            $fileTmpPath = $_FILES['add_userimage']['tmp_name'];
            $fileExtension = pathinfo($_FILES['add_userimage']['name'], PATHINFO_EXTENSION);
            $fileNamePrefix = $currentDate . '_';
            $fileName = $fileNamePrefix . 'userimage.' . $fileExtension;
            $fileDest = $uploadDir . $fileName;

            if (!move_uploaded_file($fileTmpPath, $fileDest)) {
                $response['message'] = 'Failed to move uploaded file';
                echo json_encode($response);
                exit();
            }
        }

        $sql = "INSERT INTO user_table (user_firstname, user_lastname, user_username, user_password, user_role" . ($fileName ? ", user_image" : "") . ") 
                VALUES (?, ?, ?, ?, ?" . ($fileName ? ", ?" : "") . ")";
        if ($stmt = $conn->prepare($sql)) {
            if($fileName){
                $stmt->bind_param("ssssss", $fname, $lname, $username, $hashedPassword, $role, $fileName);
            } else {
                $stmt->bind_param("sssss", $fname, $lname, $username, $hashedPassword, $role);
            }
            
        };
        
        // Execute the statement and check for success
        if ($stmt->execute()) {
            $response['success'] = true;
            $response['message'] = 'Item added successfully';
        } else {
            $response['message'] = 'Failed to insert item';
        }

        $stmt->close();
    } else {
        $response['message'] = 'Invalid request method';
    }

    echo json_encode($response);
?>