<?php
session_start();

if (isset($_SESSION['user']) && !empty($_SESSION['user']['id'])) {
    echo json_encode(['loggedIn' => true, 'role' => $_SESSION['user']['role']]);
} else {
    // Clear the session and session cookie if invalid
    session_unset();
    session_destroy();
    setcookie(session_name(), '', time() - 3600, '/'); // Clear the session cookie
    echo json_encode(['loggedIn' => false]);
}
?>

