<?php
    session_start();

    if (isset($_SESSION['admin_id'])) {
        session_destroy();
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false]);
    }
?>
