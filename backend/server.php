<?php
    $servername = "localhost"; 
    $username = "u645580422_root"; 
    $password = "Horsemendevs@2324"; 
    $dbname = "u645580422_kapecinco"; 
    
    $conn = new mysqli($servername, $username, $password, $dbname);
    

    if ($conn->connect_error) {
        // If connection fails, display the error message
        die("Connection failed: " . $conn->connect_error);
    } else {
        // If connection is successful, display success message
        echo "Connected successfully to the database: " . $dbname;
    }
    
    $sql = "SELECT * FROM user_table WHERE";

    $result = $conn -> query($sql);

    if ($result->num_rows > 0) {
        // Output data of each row
        while($row = $result->fetch_assoc()) {
            echo "ID: " . $row["id"]. " - Name: " . $row["name"]. " - Email: " . $row["email"]. "<br>";
        }
    } else {
        echo "0 results";
    }

?>