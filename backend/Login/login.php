<?php
// Database connection
$conn = new mysqli("localhost", "root", "", "your_database");

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Simulate user input
$username = "John"; // This could come from $_POST['username'] in a real form

// Use a prepared statement
$sql = "SELECT * FROM `user_table` WHERE `user_username` = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $username);
$stmt->execute();

$result = $stmt->get_result();
if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        echo "User ID: " . $row['user_id'] . " - Username: " . $row['user_username'] . "<br>";
    }
} else {
    echo "No user found.";
}

$stmt->close();
$conn->close();
?>
