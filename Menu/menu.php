<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Sharp"
      rel="stylesheet">
    <title>Menu</title>
    <link rel="stylesheet" href="menu.css">
</head>
<body>
    <header>
        <div class="Top-header">
            <div class="top-header-left">
                <img src="/images/kape_cinco.jpg" alt="Cinco Logo" style="height:40px; width:40px; border-radius:5rem;">
            </div>
            <div class="top-header-mid">
                <h1>Menu</h1>
            </div>
            <div class="top-header-right">
                <span class="material-icons-sharp">fastfood</span>
            </div>
        </div>

        <div class="search-container">
            <div class="search-left">
                <span class="material-icons-sharp">search</span>
            </div>
            <div class="search-right"><input type="text" placeholder="Search"> 
            </div>
        </div>
        <nav class="category-nav">
            <button class="active">All</button>
            <button>Meals</button>
            <button>Drinks</button>
            <button>Dessert</button>
        </nav>
    </header>
    <main class="menu-container">
        <div class="menu-item">
            <img src="/images/Hotsilog.jpg" alt="Hotsilog">
            <div class="menu-info">
                <h2>Hotsilog</h2>
                <p>Egg, Hotdog, Garlic rice Slice of Cucumber & Tomato</p>
                <span class="price">₱120.00</span>
            </div>
            <button class="view-button">View</button>
        </div>
        <div class="menu-item">
            <img src="/images/Porksilog.jpg" alt="Hotsilog">  
            <div class="menu-info">
                <h2>Porksilog</h2>
                <p>Egg, Hotdog, Garlic rice Slice of Cucumber & Tomato</p>
                <span class="price">₱140.00</span>
            </div>
            <button class="view-button">View</button>
        </div>
        <div class="menu-item">
            <img src="/images/lagkit.jpg" alt="Hotsilog">
            <div class="menu-info">
                <h2>Kakanin</h2>
                <p>Egg, Hotdog, Garlic rice Slice of Cucumber & Tomato</p>
                <span class="price">₱80.00</span>
            </div>
            <button class="view-button">View</button>
        </div>
        <div class="menu-item">
            <img src="/images/KareKare.jpg" alt="Hotsilog">
            <div class="menu-info">
                <h2>Kare Kare</h2>
                <p>Egg, Hotdog, Garlic rice Slice of Cucumber & Tomato</p>
                <span class="price">₱120.00</span>
            </div>
            <button class="view-button">View</button>
        </div>
        <div class="menu-item">
            <img src="/images/Kape.jpg" alt="Hotsilog">
            <div class="menu-info">
                <h2>Kape</h2>
                <p>Egg, Hotdog, Garlic rice Slice of Cucumber & Tomato</p>
                <span class="price">₱60.00</span>
            </div>
            <button class="view-button">View</button>
        </div>

        <!-- Repeat .menu-item as needed -->
    </main>
</body>
</html>
