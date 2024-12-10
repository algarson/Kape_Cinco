<?php

    include "../server.php";

    $yearlyStats = "SELECT 
       YEAR(order_date) AS yearly,
       SUM(order_total_amount) AS yearly_sales 
       FROM `order_number_table` 
       WHERE `order_status` = 'Completed' 
       GROUP BY `yearly`
       ORDER BY `yearly` ASC";

    $res = $conn->query($yearlyStats);

    $allData = [];

    if ($res->num_rows > 0) {
        while ($row = $res->fetch_assoc()) {
            $allData[] = $row['yearly_sales'];
        }
    }

    echo json_encode($allData);

    $conn->close();
    
?>