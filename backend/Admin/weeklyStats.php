<?php

    include "../server.php";

    $weeklyStats = "SELECT 
       WEEK(order_date) AS weekly,
       SUM(order_total_amount) AS weekly_sales 
       FROM order_number_table 
       WHERE order_status = 'Completed' 
       AND EXTRACT(MONTH FROM order_date) = MONTH(curdate())
       GROUP BY weekly
       ORDER BY weekly ASC";


    $res = $conn->query($weeklyStats);

    $allData = [];

    if ($res->num_rows > 0) {
        while ($row = $res->fetch_assoc()) {
            $allData[] = $row['weekly_sales'];
        }
    }

    echo json_encode($allData);

   // echo $allData;

    $conn->close();
    
?>