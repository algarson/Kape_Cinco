<?php
    session_start();
    include '../server.php';
    // Check if the user is logged in and has a valid role (Admin or Cashier)
    if (!isset($_SESSION['user']['role']) || 
        ($_SESSION['user']['role'] !== 'Admin' && $_SESSION['user']['role'] !== 'Cashier')) {
        // Redirect to login if not logged in or not authorized
        header('Location: /frontend/Login/login.html?redirect=Login/home.php');
        exit;
    }

    // Include the home.html content if the user is valid
    header('Location: /frontend/Home/home.html');
    exit;
?>
