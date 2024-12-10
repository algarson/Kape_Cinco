<?php
// Assuming you already have a MySQLi connection in $conn
include('/backend/server.php');

$sql = "SELECT * FROM `user_table`";
if ($stmt = $conn->prepare($sql)) {
    // Execute the query
    $stmt->execute();
    
    // Get the result
    $result = $stmt->get_result();
    
    // Display data in an HTML table
    echo "<table border='1'>";
    echo "<tr><th>ID</th><th>Username</th><th>Email</th></tr>";
    
    // Fetch and display each row
    while ($row = $result->fetch_assoc()) {
        echo "<tr>";
        echo "<td>" . $row['user_id'] . "</td>";
        echo "<td>" . $row['user_firstname'] . "</td>";
        echo "<td>" . $row['user_lastname'] . "</td>";
        echo "<td>" . $row['user_username'] . "</td>";
        echo "<td>" . $row['user_paswword'] . "</td>";
        echo "<td>" . $row['user_role'] . "</td>";
        echo "</tr>";
    }
    
    echo "</table>";
    
    // Close the statement
    $stmt->close();
}

// Close the connection
$conn->close();
?>
