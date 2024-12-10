<?php
include '/backend/server.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $username = filter_input(INPUT_POST, 'admin_username', FILTER_SANITIZE_FULL_SPECIAL_CHARS);
    $password = filter_input(INPUT_POST, 'admin_password', FILTER_SANITIZE_FULL_SPECIAL_CHARS);


    $hashedPassword = password_hash($password, PASSWORD_BCRYPT);

    $sql = "INSERT INTO admin_table (admin_username, admin_password) VALUES (?,?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ss", $username, $hashedPassword);

    if ($stmt->execute()) {
        echo json_encode(["message" => "Successfully Registered"]);
    }  else {
            echo json_encode(["error" => $stmt->error]);
    }

    $stmt->close();

}

$conn->close();
?>