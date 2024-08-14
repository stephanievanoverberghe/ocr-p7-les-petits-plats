// Dropdowns behavior with closing on outside click
const togglePanel = (panel, isHidden, button, arrowIcon) => {
    panel.classList.toggle('hidden');
    panel.classList.toggle('dropdown-open');
    panel.classList.toggle('scale-y-0', !isHidden);
    panel.classList.toggle('scale-y-100', isHidden);
    button.classList.toggle('rounded-xl', !isHidden);
    button.classList.toggle('rounded-t-xl', isHidden);
    arrowIcon.classList.toggle('rotate-180');
};

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

const closeOtherDropdowns = (currentDropdown) => {
    document.querySelectorAll('.dropdown-container').forEach(otherDropdown => {
        if (otherDropdown !== currentDropdown) {
            closeDropdown(otherDropdown);
        }
    });
};

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

const setupDropdown = (dropdown) => {
    const button = dropdown.querySelector('.dropdown-button');
    const panel = dropdown.querySelector('.dropdown-panel');
    const arrowIcon = dropdown.querySelector('.arrow-icon');
    const searchInput = dropdown.querySelector('.search-input');
    const clearButton = dropdown.querySelector('.clear-search-input');
    const select = dropdown.querySelector('.dropdown-select');

    button.addEventListener('click', (event) => {
        event.stopPropagation();
        const isHidden = panel.classList.contains('hidden');

        closeOtherDropdowns(dropdown);

        togglePanel(panel, isHidden, button, arrowIcon);
    });

    searchInput.addEventListener('input', () => {
        filterOptions(searchInput, select, clearButton);
    });

    clearButton.addEventListener('click', () => {
        searchInput.value = '';
        filterOptions(searchInput, select, clearButton);
    });
};

// Fermer le dropdown lorsqu'on clique en dehors
document.addEventListener('click', (event) => {
    document.querySelectorAll('.dropdown-container').forEach(dropdown => {
        if (!dropdown.contains(event.target)) {
            closeDropdown(dropdown);
        }
    });
});

document.querySelectorAll('.dropdown-container').forEach(setupDropdown);