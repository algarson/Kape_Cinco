<?php
    session_start();
    include '../server.php';
    date_default_timezone_set('Asia/Manila');

    if (isset($_SESSION['user'])) {
        $userId = $_SESSION['user']['id'];
        
        if ($_SERVER['REQUEST_METHOD'] == 'POST') {
            $total_sale = $_POST['total-sale'] ?? NULL;
            $total_trans = $_POST['total-trans'] ?? NULL;
            $total_remit = $_POST['total-remit'] ?? NULL;
            $total_disc = $_POST['total-disc'] ?? NULL;
            //$shiftId = $_POST['sid'];
    
    
        
    
            $updateSql = "UPDATE `user_performance` 
                        SET total_sale = ?, 
                            total_trans = ?,
                            total_remit = ?,
                            total_disc = ?
                        WHERE user_id = ?";

            $stmt1 = $conn->prepare($updateSql);
            $stmt1->bind_param("iiiii", $total_sale, $total_trans, $total_remit, $total_disc, $userId);
    
            if ($stmt1->execute()) {
                // Successfully updated time_out and total_shift_duration
                //session_destroy(); // Destroy the session
                echo json_encode(['success' => true]);
            } else {
                // Failed to update the database
                echo json_encode(['success' => false, 'error' => 'Failed to update shift details.']);
            }
    
            $stmt1->close();
        } else {
            echo json_encode(["error" => $stmt1->error]);
        }
    
    } else {
        echo json_encode(['success' => false, 'error' => 'User not logged in.']);
    }
    
    if ($total_sale === null || $total_trans === null || $total_remit === null || $total_disc === null) {
        echo json_encode(['success' => false, 'error' => 'Missing POST data.']);
        exit;
    }

    $conn->close();
?>