<?php
    session_start();

    // Check if user has the proper role
    if (!isset($_SESSION['user']['role']) || $_SESSION['user']['role'] !== 'Admin') {
        http_response_code(403); // Forbidden
        exit(json_encode(['error' => 'Access denied']));
    }

    include '../server.php'; 
    header('Content-Type: application/json');

    $response = ['success' => false, 'message' => ''];

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {

        $data = json_decode(file_get_contents('php://input'), true);
        $user_id = $data['id'];

        // Start transaction
        $conn->begin_transaction();

        try {
            $sql = "UPDATE user_table SET user_status = 'Inactive' WHERE user_id = ?";
            if ($stmt = $conn->prepare($sql)) {
                $stmt->bind_param('i', $user_id);
                if ($stmt->execute()) {
                    $response['success'] = true;
                    $response['message'] = 'User marked as deleted successfully';
                } else {
                    throw new Exception('Failed to update the user status.');
                }
                $stmt->close();
            }

            // Commit transaction
            $conn->commit();

        } catch (Exception $e) {
            // Rollback in case of error
            $conn->rollback();
            $response['message'] = $e->getMessage();
        }
    } else {
        $response['message'] = 'Invalid request method';
    }

    echo json_encode($response);
?>
