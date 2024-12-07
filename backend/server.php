<?php
    $servername = "localhost"; 
    $username = "u645580422_root"; 
    $password = "Horsemendevs@2324"; 
    $dbname = "u645580422_kapecinco"; 
    
    $conn = new mysqli($servername, $username, $password, $dbname);
    

    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }

?>