<?php
    include '/backend/server.php';

    $orderSql = " SELECT
        o.order_number,
        o.order_date,
        o.order_total_amount,
        o.order_payment_received,
        o.order_status,
        d.item_name,
        d.item_quantity,
        d.item_price,
        d.item_total_price,
        COALESCE(f.food_image, dr.drink_image) AS item_image
    FROM
        order_number_table o
    JOIN
        order_details_table d ON o.order_number = d.order_number
    LEFT JOIN
        foods_table f ON d.item_name = f.food_name
    LEFT JOIN
        drinks_table dr ON d.item_name = dr.drink_name
    ";

    $orderResult = $conn->query($orderSql);

    $allOrders = [];
    if ($orderResult->num_rows > 0) {
        while ($row = $orderResult->fetch_assoc()) {
            if (!isset($allOrders[$row['order_number']])) {
                $allOrders[$row['order_number']] = [
                    'order_number' => $row['order_number'],
                    'order_date' => $row['order_date'],
                    'order_total_amount' => (float) $row['order_total_amount'], 
                    'order_payment_received' => (float) $row['order_payment_received'],
                    'order_status' => $row['order_status'],
                    'cart' => [] 
                ];
            }

            $allOrders[$row['order_number']]['cart'][] = [
                'item_name' => $row['item_name'],
                'item_quantity' => (int) $row['item_quantity'],
                'item_price' => (float) $row['item_price'], 
                'item_total_price' => (float) $row['item_total_price'],
                'item_image' => $row['item_image'] // Add image to the result
            ];
        }
    }

    header('Content-Type: application/json');
    echo json_encode(array_values($allOrders));

    $conn->close();
?>