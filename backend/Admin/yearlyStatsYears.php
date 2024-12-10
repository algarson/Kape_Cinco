<?php

    include "../server.php";

    $yearlyStatsDate = "SELECT 
       YEAR(order_date) AS annu,
       SUM(order_total_amount) AS yearly_sales 
       FROM `order_number_table` 
       WHERE `order_status` = 'Completed' 
       GROUP BY `annu`
       ORDER BY `annu` ASC";

    $res = $conn->query($yearlyStatsDate);

    $allData = [];

    if ($res->num_rows > 0) {
        while ($row = $res->fetch_assoc()) {
            $allData[] = $row['annu'];
        }
    }

    echo json_encode($allData);

    $conn->close();
    
?>