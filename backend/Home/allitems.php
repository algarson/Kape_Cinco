<?php
    include '../server.php';

    // Fetch all foods with their variants
    $foodSql = "
        SELECT f.food_id, f.food_name, f.food_price, f.food_image, f.food_status, v.variant_name, v.variant_price 
        FROM foods_table f
        LEFT JOIN variants_table v ON f.food_id = v.food_id
    ";
    $foodResult = $conn->query($foodSql);

    $allFoods = [];

    if ($foodResult->num_rows > 0) {
        while ($row = $foodResult->fetch_assoc()){
            $food_id = $row['food_id'];

            if (!isset($allFoods[$food_id])) {
                // Initialize food item if it hasn't been added yet
                $allFoods[$food_id] = [
                    'food_id' => $row['food_id'],
                    'food_name' => $row['food_name'],
                    'food_price' => $row['food_price'],
                    'food_image' => $row['food_image'],
                    'food_status' => $row['food_status'],
                    'variants' => []
                ];
            }

            // Add variant to the food item
            if (!empty($row['variant_name'])) {
                $allFoods[$food_id]['variants'][] = [
                    'variant_name' => $row['variant_name'],
                    'variant_price' => $row['variant_price']
                ];
            }
        }
    }

    // Reset array to ensure it is numerically indexed
    $allFoods = array_values($allFoods);

    $conn->close();

    // Output the foods with their variants as JSON
    header('Content-Type: application/json');
    echo json_encode($allFoods);
?>
