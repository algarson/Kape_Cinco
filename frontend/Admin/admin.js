document.addEventListener("DOMContentLoaded", async function () {
    const tableBody = document.getElementById('tableBody');
    const categoryButtons = document.querySelectorAll('.category-nav button');
    const updateModal = document.getElementById('updateModal');
    const addModal = document.getElementById('addModal');
    const deleteModal = document.getElementById('deleteModal');
    const addVariantModal = document.getElementById('addVariantModal');
    const closeButton = document.querySelector('.close-button');
    const inventoryLink = document.getElementById('inventoryLink');
    const statisticsLink = document.getElementById('statisticsLink');
    const mainContent = document.getElementById('mainContent');
    const inventorySection = document.getElementById('inventorySection');
    const statisticsSection = document.getElementById('statisticsSection');
    const statisticsChartElement = document.getElementById('statisticsChart').getContext('2d');
    let statisticsChart; // Variable to hold the chart instance
    const yesButton = document.querySelector('.yes-button');
    const noButton = document.querySelector('.no-button');
    const addButton = document.querySelector('.add-button'); // Add but

    fetch('/Kape_Cinco/backend/Login/check_login.php')
        .then(response => response.json())
        .then(data => {
            if (!data.loggedIn) {
                window.location.href = '/Kape_Cinco/frontend/Login/login.html';
            } else {
                document.body.classList.remove('hidden');
                generateAllItems();
            }
        })
        .catch(error => console.error('Error:', error));
    
    function logout() {
        fetch('/Kape_Cinco/backend/Login/logout.php')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    window.location.href = '/Kape_Cinco/frontend/Login/login.html';
                } else {
                    alert('Logout failed!');
                }
            })
            .catch(error => console.error('Error:', error));
    }

    window.logout = logout;
    
    updateModal.style.display = 'none';
    addButton.addEventListener('click', openAddModal);
    async function fetchAllItems() {
        try {
            const res = await fetch("/Kape_Cinco/backend/Home/allitems.php");
            const data = await res.json();
            return data;
        } catch (err) {
            console.error('Error fetching data:', err);
            return [];
        }
    }
    
    async function generateAllItems() {
        const allItems = await fetchAllItems();
        tableBody.innerHTML = '';

        allItems.forEach(item => {
            const row = createTableRow(item);
            tableBody.appendChild(row);
        });

        filterItems('Foods');  
    }

    function filterItems(category) {
        const descriptionHeader = document.querySelector('.description-header');
        const drinkTypeHeader = document.querySelector('.drinktype-header');

        document.querySelectorAll('tbody tr').forEach(row => {
            const cells = row.cells;
            const itemCategory = row.getAttribute('data-category');

            if (category === 'Drinks') {
                drinkTypeHeader.style.display = '';
                descriptionHeader.style.display = 'none';
                cells[4].style.display = 'none'; 
                cells[2].style.display = '';     

                row.style.display = itemCategory === 'Drinks' ? '' : 'none';
            } else {
                descriptionHeader.style.display = '';
                cells[4].style.display = '';     

                row.style.display = itemCategory === 'Foods' ? '' : 'none';
            }
        });
    }

    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const category = button.getAttribute('data-category');
            filterItems(category);
        });
    });

    function createTableRow(item) {
        const row = document.createElement('tr');

        // Category cell: either 'Silog' or 'Drinks'
        const categoryCell = document.createElement('td');
        categoryCell.textContent = item.food_name ? 'Foods' : 'Drinks';
        row.appendChild(categoryCell);

        // Name cell: either variant dropdown or the default food/drink name
        const nameCell = document.createElement('td');

        if (item.variants && item.variants.length > 0) {
            // Create a dropdown if the item has variants
            const variantSelect = document.createElement('select');
            variantSelect.className = 'variant-select';

            const originalName = item.food_name || item.drink_name;
            const originalPrice = item.food_price || item.drink_price;
            const originalServeCount = item.food_serve_count || item.drink_serve_count;
            
            // Default option with the original food/drink name and price
            const originalOption = document.createElement('option');
            originalOption.value = '';
            originalOption.textContent = originalName;
            originalOption.dataset.price = originalPrice;
            originalOption.dataset.serveCount = originalServeCount;
            variantSelect.appendChild(originalOption);

            // Loop through variants and add them as options
            item.variants.forEach(variant => {
                const option = document.createElement('option');
                option.value = variant.variant_name;
                option.textContent = `${variant.variant_name}`;
                option.dataset.price = variant.variant_price;
                option.dataset.serveCount = variant.variant_serve_count;
                
                // If the variant is unavailable, disable the option
                if (variant.variant_status === "Unavailable") {
                    option.disabled = true;
                    option.textContent += ' (Unavailable)';
                }

                variantSelect.appendChild(option);
            });

            // Add an event listener to update the price when the variant is selected
            variantSelect.addEventListener('change', (event) => {
                const selectedOption = event.target.selectedOptions[0];
                const variantPrice = selectedOption.dataset.price || (item.food_price || item.drink_price);
                const variantServeCount = selectedOption.dataset.serveCount || (item.food_serve_count || item.drink_serve_count);
                serveCell.textContent = variantServeCount;
                priceCell.textContent = `₱${parseFloat(variantPrice)}`;
            });

            nameCell.appendChild(variantSelect); // Add the variant dropdown to the nameCell
        } else {
            // If no variants, just display the default name
            nameCell.textContent = item.food_name || item.drink_name;
        }

        row.appendChild(nameCell);

        const typeCell = document.createElement('td');
        typeCell.textContent = item.food_type || item.drink_type;
        row.appendChild(typeCell);

        const priceCell = document.createElement('td');
        priceCell.textContent = `₱${(item.food_price || item.drink_price)}`;
        row.appendChild(priceCell);

        const descCell = document.createElement('td');
        descCell.textContent = item.food_desc || '';
        row.appendChild(descCell);

        const serveCell = document.createElement('td');
        serveCell.textContent = item.food_serve_count || item.drink_serve_count;
        row.appendChild(serveCell);

        const imageCell = document.createElement('td');
        const image = document.createElement('img') ;
        image.className = "image_item";
        image.src = item.food_image 
                    ? `/Kape_Cinco/backend/images/${item.food_image}`
                    : item.drink_image
                    ? `/Kape_Cinco/backend/images/${item.drink_image}`
                    : '/Kape_Cinco/frontend/images/kape_cinco.jpg';
        imageCell.appendChild(image);
        row.appendChild(imageCell);

        const statusCell = document.createElement('td');
        statusCell.textContent = item.food_status || item.drink_status;
        row.appendChild(statusCell);

        const updateCell = document.createElement('td');
        const updateButton = document.createElement('button');
        const deleteButton = document.createElement('button');
        const addVariantButton = document.createElement('button');
        deleteButton.className = "deletebtn"
        deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>';
        updateButton.className = "updatebtn"
        updateButton.innerHTML = '<i class="fas fa-edit"></i> ';
        addVariantButton.className = "addVariantbtn"
        addVariantButton.innerHTML = '<i class="fa-solid fa-circle-plus"></i>';

        deleteButton.addEventListener('click', () => openDeleteModal(item));
        updateCell.appendChild(deleteButton);
        row.appendChild(updateCell);
        updateButton.addEventListener('click', () => openUpdateModal(item));
        updateCell.appendChild(updateButton);
        row.appendChild(updateCell);
        addVariantButton.addEventListener('click', () => openAddVariantModal(item));
        updateCell.appendChild(addVariantButton);
        row.appendChild(updateCell);
        
        row.setAttribute('data-category', item.food_name ? 'Foods' : 'Drinks');
        return row;
    }
    
    function openAddModal() {   
        addModal.style.display = 'block';
    }

    function openUpdateModal(item) {
        // Set the default values (for food or drink without variants)
        document.getElementById('item_id').value = item.food_id || item.drink_id;
        document.getElementById('item_type').value = item.food_id ? 'food' : 'drink';
        document.getElementById('update_name').value = item.food_name || item.drink_name;
        document.getElementById('update_price').value = item.food_price || item.drink_price;
        document.getElementById('update_type').value = item.food_type || item.drink_type;
        document.getElementById('update_serving').value = item.food_serve_count || item.drink_serve_count;
        
        // If the item has variants, create a dropdown to select variants
        const variantSelect = document.getElementById('variant_select');
        variantSelect.innerHTML = ''; // Clear previous options, if any

        if (item.food_name) {
            document.getElementById('update_description').style.display = 'block';
            document.querySelector('label[for="update_description"]').style.display = 'block';
            document.getElementById('update_description').value = item.food_desc;

        } else {
            document.getElementById('update_description').style.display = 'none';
            document.querySelector('label[for="update_description"]').style.display = 'none';
        }

        if (item.variants && item.variants.length > 0) {

            document.getElementById('variant_select').style.display = 'block';
            document.querySelector('label[for="variant_select"]').style.display = 'block';

            // Create a default option (no variant selected)
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = `${item.food_name || item.drink_name}`;
            variantSelect.appendChild(defaultOption);

            // Loop through the variants and add them to the dropdown
            item.variants.forEach(variant => {
                const option = document.createElement('option');
                option.value = variant.variant_name;
                option.textContent = `${variant.variant_name}`;
                option.dataset.price = variant.variant_price;
                option.dataset.serveCount = variant.variant_serve_count;
                variantSelect.appendChild(option);
            });

            // Add an event listener to update fields when a variant is selected
            variantSelect.addEventListener('change', (event) => {
                const selectedOption = event.target.selectedOptions[0];
                if (selectedOption.value) {
                    // Update the modal fields with the selected variant's data
                    document.getElementById('update_name').value = selectedOption.value;
                    document.getElementById('update_price').value = selectedOption.dataset.price;
                    document.getElementById('update_serving').value = selectedOption.dataset.serveCount;

                    document.getElementById('is_variant').value = 'true';
                    document.getElementById('variant_name').value = selectedOption.value;
                } else {
                    // Reset to original item details if no variant is selected
                    document.getElementById('update_name').value = item.food_name || item.drink_name;
                    document.getElementById('update_price').value = item.food_price || item.drink_price;
                    document.getElementById('update_type').value = item.food_type || item.drink_type;
                    document.getElementById('update_serving').value = item.food_serve_count || item.drink_serve_count;

                    document.getElementById('is_variant').value = '';
                    document.getElementById('variant_name').value = '';
                    
                }
            });
        } else {
            document.getElementById('variant_select').style.display = 'none';
            document.querySelector('label[for="variant_select"]').style.display = 'none';
        }
        updateModal.style.display = 'block';
    }

    function openDeleteModal(item) {
        document.getElementById('item_id').value = item.food_id || item.drink_id;
        document.getElementById('item_type').value = item.food_id ? 'food' : 'drink';

        yesButton.onclick = async () => {
            try {
                const response = await fetch('/Kape_Cinco/backend/Admin/delete_item.php', {
                    method: 'POST',
                    body: JSON.stringify({
                        id: item.food_id || item.drink_id,
                        type: item.food_id ? 'food' : 'drink'
                    }),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                const result = await response.json();
                if (result.success) {
                    alert('Item deleted successfully');
                    deleteModal.style.display = 'none';
                    await generateAllItems();
                } else {
                    alert('Delete failed: ' + result.message);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred while deleting the item.');
            }
        };
        
        deleteModal.style.display = 'block';
    }

    function openAddVariantModal(item){
        document.getElementById('variant_item_id').value = item.food_id || item.drink_id;
        document.getElementById('variant_item_type').value = item.food_id ? 'food' : 'drink';
        document.getElementById('item_name').textContent = item.food_name || item.drink_name;
        addVariantModal.style.display = 'block';
    }
    
    noButton.addEventListener('click', function () {
        deleteModal.style.display = 'none';
    });

    document.getElementById('updateForm').addEventListener('submit', async (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        console.log('Form submitted');
        for (const pair of formData.entries()) {
            console.log(pair[0] + ', ' + pair[1]);
        }

        try {
            const response = await fetch('/Kape_Cinco/backend/Admin/update_item.php', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const responseData = await response.json();
                if (responseData.success) {
                    updateModal.style.display = 'none';
                    await generateAllItems();
                    document.getElementById('updateForm').reset();
                } else {
                    alert('Update failed!');
                }
            } else {
                alert('Update request failed!');
            }
        } catch (error) {
            console.error('Error updating item:', error);
            alert('An error occurred during the update.');
        }
    });

    document.getElementById('addForm').addEventListener('submit', async (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const serveCount = parseInt(formData.get('add_serving'), 10);
    
        if (serveCount < 1) {
            alert('Serving count must be at least 1.');
            return; 
        }
    
        try {
            const response = await fetch('/Kape_Cinco/backend/Admin/add_item.php', {
                method: 'POST',
                body: formData
            });
            const result = await response.json();
            if (result.success) {
                alert('Item added successfully');
                addModal.style.display = 'none';
                await generateAllItems();
                document.getElementById('addForm').reset();
            } else {
                alert('Add failed: ' + result.message);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while adding the item.');
        }
    });

    document.getElementById('addVariantForm').addEventListener('submit', async (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        for (const pair of formData.entries()) {
            console.log(pair[0] + ', ' + pair[1]);
        }

        const serveCount = parseInt(formData.get('add_variant_serving'), 10);
    
        if (serveCount < 1) {
            alert('Serving count must be at least 1.');
            return; 
        }
    
        try {
            const response = await fetch('/Kape_Cinco/backend/Admin/add_variant_item.php', {
                method: 'POST',
                body: formData
            });
            const result = await response.json();
            if (result.success) {
                alert('Item added successfully');
                addVariantModal.style.display = 'none';
                await generateAllItems();
                document.getElementById('addVariantForm').reset();
            } else {
                alert('Add failed: ' + result.message);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while adding the item.');
        }
    });

    document.getElementById('add_category').addEventListener('change', function() {
        const descriptionContainer = document.getElementById('description_container');
        const selectedCategory = this.value;
    
        // Hide the description field if category is 'drink'
        if (selectedCategory === 'drink') {
            descriptionContainer.style.display = 'none';
        } else {
            descriptionContainer.style.display = 'flex';
        }
    });

    document.querySelectorAll('.close-button').forEach(button => {
        button.addEventListener('click', function () {
            button.parentElement.parentElement.style.display = 'none';
        });
    });
    // Event listener for the "Add" button to open the addModal
    
     // Add event listeners for navigation links
     inventoryLink.addEventListener('click', () => {
        inventoryLink.classList.add('active');
        statisticsLink.classList.remove('active');
        inventorySection.style.display = '';
        statisticsSection.style.display = 'none';
        document.body.classList.add('inventory-active');
        filterItems('Foods');  // Set default category to Foods on inventory section load
    });

    statisticsLink.addEventListener('click', () => {
        inventoryLink.classList.remove('active');
        statisticsLink.classList.add('active');
        inventorySection.style.display = 'none';
        statisticsSection.style.display = '';
        document.body.classList.remove('inventory-active');
    });


    inventoryLink.addEventListener('click', () => {
        inventoryLink.classList.add('active');
        statisticsLink.classList.remove('active');
        inventorySection.style.display = '';
        statisticsSection.style.display = 'none';
    });

    statisticsLink.addEventListener('click', () => {
        inventoryLink.classList.remove('active');
        statisticsLink.classList.add('active');
        inventorySection.style.display = 'none';
        statisticsSection.style.display = '';
        generateStatisticsChart('weekly'); // Default to weekly view
    });

     // Event listener for weekly button
     document.getElementById('weeklyBtn').addEventListener('click', () => {
        generateStatisticsChart('weekly');
    });

    // Event listener for monthly button
    document.getElementById('monthlyBtn').addEventListener('click', () => {
        generateStatisticsChart('monthly');
    });

    // Event listener for yearly button
    document.getElementById('yearlyBtn').addEventListener('click', () => {
        generateStatisticsChart('yearly');
    });

    // Set default view on page load
    inventoryLink.click();

    function generateStatisticsChart(timeframe = 'weekly') {
        let chartData = {};

        switch (timeframe) {
            case 'weekly':
                chartData = {
                    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                    datasets: [
                        {
                            label: 'Revenue',
                            data: [1000, 1500, 2000, 2500],
                            backgroundColor: 'rgba(75, 192, 192, 0.2)',
                            borderColor: 'rgba(75, 192, 192, 1)',
                            borderWidth: 1
                        },
                        {
                            label: 'Expenses',
                            data: [400, 600, 800, 1000],
                            backgroundColor: 'rgba(255, 99, 132, 0.2)',
                            borderColor: 'rgba(255, 99, 132, 1)',
                            borderWidth: 1
                        },
                        {
                            label: 'Profit',
                            data: [600, 900, 1200, 1500],
                            backgroundColor: 'rgba(54, 162, 235, 0.2)',
                            borderColor: 'rgba(54, 162, 235, 1)',
                            borderWidth: 1
                        }
                    ]
                };
                break;
                case 'monthly':
                    chartData = {
                        labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
                        datasets: [
                            {
                                label: 'Revenue',
                                data: [1200, 1500, 1800, 1900, 2200, 2500, 2800, 3000, 2700, 2400, 2100, 1800],
                                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                                borderColor: 'rgba(75, 192, 192, 1)',
                                borderWidth: 1
                            },
                            {
                                label: 'Expenses',
                                data: [400, 500, 600, 700, 800, 900, 1000, 1100, 1000, 900, 800, 700],
                                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                                borderColor: 'rgba(255, 99, 132, 1)',
                                borderWidth: 1
                            },
                            {
                                label: 'Profit',
                                data: [800, 1000, 1200, 1200, 1400, 1600, 1800, 1900, 1700, 1500, 1300, 1100],
                                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                                borderColor: 'rgba(54, 162, 235, 1)',
                                borderWidth: 1
                            }
                        ]
                    };
                    break;

                    case 'yearly':
                        chartData = {
                            labels: ['2020', '2021', '2022', '2023', '2024'],
                            datasets: [
                                {
                                    label: 'Revenue',
                                    data: [15000, 18000, 20000, 22000, 25000],
                                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                                    borderColor: 'rgba(75, 192, 192, 1)',
                                    borderWidth: 1
                                },
                                {
                                    label: 'Expenses',
                                    data: [6000, 7000, 8000, 9000, 10000],
                                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                                    borderColor: 'rgba(255, 99, 132, 1)',
                                    borderWidth: 1
                                },
                                {
                                    label: 'Profit',
                                    data: [9000, 11000, 12000, 13000, 15000],
                                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                                    borderColor: 'rgba(54, 162, 235, 1)',
                                    borderWidth: 1
                                }
                            ]
                        };
                        break;

            default:
                chartData = {}; // Handle unexpected cases
        }

        const chartOptions = {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        };

        // Replace existing chart with new chart based on selected timeframe
        if (statisticsChart) {
            statisticsChart.destroy(); // Destroy existing chart instance
        }
        statisticsChart = new Chart(statisticsChartElement, {
            type: 'bar',
            data: chartData,
            options: chartOptions
        });
    }


    // Set default view on page load
    inventoryLink.click();
});
