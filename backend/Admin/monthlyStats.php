<?php

    include "../server.php";

    $monthlyStats = "SELECT 
       MONTH(order_date) AS monthly,
       SUM(order_total_amount) AS monthly_sales 
       FROM `order_number_table` 
       WHERE `order_status` = 'Completed'
       AND EXTRACT(YEAR FROM order_date) = YEAR(curdate()) 
       GROUP BY `monthly`
       ORDER BY `monthly` ASC";

    $res = $conn->query($monthlyStats);

    $allData = [];

    if ($res->num_rows > 0) {
        while ($row = $res->fetch_assoc()) {
            $allData[] = $row['monthly_sales'];
        }
    }

    echo json_encode($allData);

    $conn->close();
    
?>