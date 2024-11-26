<?php
    include '../server.php';

    if ($_SERVER['REQUEST_METHOD'] == 'POST') {
        $username = filter_input(INPUT_POST, 'username', FILTER_SANITIZE_FULL_SPECIAL_CHARS);
        $password = filter_input(INPUT_POST, 'password', FILTER_SANITIZE_FULL_SPECIAL_CHARS);

        $sql = "SELECT * FROM user_table WHERE user_username = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("s", $username);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows > 0) {
            $user = $result->fetch_assoc();

            if (password_verify($password, $user['user_password'])) {
                session_start();
                session_regenerate_id(true);
                $_SESSION['user_id'] = $user['user_id'];
                $_SESSION['role'] = $user['user_role']; 

                echo json_encode(['userExists' => true, 'role' => $user['user_role']]);
                
            } else {
                echo json_encode(['userExists' => false, 'error' => 'Invalid password.']);
            }
        } else {
            echo json_encode(['userExists' => false, 'error' => 'User not found.']);
        }

        $stmt->close();
    }

    $conn->close();
?>

