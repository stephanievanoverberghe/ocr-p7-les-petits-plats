export class Recipe {
    /**
     * Create a Recipe instance.
     * @param {Object} data - The recipe data.
     */
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.image = data.image;
        this.servings = data.servings;
        this.ingredients = data.ingredients;
        this.time = data.time;
        this.description = data.description;
        this.appliance = data.appliance;
        this.ustensils = data.ustensils;
    }

    /**
     * Get the formatted ingredient list.
     * @returns {string} - Formatted ingredients list.
     */
    getFormattedIngredients() {
        return this.ingredients.map(ingredient => {
            let quantity = ingredient.quantity ? `: ${ingredient.quantity}` : '';
            let unit = ingredient.unit ? ` ${ingredient.unit}` : '';
            return `${ingredient.ingredient}${quantity}${unit}`;
        }).join(', ');
    }

    /**
     * Get the formatted ustensils list.
     * @returns {string} - Formatted ustensils list.
     */
    getFormattedUstensils() {
        return this.ustensils.join(', ');
    }
}
