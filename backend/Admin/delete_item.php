<?php
    session_start();
    
    // Check if user has the proper role
    if (!isset($_SESSION['user']['role']) || 
        ($_SESSION['user']['role'] !== 'Admin' && $_SESSION['user']['role'] !== 'Cashier')) {
        http_response_code(403); // Forbidden
        exit(json_encode(['error' => 'Access denied']));
    }

    include '../server.php'; 
    header('Content-Type: application/json');
    
    $response = ['success' => false, 'message' => ''];
    
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {

        $data = json_decode(file_get_contents('php://input'), true);
        
        $item_id = $data['id'];
        $item_type = $data['type'];
        
        // Determine the table names based on item type
        $tableName = ($item_type === 'food') ? 'foods_table' : 'drinks_table';
        $variantTable = ($item_type === 'food') ? 'foods_variant_table' : 'drinks_variant_table';
        $idColumn = ($item_type === 'food') ? 'food_id' : 'drink_id';

        // Check for variants associated with this item
        $sql = "SELECT COUNT(*) as variant_count FROM $variantTable WHERE $idColumn = ?";
        if ($stmt = $conn->prepare($sql)) {
            $stmt->bind_param('i', $item_id);
            $stmt->execute();
            $stmt->bind_result($variant_count);
            $stmt->fetch();
            $stmt->close();
        }

        // Start a transaction to ensure everything deletes successfully
        $conn->begin_transaction();

        try {
            // If there are variants, delete them first
            if ($variant_count > 0) {
                $sql = "DELETE FROM $variantTable WHERE $idColumn = ?";
                if ($stmt = $conn->prepare($sql)) {
                    $stmt->bind_param('i', $item_id);
                    $stmt->execute();
                    $stmt->close();
                }
            }

            // Delete the main item (food or drink)
            $sql = "DELETE FROM $tableName WHERE $idColumn = ?";
            if ($stmt = $conn->prepare($sql)) {
                $stmt->bind_param('i', $item_id);
                if ($stmt->execute()) {
                    $response['success'] = true;
                    $response['message'] = 'Item and its variants deleted successfully';
                } else {
                    throw new Exception('Failed to delete the item.');
                }
                $stmt->close();
            }

            // Commit the transaction
            $conn->commit();

        } catch (Exception $e) {
            // Rollback in case of error
            $conn->rollback();
            $response['message'] = $e->getMessage();
        }

    } else {
        $response['message'] = 'Invalid request method';
    }

    // Send back the JSON response
    echo json_encode($response);
?>