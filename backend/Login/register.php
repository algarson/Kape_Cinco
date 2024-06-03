<?php
include '/backend/server.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $username = $_POST['admin_username'];
    $password = $_POST['admin_password'];


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