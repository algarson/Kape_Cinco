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
            $shiftId = $_POST['sid'];
    
    
        
    
            $updateSql = "UPDATE `user_performance` 
                        SET total_sale = ?, 
                            total_trans = ?,
                            total_remit = ?,
                            total_disc = ?
                        WHERE time_id = ?";

            $stmt1 = $conn->prepare($updateSql);
            $stmt1->bind_param("iiiii", $total_sale, $total_trans, $total_remit, $total_disc, $shiftId);
    
            if ($stmt1->execute()) {
                if (isset($_SESSION['user'])) {
                    $userId = $_SESSION['user']['id'];
            
                    // Get the current datetime
                    $currentTime = date('Y-m-d H:i:s');
            
                    // Update `time_out` and calculate `total_shift_duration` for the user's most recent shift
                    $updateSql = "UPDATE `user_shifts` 
                                SET `time_out` = ?, 
                                    `total_shift_duration` = TIMEDIFF(?, time_in) 
                                WHERE `user_id` = ? AND `time_out` IS NULL 
                                ORDER BY `time_in` DESC LIMIT 1";
            
                    $stmt = $conn->prepare($updateSql);
                    $stmt->bind_param("ssi", $currentTime, $currentTime, $userId);
            
                    if ($stmt->execute()) {
                        // Successfully updated time_out and total_shift_duration
                        session_destroy(); // Destroy the session
                        echo json_encode(['success' => true]);
                    } else {
                        // Failed to update the database
                        echo json_encode(['success' => false, 'error' => 'Failed to update shift details.']);
                    }
            
                    $stmt->close();
                } else {
                    echo json_encode(['success' => false, 'error' => 'User not logged in.']);
                }
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