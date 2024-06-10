<?php
    include '../server.php';

    $foodSql = "SELECT * FROM foods_table";
    $foodResult = $conn->query($foodSql);

    $allFoods = [];

    if ($foodResult->num_rows > 0) {
        while ($row = $foodResult->fetch_assoc()){
            $allFoods[] = $row;
        }
    }

    $drinkSql = "SELECT * FROM drinks_table";
    $drinkResult = $conn->query($drinkSql);

    $allDrinks = [];

    if ($drinkResult->num_rows > 0) {
        while ($row = $drinkResult->fetch_assoc()){
            $allDrinks[] = $row;
        }
    }

    $conn->close();

    $allItems = array_merge($allFoods, $allDrinks);

    header('Content-Type: application/json');
    echo json_encode($allItems);


?>