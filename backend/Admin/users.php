<?php
    session_start();

    // Check if user has the proper role
    if (!isset($_SESSION['user']['role']) || 
        ($_SESSION['user']['role'] !== 'Admin' && $_SESSION['user']['role'] !== 'Cashier')) {
        http_response_code(403); // Forbidden
        exit(json_encode(['error' => 'Access denied']));
    }

    // Include the database connection file
    include '../server.php';

    // Query to fetch shift logs with user details
    $logsql = "SELECT `user_id`, `user_firstname`, `user_lastname`, `user_role`, `user_image` FROM  `user_table` WHERE `user_status` = 'Active' ";

    $result = $conn->query($logsql);

    $logs = [];

    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $logs[] = [
                'user_id' => $row['user_id'],
                'user_firstname' => $row['user_firstname'],
                'user_lastname' => $row['user_lastname'],
                'user_role' => $row['user_role'],
                'user_image' => $row['user_image'],
            ];
        }
    }

    // Close the database connection
    $conn->close();

    // Output logs as JSON
    echo json_encode($logs);
?>