<?php

include '../server.php';

    $statSql = $statSql = "SELECT 
                                COUNT(order_number) AS total_orders, 
                                SUM(order_total_amount) AS Sales 
                            FROM `order_number_table` 
                            WHERE `order_status` = 'Completed' 
                            AND DATE(order_date) = CURDATE()";

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