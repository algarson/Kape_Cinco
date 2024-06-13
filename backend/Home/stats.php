<?php

    include "../server.php";

    $statSql = "SELECT COUNT(order_number) AS total_orders, EXTRACT(day from order_date) as today, SUM(order_total_amount) AS Sales FROM order_number_table WHERE order_status = 'complete' AND EXTRACT(DAY from order_date) = EXTRACT(day from curdate()) GROUP BY today ";

    $res = $conn->query($statSql);

    $allData = [];

    if ($res->num_rows > 0) {
        while ($row = $res->fetch_assoc()) {
            $allData[] = $row;
        }
    }

    echo json_encode($allData);

    $conn->close();
    
?>