import { fetchRecipes } from "./api.min.js";
import { Recipe } from "./recipe.min.js";

// Global variables to hold recipes and selected items
let recipes = [];
let selectedItems = {
    ingredients: new Set(),
    appliances: new Set(),
    ustensils: new Set()
};

/**
 * Escape HTML characters to prevent XSS attacks.
 * @param {string} unsafe - The unsafe string to escape.
 * @returns {string} - The escaped string.
 */
const escapeHtml = unsafe => {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return unsafe.replace(/[&<>"']/g, m => map[m]);
};

/**
 * Perform a search on recipes using functional programming.
 * @param {string} query - The search query.
 * @param {Array} recipes - The list of recipes.
 * @returns {Array} - The filtered list of recipes.
 */
const searchRecipesFunctional = (query, recipes) => {
    const lowerCaseQuery = query.toLowerCase();
    return recipes.filter(recipe => matchesQuery(lowerCaseQuery, recipe));
};

/**
 * Check if a recipe matches the search query.
 * @param {string} query - The search query.
 * @param {Object} recipe - The recipe object.
 * @returns {boolean} - True if the recipe matches the query, false otherwise.
 */
const matchesQuery = (query, recipe) => {
    return recipe.name.toLowerCase().includes(query) ||
        recipe.ingredients.map(ing => ing.ingredient.toLowerCase()).join(' ').includes(query) ||
        recipe.description.toLowerCase().includes(query);
};

/**
 * Check if a recipe matches the selected items.
 * @param {Object} recipe - The recipe object.
 * @param {Object} selectedItems - The selected items.
 * @returns {boolean} - True if the recipe matches the selected items, false otherwise.
 */
const matchesSelectedItems = (recipe, selectedItems) => {
    return matchesAllItems(recipe.ingredients, selectedItems.ingredients, 'ingredient') &&
        matchesSingleItem(recipe.appliance, selectedItems.appliances) &&
        matchesAllItems(recipe.ustensils, selectedItems.ustensils);
};

const matchesAllItems = (recipeItems, selectedItems, key) => {
    return Array.from(selectedItems).every(item =>
        recipeItems.some(ing => (key ? ing[key] : ing).toLowerCase() === item.toLowerCase())
    );
};

const matchesSingleItem = (recipeItem, selectedItems) => {
    return selectedItems.size === 0 || selectedItems.has(recipeItem.toLowerCase());
};

/**
 * Fetch and initialize recipes.
 */
const main = async () => {
    try {
        const data = await fetchRecipes('src/data/recipes.json');

        if (data && data.recipes) {
            recipes = data.recipes.map(recipe => new Recipe(recipe));
            updateRecipeCount(recipes.length);
            displayRecipes(recipes);
            populateSelects();

            document.querySelector('#search').addEventListener('input', (event) => filterRecipes(event.target.value));
            document.querySelector('#clear-button').addEventListener('click', () => {
                document.querySelector('#search').value = '';
                filterRecipes('');
            });

            addSelectEventListeners();
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
    recipesContainer.innerHTML = recipes.map(recipe => createRecipeCard(recipe)).join('');
};

const createRecipeCard = recipe => `
    <article class="relative flex flex-col overflow-hidden rounded-3xl bg-white shadow-lg">
        <img src="src/assets/img/${recipe.image}" alt="${escapeHtml(recipe.name)}" class="h-64 w-full object-cover"/>
        <div class="absolute right-4 top-4 rounded-xl bg-yellow-400 px-4 py-1 text-xs text-color-site-100">${recipe.time}min</div>
        <div class="flex flex-grow flex-col px-6 pb-16 pt-8">
            <h2 class="mb-7 font-anton text-lg font-bold">${escapeHtml(recipe.name)}</h2>
            <h3 class="mb-2 text-sm font-bold uppercase tracking-wide text-color-site-300">Recette</h3>
            <p class="mb-8 flex-grow text-gray-700 line-clamp-4">${escapeHtml(truncateDescription(recipe.description))}</p>
            <h3 class="mb-4 text-sm font-bold uppercase tracking-wide text-color-site-300">Ingrédients</h3>
            <div class="grid grid-cols-2 gap-y-5">
                ${recipe.ingredients.map(ingredient => `
                    <div class="flex flex-col text-sm">
                        <span class="font-medium">${escapeHtml(ingredient.ingredient)}</span>
                        <span class="text-color-site-300">${ingredient.quantity || ''} ${ingredient.unit || ''}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    </article>
`;

/**
 * Filter the recipes based on the search query and selected items.
 * @param {string} query - The search query.
 */
const filterRecipes = query => {
    const filteredRecipes = searchRecipesFunctional(query, recipes)
        .filter(recipe => matchesSelectedItems(recipe, selectedItems));
    updateRecipeCount(filteredRecipes.length);
    displayRecipes(filteredRecipes);
};

/**
 * Update the recipe count display.
 * @param {number} count - The number of recipes.
 */
const updateRecipeCount = count => {
    const recipeCountElement = document.querySelector('#recipe-count');
    let countText;

    if (count === 0) {
        countText = '00 recette';
    } else if (count === 1) {
        countText = '01 recette';
    } else {
        countText = `${count.toString().padStart(2, '0')} recettes`;
    }

    recipeCountElement.textContent = countText;
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
        addItemsToSet(ingredients, recipe.ingredients, 'ingredient');
        appliances.add(recipe.appliance);
        addItemsToSet(ustensils, recipe.ustensils);
    });

    populateSelect('#ingredients-select', ingredients);
    populateSelect('#appliances-select', appliances);
    populateSelect('#ustensils-select', ustensils);
};

const addItemsToSet = (set, items, key) => {
    items.forEach(item => set.add(key ? item[key].toLowerCase() : item.toLowerCase()));
};

/**
 * Populate a select element with items.
 * @param {string} selectId - The ID of the select element.
 * @param {Set} items - The items to populate the select with.
 */
const populateSelect = (selectId, items) => {
    const select = document.querySelector(selectId);
    select.innerHTML = Array.from(items).map(item => `
        <option value="${item}" class="py-2 capitalize-first-letter">${item}</option>
    `).join('');
};

/**
 * Add event listeners for the select elements.
 */
const addSelectEventListeners = () => {
    ['ingredients', 'appliances', 'ustensils'].forEach(type => {
        document.querySelector(`#${type}-select`).addEventListener('change', (event) => {
            addSelectedItem(type, event.target.value);
            event.target.value = '';
            filterRecipes(document.querySelector('#search').value);
        });
    });
};

