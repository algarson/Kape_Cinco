<?php
    include '../server.php';

    // Fetch all foods with their variants
    $foodSql = "
        SELECT f.food_id, f.food_name, f.food_price, f.food_desc, f.food_type, f.food_image, f.food_serve_count, f.food_status, v.food_variant_name, v.food_variant_price, v.food_variant_serve_count, v.food_variant_status 
        FROM foods_table f
        LEFT JOIN foods_variant_table v ON f.food_id = v.food_id
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
                    'food_desc' => $row['food_desc'],
                    'food_type' => $row['food_type'],
                    'food_image' => $row['food_image'],
                    'food_serve_count' => $row['food_serve_count'],
                    'food_status' => $row['food_status'],
                    'variants' => []
                ];
            }

            // Add variant to the food item
            if (!empty($row['food_variant_name'])) {
                $allFoods[$food_id]['variants'][] = [
                    'variant_name' => $row['food_variant_name'],
                    'variant_price' => $row['food_variant_price'],
                    'variant_serve_count' => $row['food_variant_serve_count'],
                    'variant_status' => $row['food_variant_status']
                ];
            }
        }
    }

    $drinkSql = " 
        SELECT d.drink_id, d.drink_name, d.drink_price, d.drink_type, d.drink_image, d.drink_serve_count, d.drink_status, dv.drink_variant_name, dv.drink_variant_price, dv.drink_variant_serve_count, dv.drink_variant_status
        FROM drinks_table d
        LEFT JOIN drinks_variant_table dv ON d.drink_id = dv.drink_id; ";
    $drinkResult = $conn->query($drinkSql);

    $allDrinks = [];

    if ($drinkResult->num_rows > 0){
        while ($row = $drinkResult->fetch_assoc()){
            $drink_id = $row['drink_id'];

            if (!isset($allDrinks[$drink_id])) {
                // Initialize drink item if it hasn't been added yet
                $allDrinks[$drink_id] = [
                    'drink_id' => $row['drink_id'],
                    'drink_name' => $row['drink_name'],
                    'drink_price' => $row['drink_price'],
                    'drink_type' => $row['drink_type'],
                    'drink_image' => $row['drink_image'],
                    'drink_serve_count' => $row['drink_serve_count'],
                    'drink_status' => $row['drink_status'],
                    'variants' => []  // Initialize the variants array for drinks
                ];
            }
            
            // Add the variant to the drink item
            if (!empty($row['drink_variant_name'])) {
                $allDrinks[$drink_id]['variants'][] = [
                    'variant_name' => $row['drink_variant_name'],
                    'variant_price' => $row['drink_variant_price'],
                    'variant_serve_count' => $row['drink_variant_serve_count'],
                    'variant_status' => $row['drink_variant_status']
                ];
            }
        }
    }

    $conn->close();

    $allItems = array_merge(array_values($allFoods), $allDrinks);

    header('Content-Type: application/json');
    echo json_encode($allItems);
?>