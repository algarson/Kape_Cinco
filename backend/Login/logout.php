<?php
    session_start();

    if (isset($_SESSION['user_id'])) {
        session_destroy();
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false]);
    }
?>
