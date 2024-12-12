<?php
    include '../server.php'; 

    session_start();
    if (!isset($_SESSION['user'])) {
        http_response_code(401); // Unauthorized
        echo json_encode(['error' => 'Not logged in']);
        exit();
    }

    $userId = $_SESSION['user']['id'];

    // Fetch user data from the database
    $sql = "SELECT `user_image` FROM `user_table` WHERE `user_id` = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('i', $userId);
    $stmt->execute();
    $stmt->bind_result($userImage);
    $stmt->fetch();
    $stmt->close();

    // Check if the user has an image or not
    $imagePath = $userImage ? "/backend/User/" . $userImage : "/frontend/images/kape_cinco.jpg";

    echo json_encode([
        'id' => $_SESSION['user']['id'] ?? null,
        'role' => $_SESSION['user']['role'] ?? 'Unknown',
        'name' => $_SESSION['user']['name'] ?? 'Guest',
        'time_in' => $_SESSION['user']['time_in'] ?? null,
        'user_image' => $imagePath
    ]);
?>

