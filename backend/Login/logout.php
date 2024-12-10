<?php
    session_start();
    include '../server.php';
    date_default_timezone_set('Asia/Manila');

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

    $conn->close();
?>
