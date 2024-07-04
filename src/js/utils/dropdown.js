const ingredientButton = document.getElementById('ingredient-button');
const dropdownPanel = document.getElementById('dropdown-panel');
const arrowIcon = document.getElementById('arrow-icon');
const searchInput = document.getElementById('search-input');
const ingredientsSelect = document.getElementById('ingredients-select');

ingredientButton.addEventListener('click', () => {
    const isHidden = dropdownPanel.classList.contains('dropdown-open');

    if (isHidden) {
        dropdownPanel.classList.remove('dropdown-open');
        ingredientButton.classList.remove('rounded-t-xl');
        ingredientButton.classList.add('rounded-xl');
        arrowIcon.classList.remove('rotate-180');
    } else {
        dropdownPanel.classList.add('dropdown-open');
        ingredientButton.classList.add('rounded-t-xl');
        ingredientButton.classList.remove('rounded-xl');
        arrowIcon.classList.add('rotate-180');
    }
});

searchInput.addEventListener('input', () => {
    const filter = searchInput.value.toLowerCase();
    const options = ingredientsSelect.options;
    for (let i = 0; i < options.length; i++) {
        const option = options[i];
        if (option.text.toLowerCase().includes(filter)) {
            option.style.display = "";
        } else {
            option.style.display = "none";
        }
    }
});