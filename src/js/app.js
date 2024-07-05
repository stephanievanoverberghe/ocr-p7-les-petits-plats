import { Api } from "./api/api.js";
import { Recipe } from "./models/recipe.js";

class App {
    constructor() {
        this.api = new Api('src/data/recipes.json');
    }

    async main() {
        try {
            const recipesData = await this.api.get();
            if (recipesData) {
                this.recipes = recipesData.recipes.map(data => new Recipe(data));
                this.updateRecipeCount(this.recipes.length);
                this.displayRecipes(this.recipes);
                this.populateSelects();

                document.getElementById('search').addEventListener('input', (event) => this.filterRecipes(event.target.value));
                document.getElementById('clear-button').addEventListener('click', () => {
                    document.getElementById('search').value = '';
                    this.filterRecipes('');
                });
            }
        } catch (error) {
            console.error('Error in main:', error);
        }
    }

    displayRecipes(recipes) {
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
                    <p class="mb-8 flex-grow text-gray-700 line-clamp-4">${this.truncateDescription(recipe.description)}</p>
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
    }

    filterRecipes(query) {
        const filteredRecipes = this.recipes.filter(recipe =>
            recipe.name.toLowerCase().includes(query.toLowerCase()) ||
            recipe.ingredients.some(ingredient => ingredient.ingredient.toLowerCase().includes(query.toLowerCase()))
        );
        this.updateRecipeCount(filteredRecipes.length);
        this.displayRecipes(filteredRecipes);
    }

    updateRecipeCount(count) {
        const recipeCountElement = document.getElementById('recipe-count');
        if (count === 0) {
            recipeCountElement.textContent = `00 recette`;
        } else {
            recipeCountElement.textContent = `${count.toString().padStart(2, '0')} recettes`;
        }
    }

    truncateDescription(description, maxLines = 4) {
        const lines = description.split('\n');
        if (lines.length <= maxLines) {
            return description;
        }
        return lines.slice(0, maxLines).join(' ') + '...';
    }

    populateSelects() {
        const ingredients = new Set();
        const appliances = new Set();
        const ustensils = new Set();

        this.recipes.forEach(recipe => {
            recipe.ingredients.forEach(ingredient => ingredients.add(ingredient.ingredient));
            appliances.add(recipe.appliance);
            recipe.ustensils.forEach(ustensil => ustensils.add(ustensil));
        });

        this.populateSelect('#ingredients-select', ingredients);
        this.populateSelect('#appliances-select', appliances);
        this.populateSelect('#ustensils-select', ustensils);
    }

    populateSelect(selectId, items) {
        const select = document.querySelector(selectId);
        select.innerHTML = '';
        items.forEach(item => {
            const option = document.createElement('option');
            option.value = item;
            option.textContent = item;
            option.classList.add('py-2', 'capitalize-first-letter');
            select.appendChild(option);
        });
    }
}

const app = new App();
app.main();
