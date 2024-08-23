/**
 * Toggle the visibility and style of a dropdown panel.
 * @param {HTMLElement} panel - The dropdown panel element.
 * @param {boolean} isHidden - Indicates whether the panel is currently hidden.
 * @param {HTMLElement} button - The dropdown button element.
 * @param {HTMLElement} arrowIcon - The arrow icon element within the button.
 */
const togglePanel = (panel, isHidden, button, arrowIcon) => {
    panel.classList.toggle('hidden');
    panel.classList.toggle('dropdown-open');
    panel.classList.toggle('scale-y-0', !isHidden);
    panel.classList.toggle('scale-y-100', isHidden);
    button.classList.toggle('rounded-xl', !isHidden);
    button.classList.toggle('rounded-t-xl', isHidden);
    arrowIcon.classList.toggle('rotate-180');
};

/**
 * Close the specified dropdown by hiding its panel and resetting its styles.
 * @param {HTMLElement} dropdown - The dropdown container element.
 */
const closeDropdown = (dropdown) => {
    const panel = dropdown.querySelector('.dropdown-panel');
    const button = dropdown.querySelector('.dropdown-button');
    const arrowIcon = dropdown.querySelector('.arrow-icon');

    panel.classList.add('hidden');
    panel.classList.remove('dropdown-open');
    panel.classList.add('scale-y-0');
    panel.classList.remove('scale-y-100');
    button.classList.add('rounded-xl');
    button.classList.remove('rounded-t-xl');
    arrowIcon.classList.remove('rotate-180');
};

/**
 * Close all dropdowns except the current one.
 * @param {HTMLElement} currentDropdown - The currently open dropdown container element.
 */
const closeOtherDropdowns = (currentDropdown) => {
    document.querySelectorAll('.dropdown-container').forEach(otherDropdown => {
        if (otherDropdown !== currentDropdown) {
            closeDropdown(otherDropdown);
        }
    });
};

/**
 * Filter the options within a select element based on the user's input.
 * @param {HTMLInputElement} searchInput - The search input field.
 * @param {HTMLSelectElement} select - The select element containing options.
 * @param {HTMLElement} clearButton - The button to clear the search input.
 */
const filterOptions = (searchInput, select, clearButton) => {
    const filter = searchInput.value.toLowerCase();
    const options = select.options;
    for (let i = 0; i < options.length; i++) {
        const option = options[i];
        if (option.text.toLowerCase().includes(filter)) {
            option.style.display = "";
        } else {
            option.style.display = "none";
        }
    }
    clearButton.classList.toggle('hidden', searchInput.value.length === 0);
};

/**
 * Set up the event listeners for the dropdown interactions.
 * @param {HTMLElement} dropdown - The dropdown container element.
 */
const setupDropdown = (dropdown) => {
    const button = dropdown.querySelector('.dropdown-button');
    const panel = dropdown.querySelector('.dropdown-panel');
    const arrowIcon = dropdown.querySelector('.arrow-icon');
    const searchInput = dropdown.querySelector('.search-input');
    const clearButton = dropdown.querySelector('.clear-search-input');
    const select = dropdown.querySelector('.dropdown-select');

    // Toggle panel visibility on button click
    button.addEventListener('click', (event) => {
        event.stopPropagation();
        const isHidden = panel.classList.contains('hidden');

        closeOtherDropdowns(dropdown);

        togglePanel(panel, isHidden, button, arrowIcon);
    });

    // Filter options in the dropdown based on search input
    searchInput.addEventListener('input', () => {
        filterOptions(searchInput, select, clearButton);
    });

    // Clear the search input and reset the dropdown options
    clearButton.addEventListener('click', () => {
        searchInput.value = '';
        filterOptions(searchInput, select, clearButton);
    });
};

/**
 * Close the dropdowns when a user clicks outside of any dropdown container.
 * @param {Event} event - The click event.
 */
document.addEventListener('click', (event) => {
    document.querySelectorAll('.dropdown-container').forEach(dropdown => {
        if (!dropdown.contains(event.target)) {
            closeDropdown(dropdown);
        }
    });
});

// Initialize all dropdowns by setting up their respective event listeners
document.querySelectorAll('.dropdown-container').forEach(setupDropdown);