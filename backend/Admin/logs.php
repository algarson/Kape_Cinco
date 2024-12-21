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
    $logsql = "SELECT 
            user_shifts.time_id, 
            user_shifts.user_id, 
            user_shifts.time_in, 
            user_shifts.time_out, 
            user_shifts.total_shift_duration, 
            user_table.user_firstname, 
            user_table.user_lastname,
            user_table.user_role,
            total_sale,
            total_trans,
            total_remit,
            total_disc
        FROM 
            user_performance
        INNER JOIN 
            user_table
        ON 
            user_performance.user_id = user_table.user_id
        INNER JOIN
        	user_shifts
        ON
        	user_performance.time_id = user_shifts.time_id
        ORDER BY 
            user_shifts.time_in DESC;
    ";

    $result = $conn->query($logsql);

    $logs = [];

    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $logs[] = [
                'time_id' => $row['time_id'],
                'user_id' => $row['user_id'],
                'user_firstname' => $row['user_firstname'],
                'user_lastname' => $row['user_lastname'],
                'user_role' => $row['user_role'],
                'time_in' => $row['time_in'],
                'time_out' => $row['time_out'],
                'total_shift_duration' => $row['total_shift_duration'],
                'total_sale' => $row['total_sale'],
                'total_trans' => $row['total_trans'],
                'total_remit' => $row['total_remit'],
                'total_disc' => $row['total_disc'],
            ];
        }
    }

    // Close the database connection
    $conn->close();

    // Output logs as JSON
    header('Content-Type: application/json');
    echo json_encode($logs);
?>
