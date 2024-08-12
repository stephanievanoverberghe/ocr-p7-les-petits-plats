import { fetchRecipes } from "./api.min.js";
import { Recipe } from "./recipe.min.js";

// Global variables to hold recipes
let recipes = [];
const dropdownsData = [
    { id: 'ingredients', label: 'Ingrédients' },
    { id: 'appliances', label: 'Appareils' },
    { id: 'ustensils', label: 'Ustensiles' }
];

// Function to generate dropdown HTML structure
const generateDropdown = ({ id, label }) => {
    return `
        <div class="dropdown-container relative inline-block w-full pb-2 text-left lg:max-w-56 lg:pb-0">
            <div class="flex flex-col justify-between">
                <button type="button"
                    class="dropdown-button mr-16 inline-flex w-full cursor-pointer items-center justify-between rounded-xl bg-white p-4">
                    ${label}
                    <i class="fa-solid fa-chevron-down arrow-icon transition-transform duration-300"></i>
                </button>
            </div>
            <div class="dropdown dropdown-panel absolute left-0 z-50 mt-0 hidden w-full origin-top transform rounded-b-xl border-t-0 border-gray-300 bg-white shadow-lg transition-all duration-300 ease-in-out">
                <div class="py-2">
                    <div class="relative mb-2 flex items-center px-4">
                        <input type="text" class="search-input w-full rounded-sm border border-color-site-400 px-3 py-2"
                            placeholder="Recherchez" />
                        <button class="clear-search-input absolute right-11 hidden p-2 text-color-site-300">
                            <i class="fas fa-times fa-xs"></i>
                        </button>
                        <div class="absolute right-7 flex items-center">
                            <i class="fa-solid fa-magnifying-glass text-color-site-300"></i>
                        </div>
                    </div>
                    <select multiple class="no-scrollbar dropdown-select h-40 w-full border-0 focus:outline-none focus:ring-0"
                        id="${id}-select"></select>
                </div>
            </div>
        </div>
    `;
};

// Function to render dropdowns
const renderDropdowns = () => {
    const dropdownsContainer = document.querySelector('#dropdowns-container');
    dropdownsData.forEach(data => {
        dropdownsContainer.innerHTML += generateDropdown(data);
    });
};

/**
 * Fetch and initialize recipes.
 */
const main = async () => {
    try {
        const recipesData = await fetchRecipes('src/data/recipes.json');
        if (recipesData && recipesData.recipes) {
            recipes = recipesData.recipes.map(data => new Recipe(data));
            updateRecipeCount(recipes.length);
            renderDropdowns();
            displayRecipes(recipes);
            populateSelects();

            document.querySelector('#search').addEventListener('input', (event) => filterRecipes(event.target.value));
            document.querySelector('#clear-button').addEventListener('click', () => {
                document.querySelector('#search').value = '';
                filterRecipes('');
            });

            // Initialize dropdowns
            document.querySelectorAll('.dropdown-container').forEach(setupDropdown);
        } else {
            console.error('No recipes found in the data');
        }
    } catch (error) {
        console.error('Error in main:', error);
    }
};

/**
 * Display recipes in the DOM.
 * @param {Array} recipes - The list of recipes to display.
 */
