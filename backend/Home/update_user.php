<?php
    session_start();
    include '/backend/server.php';

    // Check if the request method is POST
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Check if user is logged in
        if (!isset($_SESSION['user']['id'])) {
            echo json_encode(['error' => 'User not logged in']);
            exit();
        }

        // Check if the form is submitted with an image
        if (isset($_FILES['item_image']) && $_FILES['item_image']['error'] === UPLOAD_ERR_OK) {
            // Get user_id from session
            $userId = $_SESSION['user']['id'];

            // Define the upload directory
            $uploadDir = $_SERVER['DOCUMENT_ROOT'] . '/Kape_Cinco/backend/User/';
            $currentDate = date('Ymd_His');

            // Check if the user already has an image
            $sql = "SELECT user_image FROM user_table WHERE user_id = ?";
            if ($stmt = $conn->prepare($sql)) {
                $stmt->bind_param('i', $userId);
                $stmt->execute();
                $stmt->bind_result($currentImage);
                $stmt->fetch();
                $stmt->close();

                // If there is an existing image, remove it
                if ($currentImage && file_exists($uploadDir . $currentImage)) {
                    unlink($uploadDir . $currentImage); // Delete the existing image
                }
            }
            
            // Proceed with new image upload
            $fileTmpPath = $_FILES['item_image']['tmp_name'];
            $fileExtension = pathinfo($_FILES['item_image']['name'], PATHINFO_EXTENSION);
            $fileNamePrefix = $currentDate . '_';
            $fileName = $fileNamePrefix . 'userimage.' . $fileExtension; // Image name format: userID_timestamp.extension
            $fileDest = $uploadDir . $fileName;

            // Move the uploaded file to the target directory
            if (move_uploaded_file($fileTmpPath, $fileDest)) {
                // Update the user's image in the database
                $sql = "UPDATE user_table SET user_image = ? WHERE user_id = ?";
                if ($stmt = $conn->prepare($sql)) {
                    $stmt->bind_param('si', $fileName, $userId);
                    if ($stmt->execute()) {
                        echo json_encode(['success' => true, 'newImageName' => $fileName, 'message' => 'Profile image updated successfully.']);
                    } else {
                        echo json_encode(['error' => 'Failed to update user image in database']);
                    }
                    $stmt->close();
                } else {
                    echo json_encode(['error' => 'Failed to prepare update statement']);
                }
            } else {
                echo json_encode(['error' => 'Failed to move uploaded file']);
            }
        } else {
            echo json_encode(['error' => 'No image uploaded or there was an error with the upload']);
        }
    } else {
        // If the request method is not POST, return an error
        echo json_encode(['error' => 'Invalid request method']);
    }
?>
