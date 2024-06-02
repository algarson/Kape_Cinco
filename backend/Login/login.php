<?php
include '../server.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $username = filter_input(INPUT_POST, 'username', FILTER_SANITIZE_FULL_SPECIAL_CHARS);
    $password = filter_input(INPUT_POST, 'password', FILTER_SANITIZE_FULL_SPECIAL_CHARS);

    $sql = "SELECT * FROM admin_table WHERE admin_username = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $admin = $result->fetch_assoc();

        if (password_verify($password, $admin['admin_password'])) {
            session_start();
            $_SESSION['admin_id'] = $admin['admin_id'];
            echo json_encode(['adminExists' => true]);
        } else {
            echo json_encode(['adminExists' => false, 'error' => 'Invalid password.']);
        }
    } else {
        echo json_encode(['adminExists' => false, 'error' => 'User not found.']);
    }

    $stmt->close();
}

$conn->close();
?>

