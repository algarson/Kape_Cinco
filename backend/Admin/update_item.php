<?php
    include '../server.php'; 

    $response = ['success' => false, 'message' => ''];

    if ($_SERVER['REQUEST_METHOD'] == 'POST') {
        $item_id = $_POST['item_id'];
        $item_type = $_POST['item_type'];
        $uploadDir = $_SERVER['DOCUMENT_ROOT'] . '/Kape_Cinco/backend/images/';
        $currentDate = date('YmdHis');
        
        $tableName = ($item_type == 'food') ? 'foods_table' : 'drinks_table';
        $imageColumn = ($item_type == 'food') ? 'food_image' : 'drink_image';
        $idColumn = ($item_type == 'food') ? 'food_id' : 'drink_id';

        $sql = "SELECT $imageColumn FROM $tableName WHERE $idColumn = ?";
        if ($stmt = $conn->prepare($sql)) {
            $stmt->bind_param('i', $item_id);
            $stmt->execute();
            $stmt->bind_result($currentImage);
            $stmt->fetch();
            $stmt->close();

            // Check if an image already exists and delete it
            if ($currentImage && file_exists($uploadDir . $currentImage)) {
                unlink($uploadDir . $currentImage);
            }
        }

        if (isset($_FILES['item_image']) && $_FILES['item_image']['error'] == UPLOAD_ERR_OK) {
            $fileTmpPath = $_FILES['item_image']['tmp_name'];
            
            // Modify the filename convention based on item_type
            $fileExtension = pathinfo($_FILES['item_image']['name'], PATHINFO_EXTENSION);
            $fileNamePrefix = $currentDate . '_';
            $fileName = ($item_type == 'food') ? $fileNamePrefix . 'foodimage.' . $fileExtension : $fileNamePrefix . 'drinkimage.' . $fileExtension;
            
            $fileDest = $uploadDir . $fileName;
        
            if (move_uploaded_file($fileTmpPath, $fileDest)) {
                // Update the database with the filename
                $tableName = ($item_type == 'food') ? 'foods_table' : 'drinks_table';
                $sql = "UPDATE $tableName SET " . ($item_type == 'food' ? 'food_image' : 'drink_image') . " = ? WHERE " . ($item_type == 'food' ? 'food_id' : 'drink_id') . " = ?";
                
                if ($stmt = $conn->prepare($sql)) {
                    $stmt->bind_param('si', $fileName, $item_id);
                    if ($stmt->execute()) {
                        $response['success'] = true;
                        $response['message'] = 'Item updated successfully';
                    } else {
                        $response['message'] = 'Failed to update item in database';
                    }
                    $stmt->close();
                } else {
                    $response['message'] = 'Database query failed';
                }
            } else {
                $response['message'] = 'Failed to move uploaded file';
            }
        } else {
            $response['message'] = 'No file uploaded or upload error';
        }
    } else {
        $response['message'] = 'Invalid request method';
    }

    echo json_encode($response);
?>
