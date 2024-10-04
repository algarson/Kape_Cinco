<?php
    include '../server.php'; 

    $response = ['success' => false, 'message' => ''];

    if ($_SERVER['REQUEST_METHOD'] == 'POST') {
        $item_id = $_POST['item_id'];
        $item_type = $_POST['item_type'];
        $is_variant = isset($_POST['is_variant']) && $_POST['is_variant'] === 'true';
        $variant_name = $_POST['variant_name'];
        $update_name = $_POST['update_name'];
        $update_type = $_POST['update_type'];
        $update_price = $_POST['update_price'];
        $update_serving = $_POST['update_serving'];
        $update_description = $_POST['update_description'] ?? null; // In case of food
        
        $uploadDir = $_SERVER['DOCUMENT_ROOT'] . '/Kape_Cinco/backend/images/';
        $currentDate = date('YmdHis');

        if ($is_variant) {
            // Determine the correct variants table
            $variantTable = ($item_type === 'food') ? 'foods_variant_table' : 'drinks_variant_table';
            $variantIdColumn = ($item_type === 'food') ? 'food_id' : 'drink_id';
            $variantNameColumn = ($item_type === 'food') ? 'food_variant_name' : 'drink_variant_name';
            $variantPriceColumn = ($item_type === 'food') ? 'food_variant_price' : 'drink_variant_price';
            $variantServeCountColumn = ($item_type === 'food') ? 'food_variant_serve_count' : 'drink_variant_serve_count';

            // Update variant details
            $sql = "UPDATE $variantTable SET $variantNameColumn = ?, $variantPriceColumn = ?, $variantServeCountColumn = ? WHERE $variantIdColumn = ?";
            if ($stmt = $conn->prepare($sql)) {
                $stmt->bind_param('sdii', $update_name, $update_price, $update_serving, $item_id);
                if ($stmt->execute()) {
                    $response['success'] = true;
                    $response['message'] = 'Variant updated successfully';
                } else {
                    $response['message'] = 'Failed to update variant';
                }
                $stmt->close();
            }
        } else {
            // Update original food or drink
            $tableName = ($item_type == 'food') ? 'foods_table' : 'drinks_table';
            $nameColumn = ($item_type == 'food') ? 'food_name' : 'drink_name';
            $typeColumn = ($item_type == 'food') ? 'food_type' : 'drink_type';
            $priceColumn = ($item_type == 'food') ? 'food_price' : 'drink_price';
            $serveColumn = ($item_type == 'food') ? 'food_serve_count' : 'drink_serve_count';
            $descColumn = ($item_type == 'food') ? 'food_desc' : '';

            if ($descColumn) {
                $sql = "UPDATE $tableName SET $nameColumn = ?, $typeColumn = ?, $priceColumn = ?, $serveColumn = ?, $descColumn = ? WHERE {$item_type}_id = ?";
                $stmt = $conn->prepare($sql);
                $stmt->bind_param('ssdiss', $update_name, $update_type, $update_price, $update_serving, $update_description, $item_id);
            } else {
                $sql = "UPDATE $tableName SET $nameColumn = ?, $typeColumn = ?, $priceColumn = ?, $serveColumn = ? WHERE {$item_type}_id = ?";
                $stmt = $conn->prepare($sql);
                $stmt->bind_param('ssdii', $update_name, $update_type, $update_price, $update_serving, $item_id);
            }

            if ($stmt->execute()) {
                $response['success'] = true;
                $response['message'] = 'Item updated successfully';
            } else {
                $response['message'] = 'Failed to update item';
            }
            $stmt->close();
        }

        // Handle image update
        if (isset($_FILES['item_image']) && $_FILES['item_image']['error'] == UPLOAD_ERR_OK) {
            // Remove current image before adding new one
            $imageColumn = ($item_type === 'food') ? 'food_image' : 'drink_image';
            $sql = "SELECT $imageColumn FROM $tableName WHERE {$item_type}_id = ?";
            if ($stmt = $conn->prepare($sql)) {
                $stmt->bind_param('i', $item_id);
                $stmt->execute();
                $stmt->bind_result($currentImage);
                $stmt->fetch();
                $stmt->close();

                if ($currentImage && file_exists($uploadDir . $currentImage)) {
                    unlink($uploadDir . $currentImage);
                }
            }

            // Proceed with new image upload
            $fileTmpPath = $_FILES['item_image']['tmp_name'];
            $fileExtension = pathinfo($_FILES['item_image']['name'], PATHINFO_EXTENSION);
            $fileNamePrefix = $currentDate . '_';
            $fileName = ($item_type == 'food') ? $fileNamePrefix . 'foodimage.' . $fileExtension : $fileNamePrefix . 'drinkimage.' . $fileExtension;
            $fileDest = $uploadDir . $fileName;

            if (move_uploaded_file($fileTmpPath, $fileDest)) {
                $sql = "UPDATE $tableName SET $imageColumn = ? WHERE {$item_type}_id = ?";
                if ($stmt = $conn->prepare($sql)) {
                    $stmt->bind_param('si', $fileName, $item_id);
                    if ($stmt->execute()) {
                        $response['success'] = true;
                        $response['message'] = 'Item and image updated successfully';
                    } else {
                        $response['message'] = 'Failed to update image in database';
                    }
                    $stmt->close();
                }
            } else {
                $response['message'] = 'Failed to move uploaded file';
            }
        }
    } else {
        $response['message'] = 'Invalid request method';
    }

    echo json_encode($response);
?>
