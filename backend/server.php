<?php
    $servername = "localhost"; 
    $username = "root"; 
    $password = "852963"; 
    $dbname = "kapecinco"; 
    
    $conn = new mysqli($servername, $username, $password, $dbname);
    

    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }

?>