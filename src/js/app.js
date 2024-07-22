import { fetchRecipes } from "./api/api.js";
import { Recipe } from "./models/recipe.js";

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
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};

/**
 * Perform a search on recipes using native loops.
 * @param {string} query - The search query.
 * @param {Array} recipes - The list of recipes.
 * @returns {Array} - The filtered list of recipes.
 */
const searchRecipesNative = (query, recipes) => {
    const lowerCaseQuery = query.toLowerCase();
    const results = [];

    for (let i = 0; i < recipes.length; i++) {
        const recipe = recipes[i];
        if (matchesQuery(lowerCaseQuery, recipe)) {
            results.push(recipe);
        }
    }

    return results;
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
    const ingredientMatch = Array.from(selectedItems.ingredients).every(item =>
        recipe.ingredients.some(ing => ing.ingredient.toLowerCase() === item.toLowerCase())
    );

    const applianceMatch = selectedItems.appliances.size === 0 ||
        selectedItems.appliances.has(recipe.appliance.toLowerCase());

    const ustensilMatch = Array.from(selectedItems.ustensils).every(item =>
        recipe.ustensils.some(ust => ust.toLowerCase() === item.toLowerCase())
    );

    return ingredientMatch && applianceMatch && ustensilMatch;
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
    recipesContainer.innerHTML = '';

    recipes.forEach(recipe => {
        const recipeCard = document.createElement('article');
        recipeCard.classList.add('relative', 'flex', 'flex-col', 'overflow-hidden', 'rounded-3xl', 'bg-white', 'shadow-lg');
        recipeCard.innerHTML = `
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
        `;
        recipesContainer.appendChild(recipeCard);
    });
};

/**
 * Filter the recipes based on the search query and selected items.
 * @param {string} query - The search query.
 */
const filterRecipes = query => {
    const filteredRecipes = searchRecipesNative(query, recipes)
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
    recipeCountElement.textContent = count === 0 ? '00 recette' : `${count.toString().padStart(2, '0')} recettes`;
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
 * Add event listeners for the select elements.
 */
const addSelectEventListeners = () => {
    document.querySelector('#ingredients-select').addEventListener('change', (event) => {
        addSelectedItem('ingredients', event.target.value);
        event.target.value = '';
        filterRecipes(document.querySelector('#search').value);
    });

    document.querySelector('#appliances-select').addEventListener('change', (event) => {
        addSelectedItem('appliances', event.target.value);
        event.target.value = '';
        filterRecipes(document.querySelector('#search').value);
    });

    document.querySelector('#ustensils-select').addEventListener('change', (event) => {
        addSelectedItem('ustensils', event.target.value);
        event.target.value = '';
        filterRecipes(document.querySelector('#search').value);
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
    selectedItemsContainer.innerHTML = '';

    Object.keys(selectedItems).forEach(type => {
        selectedItems[type].forEach(item => {
            const listItem = document.createElement('li');
            listItem.classList.add('flex', 'w-48', 'items-center', 'justify-between', 'rounded-lg', 'bg-color-site-50', 'p-4', 'text-sm');
            listItem.innerHTML = `
                ${escapeHtml(item)}
                <button class="ml-2" onclick="removeSelectedItem('${type}', '${item}')">
                    <i class="fas fa-times"></i>
                </button>
            `;
            selectedItemsContainer.appendChild(listItem);
        });
    });
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
