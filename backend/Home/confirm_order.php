<?php
    include '../server.php';

    if ($_SERVER['REQUEST_METHOD'] == 'POST') {
        $orderNumber = $_POST['pending-order-number'];
        $orderDate =  date('YmdHis');
        $orderTotalAmount = $_POST['pending-modal-total-amount'];
        $orderAmountReceived = $_POST['pending-received-amount'];
        $TotalPrice = 0;

        $orderDetailsRaw = $_POST['order-details'];
        $orderDetails = json_decode($orderDetailsRaw, true);

        $sql1 = "INSERT INTO order_number_table (order_number, order_date, order_total_amount, order_payment_received)
                 VALUES (?, ?, ?, ?)";
        $stmt1 = $conn->prepare($sql1);
        $stmt1->bind_param("ssdd", $orderNumber, $orderDate, $orderTotalAmount, $orderAmountReceived);
        if ($stmt1->execute()) {

            $sql2 = "INSERT INTO order_details_table (order_number, item_name, item_quantity, item_price, item_total_price) VALUES (?, ?, ?, ?, ?)";
            $stmt2 = $conn->prepare($sql2);
    
            foreach ($orderDetails as $detail) {
                $itemName = $detail['name'];
                $quantity = $detail['quantity'];
                $price = $detail['price'];
                $TotalPrice = $quantity * $price;
                $stmt2->bind_param("ssiii", $orderNumber, $itemName, $quantity, $price, $TotalPrice);
                if (!$stmt2->execute()) {
                    echo json_encode(["error" => $stmt2->error]);
                    exit;
                }
            }
    
            echo json_encode(["message" => "Order inserted successfully"]);
        } else {
            echo json_encode(["error" => $stmt1->error]);
        }
    
        $stmt1->close();
        $stmt2->close();
    }
    
    $conn->close();
?>