/**
 * Add a selected item to the list of selected items.
 * @param {string} type - The type of item (ingredients, appliances, ustensils).
 * @param {string} value - The value of the item.
 */
const addSelectedItem = (type, value) => {
    if (!value || selectedItems[type].has(value.toLowerCase())) return;

    selectedItems[type].add(value.toLowerCase());
    updateSelectedItemsDisplay();
};

/**
 * Update the display of selected items.
 */
const updateSelectedItemsDisplay = () => {
    const selectedItemsContainer = document.querySelector('#selected-items');
    selectedItemsContainer.innerHTML = Object.keys(selectedItems).map(type => {
        return Array.from(selectedItems[type]).map(item => `
            <li class="flex w-48 items-center justify-between rounded-lg bg-color-site-50 p-4 text-sm">
                ${escapeHtml(item)}
                <button class="ml-2" onclick="removeSelectedItem('${type}', '${item}')">
                    <i class="fas fa-times"></i>
                </button>
            </li>
        `).join('');
    }).join('');
};

/**
 * Remove a selected item from the list of selected items.
 * @param {string} type - The type of item (ingredients, appliances, ustensils).
 * @param {string} value - The value of the item.
 */
const removeSelectedItem = (type, value) => {
    selectedItems[type].delete(value.toLowerCase());
    updateSelectedItemsDisplay();
    filterRecipes(document.querySelector('#search').value);
};

// Initialize the application
main();

// Expose removeSelectedItem to the global scope
window.removeSelectedItem = removeSelectedItem;