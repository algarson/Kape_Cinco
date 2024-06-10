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
            
            const allItemImage = document.createElement('img');
            if (item.food_image) {
                allItemImage.src = '/Kape_Cinco/backend/images/' + item.food_image;
            } else if (item.drink_image) {
                allItemImage.src = '/Kape_Cinco/backend/images/' + item.drink_image;
            } else {
                allItemImage.src = '/Kape_Cinco/frontend/images/kape_cinco.jpg';
            }
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
            } else if (item.drink_price) {
                allItemPrice.textContent = item.drink_price;
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
            }

            allItem.appendChild(allItemImage);
            allItem.appendChild(allItemInfo);

            allItemInfo.appendChild(allItemPrice);
            allItemInfo.appendChild(viewButton);
    
            allMenuContainer.appendChild(allItem);
        });

        /*
        document.querySelectorAll('.view-button').forEach(button => {
            button.addEventListener('click', (event) => {
                const foodItem = event.target.closest('.menu-item');
                const foodName = foodItem.querySelector('h3').textContent;
                const foodPrice = parseFloat(foodItem.querySelector('p').textContent.replace(' ', '').replace(',', ''));

                addToCart(foodName, foodPrice);
                billsSection.style.display = 'block';
            });
        });
         */
    }

    generateAllItems();

     /*------------------------ END OF GENERATE ALL ITEMS ------------------------------*/

});