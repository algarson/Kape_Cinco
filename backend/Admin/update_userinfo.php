<?php
    session_start();
    include '../server.php';

    // Check if the request method is POST
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Check if user is logged in
        if (!isset($_SESSION['user']['id'])) {
            echo json_encode(['error' => 'User not logged in']);
            exit();
        }

        // Get user_id from POST data (admins are responsible for updates)
        $userId = filter_input(INPUT_POST, 'user_id', FILTER_VALIDATE_INT);
        if (!$userId) {
            echo json_encode(['error' => 'Invalid user ID']);
            exit();
        }

        // Fetch existing user data
        $sql = "SELECT user_firstname, user_lastname, user_role, user_username, user_password, user_image FROM user_table WHERE user_id = ?";
        if ($stmt = $conn->prepare($sql)) {
            $stmt->bind_param('i', $userId);
            $stmt->execute();
            $result = $stmt->get_result();
            if ($result->num_rows === 0) {
                echo json_encode(['error' => 'User not found']);
                exit();
            }
            $userData = $result->fetch_assoc();
            $stmt->close();
        } else {
            echo json_encode(['error' => 'Failed to fetch user data']);
            exit();
        }

        // Collect and sanitize form data
        $firstName = $_POST['update_fname'] ?? $userData['user_firstname'];
        $lastName = $_POST['update_lname'] ?? $userData['user_lastname'];
        $role = $_POST['update_role'] ?? $userData['user_role'];
        $username = filter_input(INPUT_POST, 'update_username', FILTER_SANITIZE_FULL_SPECIAL_CHARS) ?? $userData['user_username'];
        $password = filter_input(INPUT_POST, 'update_userpass', FILTER_SANITIZE_FULL_SPECIAL_CHARS);

        // Start preparing the update query
        $updateFields = [];
        $updateValues = [];

        // Use updated or existing values
        if ($firstName) {
            $updateFields[] = "user_firstname = ?";
            $updateValues[] = $firstName;
        }

        if ($lastName) {
            $updateFields[] = "user_lastname = ?";
            $updateValues[] = $lastName;
        }

        if ($role) {
            $updateFields[] = "user_role = ?";
            $updateValues[] = $role;
        }

        if ($username) {
            $updateFields[] = "user_username = ?";
            $updateValues[] = $username;
        }

        if ($password) {
            $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
            $updateFields[] = "user_password = ?";
            $updateValues[] = $hashedPassword;
        } else {
            // Use the existing password if not updated
            $updateFields[] = "user_password = ?";
            $updateValues[] = $userData['user_password'];
        }

        // Handle image upload
        if (isset($_FILES['update_user_image']) && $_FILES['update_user_image']['error'] === UPLOAD_ERR_OK) {
            // Define the upload directory
            $uploadDir = $_SERVER['DOCUMENT_ROOT'] . '/backend/User/';
            $currentDate = date('Ymd_His');

            // Remove the existing image if it exists
            if ($userData['user_image'] && file_exists($uploadDir . $userData['user_image'])) {
                unlink($uploadDir . $userData['user_image']);
            }

            // Upload the new image
            $fileTmpPath = $_FILES['update_user_image']['tmp_name'];
            $fileExtension = pathinfo($_FILES['update_user_image']['name'], PATHINFO_EXTENSION);
            $fileNamePrefix = $currentDate . '_';
            $fileName = $fileNamePrefix . 'userimage.' . $fileExtension;
            $fileDest = $uploadDir . $fileName;

            if (move_uploaded_file($fileTmpPath, $fileDest)) {
                $updateFields[] = "user_image = ?";
                $updateValues[] = $fileName;
            } else {
                echo json_encode(['error' => 'Failed to move uploaded file']);
                exit();
            }
        }

        // Prepare and execute the update query
        if (!empty($updateFields)) {
            $updateSQL = "UPDATE user_table SET " . implode(', ', $updateFields) . " WHERE user_id = ?";
            $updateValues[] = $userId;

            if ($stmt = $conn->prepare($updateSQL)) {
                $stmt->bind_param(str_repeat('s', count($updateValues) - 1) . 'i', ...$updateValues);
                if ($stmt->execute()) {
                    echo json_encode(['success' => true, 'message' => 'User updated successfully']);
                } else {
                    echo json_encode(['error' => 'Failed to update user information']);
                }
                $stmt->close();
            } else {
                echo json_encode(['error' => 'Failed to prepare update statement']);
            }
        } else {
            echo json_encode(['error' => 'No fields to update']);
        }
    } else {
        // If the request method is not POST, return an error
        echo json_encode(['error' => 'Invalid request method']);
    }
?>
