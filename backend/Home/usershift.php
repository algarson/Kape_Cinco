<?php
session_start();
include '../server.php';

if (isset($_SESSION['user'])) {
    $userId = $_SESSION['user']['id'];

    // SQL query to fetch data
    $time = "SELECT time_id
             FROM `user_performance`
             WHERE `user_id` = ?
             ORDER BY `time_id` DESC";

    // Prepare the statement
    $stmt1 = $conn->prepare($time);
    if (!$stmt1) {
        echo json_encode(['success' => false, 'error' => 'Failed to prepare statement.']);
        exit;
    }

    // Bind parameters
    $stmt1->bind_param("i", $userId);

    // Execute the statement
    if ($stmt1->execute()) {
        // Fetch results
        $result = $stmt1->get_result();
        $allData = [];

        if ($result->num_rows > 0) {
            while ($row = $result->fetch_assoc()) {
                $allData[] = $row;
            }
            echo json_encode(['success' => true, 'data' => $allData]);
        } else {
            echo json_encode(['success' => false, 'error' => 'No records found.']);
        }

        $result->free(); // Free the result set
    } else {
        echo json_encode(['success' => false, 'error' => 'Failed to execute query.']);
    }

    // Close the statement and connection
    $stmt1->close();
    $conn->close();
} else {
    echo json_encode(['success' => false, 'error' => 'User not logged in.']);
}
?>
