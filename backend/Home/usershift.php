<?php
session_start();
include '../server.php';

if (isset($_SESSION['user'])) {
    $userId = $_SESSION['user']['id'];

    $time = "SELECT time_id
        FROM `user_performance`
        WHERE `user_id` = ?
        ORDER BY `time_id` DESC"; 
    
    $stmt1 = $conn->prepare($statSql);
    $stmt1->bind_param("i", $userId);

    $res = $conn->query($time);

    $allData = [];

    if ($res->num_rows > 0) {
        while ($row = $res->fetch_assoc()) {
            $allData[] = $row;
        }
    } else {
       
        echo json_encode(["error"]);
    }

    echo json_encode($allData);

    $conn->close();
    $stmt1->close();

}else {
        echo json_encode(['success' => false, 'error' => 'User not logged in.']);
    }
    
    
?>