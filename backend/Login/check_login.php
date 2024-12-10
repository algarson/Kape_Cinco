<?php
    session_start();
    include '/backend/server.php';

    ini_set('display_errors', 1);
    ini_set('display_startup_errors', 1);
    error_reporting(E_ALL);


    if (isset($_SESSION['user']) && !empty($_SESSION['user']['id'])) {
        echo json_encode(['loggedIn' => true, 'role' => $_SESSION['user']['role']]);
    } else {
        echo json_encode(['loggedIn' => false]);
    }
?>

