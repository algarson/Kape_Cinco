<?php
    $servername = "localhost"; 
    $username = "root"; 
    $password = "admin123"; 
    $dbname = "kapecinco"; 
    
    $conn = new mysqli($servername, $username, $password, $dbname);
    

    if ($conn->connect_error) {
        // If connection fails, display the error message
        die("Connection failed: " . $conn->connect_error);
    }

?>