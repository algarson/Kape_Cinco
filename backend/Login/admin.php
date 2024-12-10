<?php
    session_start();
    include '../server.php';
    // Check if the user is logged in
    if (!isset($_SESSION['user']['role'])) {
        header(`Location: /frontend/Login/login.html?redirect=Login/admin.php`);
        exit;
    }

    // Check if the user role is not Admin
    if ($_SESSION['user']['role'] === 'Cashier') {
        echo "<script>
                alert(`Access denied: You do not have permission to view this content.`);
                window.location.href = '/frontend/Home/home.html';
            </script>";
        exit; 
    }

    if ($_SESSION['user']['role'] !== 'Admin') {
        header(`Location: /frontend/Login/login.html?redirect=Login/admin.php`);
        exit;
    }

    // Redirect to the admin page
    header(`Location: /frontend/Admin/admin.html`);
    exit;
?>