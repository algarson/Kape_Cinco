<?php
include '../server.php';

date_default_timezone_set('Asia/Manila');

$response = ['success' => false, 'message' => ''];

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $orderNumber = $_POST['order-number'];
    $orderAmountReceived = (int)$_POST['received-amount'];
    $orderStatus = $_POST['order-stats'];

    $sql = "UPDATE order_number_table SET order_status = ?, order_payment_received = ?  WHERE order_number = ?";

    if ($stmt = $conn->prepare($sql)) {
        $stmt->bind_param('sis', $orderStatus, $orderAmountReceived, $orderNumber);
        if ($stmt->execute()) {
            $response['success'] = true;
            $response['message'] = 'Order updated successfully';
        } else {
            $response['message'] = 'Failed to update order in database';
        }
        $stmt->close();
    } else {
        $response['message'] = 'Database query failed';
    }
} else {
    $response['message'] = 'Invalid request method';
}

header('Content-Type: application/json');
echo json_encode($response);

$conn->close();
?>