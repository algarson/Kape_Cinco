<?php

    include "../server.php";

    $weeklyStats = "SELECT 
       WEEK(order_date) AS weekly,
       SUM(order_total_amount) AS weekly_sales 
       FROM order_number_table 
       WHERE order_status = 'Completed' 
       AND EXTRACT(MONTH FROM order_date) = MONTH(CONVERT_TZ(NOW(), @@session.time_zone, '+08:00'))
       AND EXTRACT(YEAR FROM order_date) = YEAR(CONVERT_TZ(NOW(), @@session.time_zone, '+08:00'))
       GROUP BY weekly
       ORDER BY weekly ASC";


    $res = $conn->query($weeklyStats);

    $allData = [];

    if ($res->num_rows > 0) {
        while ($row = $res->fetch_assoc()) {
            $allData[] = [
                'weekly' => $row['weekly'],
                'weekly_sales' => $row['weekly_sales']
            ];
        }
    }

    echo json_encode($allData);

   // echo $allData;

    $conn->close();
    
?>