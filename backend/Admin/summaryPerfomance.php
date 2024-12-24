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

        if ($setDate === null || $setDate2 === null) {
            echo json_encode(['success' => false, 'error' => 'Missing setDate or setDate2 parameter.']);
            exit;
        }

        // SQL Query
        $sql = "SELECT 
                    item_name, SUM(item_quantity) as frequency
                FROM `order_details_table`
                INNER JOIN
                    order_number_table
                ON
                    order_number_table.order_number = order_details_table.order_number
                WHERE 
                    order_number_table.order_status = 'Completed' 
                    AND DATE(order_number_table.order_date) BETWEEN ? AND ?
                GROUP BY 
                    item_name
                ORDER BY 
                    frequency DESC 
                LIMIT 5;";

        $stmt1 = $conn->prepare($sql);
        if (!$stmt1) {
            echo json_encode(['success' => false, 'error' => 'SQL prepare failed: ' . $conn->error]);
            exit;
        }

        // Bind the parameters
        $stmt1->bind_param("ss", $setDate, $setDate2);

        // Execute the query
        if ($stmt1->execute()) {
            // Fetch result
            $result = $stmt1->get_result();
            $data = [];

            while ($row = $result->fetch_assoc()) {
                $data[] = [
                    'item_name' => $row['item_name'],
                    'frequency' => $row['frequency']
                ];
            }

            echo json_encode([
                'success' => true,
                'data' => $data
            ]);
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
