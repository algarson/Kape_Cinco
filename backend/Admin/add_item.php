<?php
    include '../server.php';

    $response = ['success' => false, 'message' => ''];

    if ($_SERVER['REQUEST_METHOD'] == 'POST') {
        // Collect data from the POST request
        $name = $_POST['add_name'];
        $category = $_POST['add_category'];
        $type = $_POST['add_type'];
        $price = $_POST['add_price'];
        $serve = $_POST['add_serving'];
        $description = $_POST['add_description'] ?? null;
        $status = 'Available'; // Predefine the status

        // Validate serving count
        if ($serve < 1) {
            $response['message'] = 'Serving count must be at least 1.';
            echo json_encode($response);
            exit();
        }

        // Determine the correct table and columns based on category
        $tableName = ($category === 'food') ? 'foods_table' : 'drinks_table';
        $nameColumn = ($category === 'food') ? 'food_name' : 'drink_name';
        $typeColumn = ($category === 'food') ? 'food_type' : 'drink_type';
        $priceColumn = ($category === 'food') ? 'food_price' : 'drink_price';
        $descColumn = ($category === 'food') ? 'food_desc' : null; // Only foods have descriptions
        $serveColumn = ($category == 'food') ? 'food_serve_count' : 'drink_serve_count';
        $statusColumn = ($category == 'food') ? 'food_status' : 'drink_status'; // Status column
        $imageColumn = ($category === 'food') ? 'food_image' : 'drink_image';

        // Handle the file upload (if an image is provided)
        $fileName = null;
        $uploadDir = $_SERVER['DOCUMENT_ROOT'] . '/backend/images/';
        $currentDate = date('YmdHis');

        if (isset($_FILES['add_image']) && $_FILES['add_image']['error'] === UPLOAD_ERR_OK) {
            $fileTmpPath = $_FILES['add_image']['tmp_name'];
            $fileExtension = pathinfo($_FILES['add_image']['name'], PATHINFO_EXTENSION);
            $fileNamePrefix = $currentDate . '_';
            $fileName = ($category === 'food') ? $fileNamePrefix . 'foodimage.' . $fileExtension : $fileNamePrefix . 'drinkimage.' . $fileExtension;
            $fileDest = $uploadDir . $fileName;

            if (!move_uploaded_file($fileTmpPath, $fileDest)) {
                $response['message'] = 'Failed to move uploaded file';
                echo json_encode($response);
                exit();
            }
        }

        // Construct the SQL query
        if ($descColumn) {
            // For foods (with description)
            $sql = "INSERT INTO $tableName ($nameColumn, $typeColumn, $priceColumn, $descColumn, $serveColumn, $statusColumn" . ($fileName ? ", $imageColumn" : "") . ") 
                    VALUES (?, ?, ?, ?, ?, ?" . ($fileName ? ", ?" : "") . ")";
            if ($stmt = $conn->prepare($sql)) {
                if ($fileName) {
                    $stmt->bind_param('ssdsiss', $name, $type, $price, $description, $serve, $status, $fileName);
                } else {
                    $stmt->bind_param('ssdsis', $name, $type, $price, $description, $serve, $status);
                }
            }
        } else {
            // For drinks (without description)
            $sql = "INSERT INTO $tableName ($nameColumn, $typeColumn, $priceColumn, $serveColumn, $statusColumn" . ($fileName ? ", $imageColumn" : "") . ") 
                    VALUES (?, ?, ?, ?, ?" . ($fileName ? ", ?" : "") . ")";
            if ($stmt = $conn->prepare($sql)) {
                if ($fileName) {
                    $stmt->bind_param('ssdiss', $name, $type, $price, $serve, $status, $fileName);
                } else {
                    $stmt->bind_param('ssdis', $name, $type, $price, $serve, $status);
                }
            }
        }

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

