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
}
