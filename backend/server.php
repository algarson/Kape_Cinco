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
        echo "Connected";
    }

?>