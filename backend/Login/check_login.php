<?php
    session_start();

    if (isset($_SESSION['user'])) {
        echo json_encode(['loggedIn' => true, 'role' => $_SESSION['user']['role']]);
    } else {
        echo json_encode(['loggedIn' => false]);
    }
?>
