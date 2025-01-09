<?php

include '../server.php';

    $statSql = $statSql = "SELECT 
    COUNT(order_number) AS total_orders, 
    CONVERT_TZ(NOW(), @@session.time_zone, '+08:00') AS today, 
    SUM(order_total_amount) AS Sales 
FROM order_number_table 
WHERE order_status = 'Completed' 
AND DATE(CONVERT_TZ(order_date, @@session.time_zone, '+08:00')) = DATE(CONVERT_TZ(NOW(), @@session.time_zone, '+08:00'));";

    $res = $conn->query($statSql);

    $allData = [];

    if ($res->num_rows > 0) {
        while ($row = $res->fetch_assoc()) {
            $allData[] = $row;
        }
    } else {
       
        $allData[] = [
            "total_orders" => 0,
            "today" => date('d'),
            "Sales" => 0
        ];
    }

    echo json_encode($allData);

    $conn->close();
    
?>