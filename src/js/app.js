import { fetchRecipes } from "./api/api.js";
import { Recipe } from "./models/recipe.js";
import data from "../data/recipes.json";

// Global variables to hold recipes
let recipes = [];

/**
 * Fetch and initialize recipes.
 */
const main = async () => {
    try {
        const recipesData = await fetchRecipes(data);
        if (recipesData && recipesData.recipes) {
            recipes = recipesData.recipes.map(data => new Recipe(data));
            updateRecipeCount(recipes.length);
            displayRecipes(recipes);
            populateSelects();

            document.querySelector('#search').addEventListener('input', (event) => filterRecipes(event.target.value));
            document.querySelector('#clear-button').addEventListener('click', () => {
                document.querySelector('#search').value = '';
                filterRecipes('');
            });
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
            <img src="src/assets/img/${recipe.image}" alt="${recipe.name}" class="h-64 w-full object-cover"/>
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
