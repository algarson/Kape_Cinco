<?php
include '/backend/server.php';
date_default_timezone_set('Asia/Manila');

// Enable error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    header('Content-Type: application/json');

    // Sanitize inputs
    $username = filter_input(INPUT_POST, 'username', FILTER_SANITIZE_FULL_SPECIAL_CHARS);
    $password = filter_input(INPUT_POST, 'password', FILTER_SANITIZE_FULL_SPECIAL_CHARS);

    // Check user existence
    $sql = "SELECT * FROM `user_table` WHERE `user_username` = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $user = $result->fetch_assoc();

        // Verify password
        if (password_verify($password, $user['user_password'])) {
            // Start session and store user info
            session_start();
            session_regenerate_id(true);

            $timeIn = date('Y-m-d H:i:s');

            $_SESSION['user'] = [
                'id' => $user['user_id'],
                'role' => $user['user_role'],
                'name' => $user['user_firstname'] . ' ' . $user['user_lastname'],
                'time_in' => $timeIn
            ];

            $shiftSql = "INSERT INTO `user_shifts` (user_id, time_in) VALUES (?, ?)";
            $shiftStmt = $conn->prepare($shiftSql);
            $shiftStmt->bind_param("is", $user['user_id'], $timeIn);
            $shiftStmt->execute();
            $shiftStmt->close();

            echo json_encode(['userExists' => true, 'role' => $user['user_role']]);
        } else {
            echo json_encode(['userExists' => false, 'error' => 'Invalid password.']);
        }
    } else {
        echo json_encode(['userExists' => false, 'error' => 'User not found.']);
    }

    $stmt->close();
}

$conn->close();
?>
