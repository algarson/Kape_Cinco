<?php
    session_start();

    // Check if the user is logged in and if their role is 'admin'
    if (!isset($_SESSION['role'])) {
        header('Location: /Kape_Cinco/frontend/Login/login.html?redirect=Login/admin.php');
        exit;
    }

    if ($_SESSION['role'] === 'Cashier') {
        echo "<script>
                alert('Access denied: You do not have permission to view this content.');
                window.location.href = '/Kape_Cinco/frontend/Home/home.html';
             </script>";
        exit; 
    }

    if ($_SESSION['role'] !== 'Admin') {
        header('Location: /Kape_Cinco/frontend/Login/login.html?redirect=Login/admin.php');
        exit;
    }

    header('Location: /Kape_Cinco/frontend/Admin/admin.html');
    exit;
?>

