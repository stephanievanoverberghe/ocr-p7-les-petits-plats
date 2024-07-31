const togglePanel = (panel, isHidden, button, arrowIcon) => {
    panel.classList.toggle('hidden');
    panel.classList.toggle('dropdown-open');
    panel.classList.toggle('scale-y-0', !isHidden);
    panel.classList.toggle('scale-y-100', isHidden);
    button.classList.toggle('rounded-xl', !isHidden);
    button.classList.toggle('rounded-t-xl', isHidden);
    arrowIcon.classList.toggle('rotate-180');
};

const closeOtherDropdowns = (currentDropdown) => {
    document.querySelectorAll('.dropdown-container').forEach(otherDropdown => {
        if (otherDropdown !== currentDropdown) {
            const otherPanel = otherDropdown.querySelector('.dropdown-panel');
            const otherButton = otherDropdown.querySelector('.dropdown-button');
            const otherArrowIcon = otherDropdown.querySelector('.arrow-icon');

            otherPanel.classList.add('hidden');
            otherPanel.classList.remove('dropdown-open');
            otherPanel.classList.add('scale-y-0');
            otherPanel.classList.remove('scale-y-100');
            otherButton.classList.add('rounded-xl');
            otherButton.classList.remove('rounded-t-xl');
            otherArrowIcon.classList.remove('rotate-180');
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

    button.addEventListener('click', () => {
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

document.querySelectorAll('.dropdown-container').forEach(setupDropdown);