const displayRecipes = recipes => {
    const recipesContainer = document.querySelector('#recipes-container');
    recipesContainer.innerHTML = '';

    recipes.forEach(recipe => {
        const recipeCard = document.createElement('article');
        recipeCard.classList.add('relative', 'flex', 'flex-col', 'overflow-hidden', 'rounded-3xl', 'bg-white', 'shadow-lg');
        const imageNameWithoutExt = recipe.image.split('.').slice(0, -1).join('.');
        recipeCard.innerHTML = `
            <picture>
                <source data-srcset="dist/assets/img/${imageNameWithoutExt}.webp" type="image/webp">
                <img data-src="dist/assets/img/${imageNameWithoutExt}.webp" alt="${recipe.name}" class="h-64 w-full object-cover lazyload"/>
            </picture>
            <div class="absolute right-4 top-4 rounded-xl bg-yellow-400 px-4 py-1 text-xs text-color-site-100">${recipe.time}min</div>
            <div class="flex flex-grow flex-col px-6 pb-16 pt-8">
                <h2 class="mb-7 font-anton text-lg font-bold">${recipe.name}</h2>
                <h3 class="mb-2 text-sm font-bold uppercase tracking-wide text-color-site-300">Recette</h3>
                <p class="mb-8 flex-grow text-gray-700 line-clamp-4">${truncateDescription(recipe.description)}</p>
                <h3 class="mb-4 text-sm font-bold uppercase tracking-wide text-color-site-300">Ingrédients</h3>
                <div class="grid grid-cols-2 gap-y-5">
                    ${recipe.ingredients.map(ingredient => `
                        <div class="flex flex-col text-sm">
                            <span class="font-medium">${ingredient.ingredient}</span>
                            <span class="text-color-site-300">${ingredient.quantity || ''} ${ingredient.unit || ''}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        recipesContainer.appendChild(recipeCard);
    });

    // Trigger lazy loading
    if ('IntersectionObserver' in window) {
        let lazyImages = document.querySelectorAll('img.lazyload');
        let observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    let img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazyload');
                    observer.unobserve(img);
                }
            });
        });

        lazyImages.forEach(img => {
            observer.observe(img);
        });
    } else {
        // Fallback for older browsers
        let lazyImages = document.querySelectorAll('img.lazyload');
        lazyImages.forEach(img => {
            img.src = img.dataset.src;
            img.classList.remove('lazyload');
        });
    }
};

/**
 * Update the recipe count display.
 * @param {number} count - The number of recipes.
 */
const updateRecipeCount = count => {
    const recipeCountElement = document.querySelector('#recipe-count');
    recipeCountElement.textContent = count === 0 ? `00 recette` : `${count.toString().padStart(2, '0')} recettes`;
};

/**
 * Truncate the description to a specified number of lines.
 * @param {string} description - The description to truncate.
 * @param {number} [maxLines=4] - The maximum number of lines.
 * @returns {string} - The truncated description.
 */
const truncateDescription = (description, maxLines = 4) => {
    const lines = description.split('\n');
    return lines.length <= maxLines ? description : lines.slice(0, maxLines).join(' ') + '...';
};

/**
 * Populate the select elements with ingredients, appliances, and utensils.
 */
const populateSelects = () => {
    const ingredients = new Set();
    const appliances = new Set();
    const ustensils = new Set();

    recipes.forEach(recipe => {
        recipe.ingredients.forEach(ingredient => ingredients.add(ingredient.ingredient));
        appliances.add(recipe.appliance);
        recipe.ustensils.forEach(ustensil => ustensils.add(ustensil));
    });

    populateSelect('#ingredients-select', ingredients);
    populateSelect('#appliances-select', appliances);
    populateSelect('#ustensils-select', ustensils);
};

/**
 * Populate a select element with items.
 * @param {string} selectId - The ID of the select element.
 * @param {Set} items - The items to populate the select with.
 */
const populateSelect = (selectId, items) => {
    const select = document.querySelector(selectId);
    select.innerHTML = '';
    items.forEach(item => {
        const option = document.createElement('option');
        option.value = item;
        option.textContent = item;
        option.classList.add('py-2', 'capitalize-first-letter');
        select.appendChild(option);
    });
};

/**
 * Filter recipes based on the search query.
 * @param {string} query - The search query.
 */
const filterRecipes = query => {
    const filteredRecipes = recipes.filter(recipe =>
        recipe.name.toLowerCase().includes(query.toLowerCase()) ||
        recipe.ingredients.some(ingredient => ingredient.ingredient.toLowerCase().includes(query.toLowerCase()))
    );
    updateRecipeCount(filteredRecipes.length);
    displayRecipes(filteredRecipes);
};

// Initialize the application
main();
