<?php
session_start();
include '../server.php';
date_default_timezone_set('Asia/Manila');

if (isset($_SESSION['user'])) {
    $userId = $_SESSION['user']['id']; // Assuming this is relevant

    if ($_SERVER['REQUEST_METHOD'] == 'POST') {
        $setDate = $_POST['setDate'] ?? null;
        $setDate2 = $_POST['setDate2'] ?? null;

        if ($setDate === null || $setDate2 === null) {
            echo json_encode(['success' => false, 'error' => 'Missing date parameters.']);
            exit;
        }

        // Debugging Input
        error_log("Received setDate: " . $setDate);
        error_log("Received setDate2: " . $setDate2);

        $sql = "SELECT 
                    SUM(order_total_amount) AS total_sales,
                    COUNT(order_number) AS total_transact
                FROM `order_number_table`
                WHERE order_status = 'Completed' 
                AND DATE(order_date) BETWEEN ? AND ?";

        $stmt1 = $conn->prepare($sql);
        if (!$stmt1) {
            echo json_encode(['success' => false, 'error' => 'SQL prepare failed: ' . $conn->error]);
            exit;
        }

        $stmt1->bind_param("ss", $setDate, $setDate2);

        if ($stmt1->execute()) {
            $result = $stmt1->get_result();
            if ($result && $row = $result->fetch_assoc()) {
                $total_sales = $row['total_sales'];
                $total_trans = $row['total_transact'];

                echo json_encode([
                    'success' => true,
                    'data' => [
                        'total_sales' => $total_sales,
                        'total_trans' => $total_trans,
                    ]
                ]);
            } else {
                echo json_encode(['success' => false, 'error' => 'No data found for the specified date range.']);
            }
        } else {
            echo json_encode(['success' => false, 'error' => 'Query execution failed: ' . $stmt1->error]);
        }

        $stmt1->close();
    } else {
        echo json_encode(['success' => false, 'error' => 'Invalid request method.']);
    }
} else {
    echo json_encode(['success' => false, 'error' => 'User not logged in.']);
}

$conn->close();

?>
