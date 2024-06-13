<?php
    include '../server.php'; 

    $response = ['success' => false, 'message' => ''];

    if ($_SERVER['REQUEST_METHOD'] == 'POST') {
        $item_id = $_POST['item_id'];
        $item_type = $_POST['item_type'];
        $uploadDir = $_SERVER['DOCUMENT_ROOT'] . '/Kape_Cinco/backend/images/';
        $currentDate = date('YmdHis');
    
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
