document.addEventListener('DOMContentLoaded', async function () {
    const allMenuContainer = document.getElementById('AllMenuContainer');

    async function fetchAllItems() {
        try {
            const res = await fetch("/Kape_Cinco/backend/QR/QRAllItems.php");
            const data = await res.json();
            return data;
        } catch (err) {
            console.error('Error fetching data:', err);
            return [];
        }
    }

    async function generateAllItems() {
        const allItems = await fetchAllItems();

        allMenuContainer.innerHTML = '';

        allItems.forEach(item => {
            const allItem = document.createElement('div');
            allItem.className = "menu-item";
            
            if (item.food_name) {
                allItem.setAttribute('data-category', 'Meals');
            } else if (item.drink_name) {
                allItem.setAttribute('data-category', 'Drinks');
            }
            
            const allItemImage = document.createElement('img');
            let imagePath;

            if (item.food_image) {
                imagePath = 'food_image=' + item.food_image;
            } else if (item.drink_image) {
                imagePath = 'drink_image=' + item.drink_image;
            } else {
                imagePath = 'default_image';
            }

            allItemImage.src = imagePath.includes('food_image') ? `/Kape_Cinco/backend/images/${item.food_image}` :
                              imagePath.includes('drink_image') ? `/Kape_Cinco/backend/images/${item.drink_image}` :
                              '/Kape_Cinco/frontend/images/kape_cinco.jpg';
            allItemImage.className = 'all-item-image';
            
            const allItemInfo = document.createElement('div');
            allItemInfo.className = "menu-info";
            
            //----------------------- MENU-INFO CONTAINER --------------------------//
            const allItemName = document.createElement('h2');
            if (item.food_name) {
                allItemName.textContent = item.food_name;
                allItemInfo.appendChild(allItemName);
            } else if (item.drink_name) {
                allItemName.textContent = item.drink_name;
                allItemInfo.appendChild(allItemName);
            }

            const allItemPrice = document.createElement('span');
            allItemPrice.className = "price"; 
            if (item.food_price) {
                allItemPrice.textContent = item.food_price;
                allItemInfo.appendChild(allItemPrice);
            } else if (item.drink_price) {
                allItemPrice.textContent = item.drink_price;
                allItemInfo.appendChild(allItemPrice);
            }
            
            if (item.food_desc) {
                const foodDesc = document.createElement('p');
                foodDesc.textContent = item.food_desc;
                allItemInfo.appendChild(foodDesc);
            }

            const viewButton = document.createElement('button');
            viewButton.className = 'view-button';
            viewButton.textContent = 'View'; 
    
            if (item.food_status === 'Unavailable' || item.drink_status === 'Unavailable') {
                allItemImage.style.opacity = '0.5';
                viewButton.disabled = true;
                viewButton.style.cursor = 'not-allowed';
            } else {
                viewButton.addEventListener('click', () => {
                    const params = new URLSearchParams({
                        image: item.food_image || item.drink_image || 'default_image',
                        name: item.food_name || item.drink_name,
                        desc: item.food_desc || '',
                        price: item.food_price || item.drink_price
                    });
                    window.location.href = `/Kape_Cinco/frontend/Menu/view.html?${params.toString()}`;
                });
            }

            allItem.appendChild(allItemImage);
            allItem.appendChild(allItemInfo);
            allItem.appendChild(viewButton);
    
            allMenuContainer.appendChild(allItem);
        });
    }

    generateAllItems();

    //------------------------ END OF GENERATE ALL ITEMS ------------------------------//

    document.querySelectorAll('.category-nav button').forEach(button => {
        button.addEventListener('click', () => {

            // Remove 'active' class from all category buttons
            document.querySelectorAll('.category-nav button').forEach(btn => {
                btn.classList.remove('active');
            });

            // Add 'active' class to the clicked category button
            button.classList.add('active');

            // Filter food items based on category
            const category = button.textContent.trim();
            if (category === 'All') {
                document.querySelectorAll('.menu-item').forEach(item => {
                    item.style.display = 'block';
                });
            } else {
                document.querySelectorAll('.menu-item').forEach(item => {
                    if (item.getAttribute('data-category') === category) {
                        item.style.display = 'block';
                    } else {
                        item.style.display = 'none';
                    }
                });
            }
        });
    });

});