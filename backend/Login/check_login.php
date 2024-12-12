<?php
    session_start();
    include `../server.php`;

    if (isset($_SESSION['user']) && !empty($_SESSION['user']['id'])) {
        echo json_encode(['loggedIn' => true, 'role' => $_SESSION['user']['role']]);
    } else {
        echo json_encode(['loggedIn' => false]);
    }
?>

