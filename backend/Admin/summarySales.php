<?php
session_start();
include '../server.php';
date_default_timezone_set('Asia/Manila');

if (isset($_SESSION['user'])) {
    $userId = $_SESSION['user']['id']; // Assuming this is relevant

    if ($_SERVER['REQUEST_METHOD'] == 'POST') {
        // Check if setDate is provided
        $setDate = $_POST['setDate'] ?? null;
        $setDate2 = $_POST['setDate2'] ?? null;

        if ($setDate === null) {
            echo json_encode(['success' => false, 'error' => 'Missing setDate parameter.']);
            exit;
        }

        // SQL Query
        $sql = "SELECT 
                    SUM(order_total_amount) AS total_sales
                FROM `order_number_table`
                WHERE order_status = 'Completed' 
                AND DATE(order_date) BETWEEN ? AND ?";

        $stmt1 = $conn->prepare($sql);
        if (!$stmt1) {
            echo json_encode(['success' => false, 'error' => 'SQL prepare failed: ' . $conn->error]);
            exit;
        }

        // Bind the parameter
        $stmt1->bind_param("ss", $setDate, $setDate2);

        // Execute the query
        if ($stmt1->execute()) {
            // Fetch result
            $result = $stmt1->get_result();
            if ($result && $row = $result->fetch_assoc()) {
                $total_sales = $row['total_sales'];

                echo json_encode([
                    'success' => true,
                    'data' => [
                        'total_sales' => $total_sales,
                    ]
                ]);
            } else {
                echo json_encode(['success' => false, 'error' => 'No data found for the specified date.']);
            }
        } else {
            echo json_encode(['success' => false, 'error' => 'Query execution failed: ' . $stmt1->error]);
        }

        // Close statement
        $stmt1->close();
    } else {
        echo json_encode(['success' => false, 'error' => 'Invalid request method.']);
    }
} else {
    echo json_encode(['success' => false, 'error' => 'User not logged in.']);
}

// Close connection
$conn->close();
?>
