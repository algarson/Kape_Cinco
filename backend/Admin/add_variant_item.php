<?php
include '../server.php';

$response = ['success' => false, 'message' => ''];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $itemId = $_POST['item_id'];
    $item_type = $_POST['item_type'];
    $variantName = $_POST['add_variant_name'];
    $variantPrice = $_POST['add_variant_price'];
    $variantServeCount = $_POST['add_variant_serving'];

    // Predefine the status based on the serve count
    $variantStatus = ($variantServeCount > 0) ? 'Available' : 'Unavailable';

    $variantTable = ($item_type === 'food') ? 'foods_variant_table' : 'drinks_variant_table';
    $variantIdColumn = ($item_type === 'food') ? 'food_id' : 'drink_id';
    $variantNameColumn = ($item_type === 'food') ? 'food_variant_name' : 'drink_variant_name';
    $variantPriceColumn = ($item_type === 'food') ? 'food_variant_price' : 'drink_variant_price';
    $variantServeCountColumn = ($item_type === 'food') ? 'food_variant_serve_count' : 'drink_variant_serve_count';
    $variantStatusColumn = ($item_type === 'food') ? 'food_variant_status' : 'drink_variant_status';

    $sql = "INSERT INTO $variantTable ($variantIdColumn, $variantNameColumn, $variantPriceColumn, $variantServeCountColumn, $variantStatusColumn) 
                VALUES (?, ?, ?, ?, ?)";

    // Prepare the SQL statement
    if ($stmt = $conn->prepare($sql)) {
        $stmt->bind_param('isdis', $itemId, $variantName, $variantPrice, $variantServeCount, $variantStatus);

        // Execute the statement
        if ($stmt->execute()) {
            $response['success'] = true;
            $response['message'] = 'Variant added successfully';
        } else {
            $response['message'] = 'Failed to insert variant';
        }
        $stmt->close();
    } else {
        $response['message'] = 'Database error: could not prepare query';
    }
} else {
    $response['message'] = 'Invalid request method';
}

echo json_encode($response);
?>
