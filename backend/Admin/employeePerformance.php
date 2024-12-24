<?php
session_start();
include '../server.php';
date_default_timezone_set('Asia/Manila');

if (isset($_SESSION['user'])) {
    $userId = $_SESSION['user']['id'];

    if ($_SERVER['REQUEST_METHOD'] == 'POST') {
        $setDate = $_POST['setDate'] ?? null;
        $setDate2 = $_POST['setDate2'] ?? null;

        // Input validation
        if (empty($setDate) || empty($setDate2)) {
            echo json_encode(['success' => false, 'error' => 'Both dates are required.']);
            exit;
        }

        // Validate date format (YYYY-MM-DD)
        if (!preg_match("/^\d{4}-\d{2}-\d{2}$/", $setDate) || !preg_match("/^\d{4}-\d{2}-\d{2}$/", $setDate2)) {
            echo json_encode(['success' => false, 'error' => 'Invalid date format. Use YYYY-MM-DD.']);
            exit;
        }

        // SQL Query to fetch performance and order alphabetically by firstname
        $sql = "SELECT user_table.user_firstname AS firstname,
                       user_table.user_lastname AS lastname,
                       SUM(user_performance.total_sale) AS total_sale,
                       SUM(user_performance.total_disc) AS total_disc
                FROM user_performance
                JOIN user_table ON user_table.user_id = user_performance.user_id
                JOIN user_shifts ON user_shifts.time_id = user_performance.time_id
                WHERE DATE(user_shifts.time_in) BETWEEN ? AND ?
                AND user_table.user_role = 'Cashier'
                GROUP BY user_table.user_id, user_table.user_firstname, user_table.user_lastname
                ORDER BY user_table.user_firstname ASC;";

        // Prepare statement
        $stmt1 = $conn->prepare($sql);

        if (!$stmt1) {
            echo json_encode(['success' => false, 'error' => 'SQL prepare failed: ' . $conn->error]);
            exit;
        }

        // Bind parameters
        $stmt1->bind_param("ss", $setDate, $setDate2);

        // Execute query and fetch results
        if ($stmt1->execute()) {
            $result = $stmt1->get_result();
            $cashier_data = [];

            while ($row = $result->fetch_assoc()) {
                $cashier_data[] = [
                    'firstname' => $row['firstname'],
                    'lastname' => $row['lastname'],
                    'total_sale' => $row['total_sale'],
                    'total_disc' => $row['total_disc']
                ];
            }

            echo json_encode([
                'success' => true,
                'data' => $cashier_data
            ]);
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
