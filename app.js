let currentBalance = parseFloat(localStorage.getItem('piggi_balance')) || 0.00;
let savingGoals = JSON.parse(localStorage.getItem('piggi_goals')) || [];
let incomeSources = JSON.parse(localStorage.getItem('piggi_income')) || [];
let expenseSources = JSON.parse(localStorage.getItem('piggi_expenses')) || [];

let avatarSymbol = localStorage.getItem('piggi_avatar') || 'P';

const profileTrigger = document.getElementById('profile-trigger');
if (profileTrigger) profileTrigger.textContent = avatarSymbol;

const mainBalanceValue = document.getElementById('main-balance-value');
const modalBalanceValue = document.getElementById('modal-balance-value');
const mainGoalsList = document.getElementById('main-goals-list');
const modalGoalsList = document.getElementById('modal-goals-list');
const modalGoalsListEdit = document.getElementById('modal-goals-list-edit');
const mainIncomeList = document.getElementById('main-income-list');
const modalIncomeList = document.getElementById('modal-income-list');
const modalIncomeListEdit = document.getElementById('modal-income-list-edit');
const modalIncomeValue = document.getElementById('modal-income-value');
const mainExpenseList = document.getElementById('main-expense-list');
const modalExpenseList = document.getElementById('modal-expense-list');
const modalExpenseListEdit = document.getElementById('modal-expense-list-edit');
const modalExpenseValue = document.getElementById('modal-expense-value');
const totalGoalAmount = document.getElementById('total-goal-amount');

const mainInput = document.getElementById('main-input');
const sendBtn = document.getElementById('send-btn');
const modalAi = document.getElementById('modal-ai');
const aiChatHistory = document.getElementById('ai-chat-history');

const editIconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>`;
const deleteIconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`;

const cards = {
    'balance-card': document.getElementById('balance-modal'),
    'goals-card': document.getElementById('goals-modal'),
    'income-card': document.getElementById('income-modal'),
    'expenses-card': document.getElementById('expenses-modal'),
    'profile-trigger': document.getElementById('profile-modal'),
    'smart-card': document.getElementById('modal-ai')
};

const sliders = {
    'goals-slider': document.getElementById('goals-slider'),
    'income-slider': document.getElementById('income-slider'),
    'expenses-slider': document.getElementById('expenses-slider'),
    'profile-slider': document.getElementById('profile-slider'),
    'balance-slider': document.getElementById('balance-slider')
};

function closeModal(overlay) {
    if (!overlay) return;
    overlay.classList.remove('active');
    const sheet = overlay.querySelector('.bottom-sheet');
    if (sheet) {
        sheet.style.transform = '';
        sheet.style.transition = '';
    }
}

const allOverlays = document.querySelectorAll('.modal-overlay');
allOverlays.forEach(overlay => {
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay || e.target.classList.contains('modal-mask')) {
            closeModal(overlay);
        }
    });

    const sheet = overlay.querySelector('.bottom-sheet');
    const dragTarget = overlay.querySelector('.drag-handle-container') || sheet;
    if (sheet) {
        let startY = 0;
        let currentY = 0;
        let isDragging = false;

        dragTarget.addEventListener('touchstart', (e) => {
            startY = e.touches[0].clientY;
            isDragging = true;
            sheet.style.transition = 'none';
        }, { passive: true });

        dragTarget.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            currentY = e.touches[0].clientY - startY;
            if (currentY > 0) {
                sheet.style.transform = `translateY(${currentY}px)`;
            }
        }, { passive: true });

        dragTarget.addEventListener('touchend', () => {
            if (!isDragging) return;
            isDragging = false;
            sheet.style.transition = 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)';
            if (currentY > 100) {
                closeModal(overlay);
            } else {
                sheet.style.transform = 'translateY(0)';
            }
            currentY = 0;
        });
    }
});

function isValidNumber(value) {
    if (!value || value.trim() === '') return false;
    const cleanValue = value.replace(',', '.');
    return !isNaN(cleanValue) && !isNaN(parseFloat(cleanValue));
}

function validateNumberInput(inputEl, errorEl) {
    const val = inputEl.value;
    if (val === '') {
        inputEl.classList.remove('input-invalid');
        if (errorEl) errorEl.classList.remove('visible');
        return true;
    }
    if (!isValidNumber(val)) {
        inputEl.classList.add('input-invalid');
        if (errorEl) errorEl.classList.add('visible');
        return false;
    } else {
        inputEl.classList.remove('input-invalid');
        if (errorEl) errorEl.classList.remove('visible');
        return true;
    }
}

function clearValidation(inputEl, errorEl) {
    if (inputEl) inputEl.classList.remove('input-invalid');
    if (errorEl) errorEl.classList.remove('visible');
}

const inputBalance = document.getElementById('input-balance');
const errorBalance = document.getElementById('error-balance');
if (inputBalance) inputBalance.addEventListener('input', () => validateNumberInput(inputBalance, errorBalance));

const inputGoalPrice = document.getElementById('input-goal-price');
const errorGoalPrice = document.getElementById('error-goal-price');
if (inputGoalPrice) inputGoalPrice.addEventListener('input', () => validateNumberInput(inputGoalPrice, errorGoalPrice));

const inputIncomeAmount = document.getElementById('input-income-amount');
const errorIncomeAmount = document.getElementById('error-income-amount');
if (inputIncomeAmount) inputIncomeAmount.addEventListener('input', () => validateNumberInput(inputIncomeAmount, errorIncomeAmount));

const inputExpenseAmount = document.getElementById('input-expense-amount');
const errorExpenseAmount = document.getElementById('error-expense-amount');
if (inputExpenseAmount) inputExpenseAmount.addEventListener('input', () => validateNumberInput(inputExpenseAmount, errorExpenseAmount));

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR' }).format(amount);
}

function updateBalanceUI() {
    const formatted = formatCurrency(currentBalance);
    if (mainBalanceValue) {
        mainBalanceValue.textContent = formatted;
        mainBalanceValue.classList.remove('price-red', 'price-green');
        mainBalanceValue.classList.add(currentBalance < 0 ? 'price-red' : 'price-green');
    }
    if (modalBalanceValue) {
        modalBalanceValue.textContent = formatted;
        modalBalanceValue.classList.remove('price-red', 'price-green');
        modalBalanceValue.classList.add('big-green');
        modalBalanceValue.classList.add(currentBalance < 0 ? 'price-red' : 'price-green');
    }
    localStorage.setItem('piggi_balance', currentBalance.toString());
    renderGoals();
}

function renderGoals() {
    if (mainGoalsList) mainGoalsList.innerHTML = '';
    if (modalGoalsList) modalGoalsList.innerHTML = '';
    if (modalGoalsListEdit) modalGoalsListEdit.innerHTML = '';

    if (savingGoals.length === 0) {
        if (mainGoalsList) mainGoalsList.innerHTML = '<div class="empty-state">Add saving goal</div>';
        if (totalGoalAmount) totalGoalAmount.textContent = formatCurrency(0);
    } else {
        let totalTarget = 0;
        savingGoals.forEach((goal, index) => {
            totalTarget += goal.amount;
            
            let percentage = 0;
            if (goal.amount > 0 && currentBalance > 0) {
                percentage = Math.round((currentBalance / goal.amount) * 100);
            }
            if (percentage > 100) percentage = 100;

            if (mainGoalsList && index < 3) {
                const div = document.createElement('div');
                div.className = 'goal-item';
                div.innerHTML = `<span>${goal.name}</span><span class="price-orange">${percentage}%</span>`;
                mainGoalsList.appendChild(div);
            }

            if (modalGoalsList) {
                const div = document.createElement('div');
                div.className = 'goal-item';
                div.innerHTML = `
                    <span>${goal.name}</span>
                    <div class="goal-values">
                        <span class="goal-amount">${formatCurrency(goal.amount)}</span>
                        <span class="price-orange">${percentage}%</span>
                    </div>
                `;
                modalGoalsList.appendChild(div);
            }

            if (modalGoalsListEdit) {
                const div = document.createElement('div');
                div.className = 'goal-item';
                div.style.justifyContent = 'space-between';
                div.innerHTML = `
                    <span>${goal.name} (${formatCurrency(goal.amount)})</span>
                    <div style="display:flex; gap:8px;">
                        <button class="icon-btn-edit" onclick="editGoalItem(${index})">${editIconSvg}</button>
                        <button class="icon-btn-delete" onclick="window.deleteGoalItem(${index})">${deleteIconSvg}</button>
                    </div>
                `;
                modalGoalsListEdit.appendChild(div);
            }
        });
        if (totalGoalAmount) totalGoalAmount.textContent = formatCurrency(totalTarget);
    }
    localStorage.setItem('piggi_goals', JSON.stringify(savingGoals));
}

function renderIncome() {
    if (mainIncomeList) mainIncomeList.innerHTML = '';
    if (modalIncomeList) modalIncomeList.innerHTML = '';
    if (modalIncomeListEdit) modalIncomeListEdit.innerHTML = '';
    
    if (incomeSources.length === 0) {
        if (mainIncomeList) mainIncomeList.innerHTML = '<div class="empty-state">Add monthly income</div>';
        if (modalIncomeValue) modalIncomeValue.textContent = formatCurrency(0);
    } else {
        let total = 0;
        incomeSources.forEach((source, index) => {
            total += source.amount;

            if (mainIncomeList && index < 3) {
                const div = document.createElement('div');
                div.className = 'income-item';
                div.innerHTML = `<span>${source.name}</span><span class="price-green">${formatCurrency(source.amount)}</span>`;
                mainIncomeList.appendChild(div);
            }

            if (modalIncomeList) {
                const div = document.createElement('div');
                div.className = 'income-item';
                div.innerHTML = `<span>${source.name}</span><span class="price-green">${formatCurrency(source.amount)}</span>`;
                modalIncomeList.appendChild(div);
            }

            if (modalIncomeListEdit) {
                const div = document.createElement('div');
                div.className = 'income-item';
                div.style.justifyContent = 'space-between';
                div.innerHTML = `
                    <span>${source.name} (${formatCurrency(source.amount)})</span>
                    <div style="display:flex; gap:8px;">
                        <button class="icon-btn-edit" onclick="editIncomeItem(${index})">${editIconSvg}</button>
                        <button class="icon-btn-delete" onclick="window.deleteIncomeItem(${index})">${deleteIconSvg}</button>
                    </div>
                `;
                modalIncomeListEdit.appendChild(div);
            }
        });
        if (modalIncomeValue) modalIncomeValue.textContent = formatCurrency(total);
    }
    localStorage.setItem('piggi_income', JSON.stringify(incomeSources));
}

function renderExpenses() {
    if (mainExpenseList) mainExpenseList.innerHTML = '';
    if (modalExpenseList) modalExpenseList.innerHTML = '';
    if (modalExpenseListEdit) modalExpenseListEdit.innerHTML = '';

    if (expenseSources.length === 0) {
        if (mainExpenseList) mainExpenseList.innerHTML = '<div class="empty-state">Add monthly expenses</div>';
        if (modalExpenseValue) modalExpenseValue.textContent = formatCurrency(0);
    } else {
        let total = 0;
        expenseSources.forEach((source, index) => {
            total += source.amount;

            if (mainExpenseList && index < 3) {
                const div = document.createElement('div');
                div.className = 'expense-item';
                div.innerHTML = `<span>${source.name}</span><span class="price-red">${formatCurrency(source.amount)}</span>`;
                mainExpenseList.appendChild(div);
            }
            if (modalExpenseList) {
                const div = document.createElement('div');
                div.className = 'expense-item';
                div.innerHTML = `<span>${source.name}</span><span class="price-red">${formatCurrency(source.amount)}</span>`;
                modalExpenseList.appendChild(div);
            }

            if (modalExpenseListEdit) {
                const div = document.createElement('div');
                div.className = 'expense-item';
                div.style.justifyContent = 'space-between';
                div.innerHTML = `
                    <span>${source.name} (${formatCurrency(source.amount)})</span>
                    <div style="display:flex; gap:8px;">
                        <button class="icon-btn-edit" onclick="editExpenseItem(${index})">${editIconSvg}</button>
                        <button class="icon-btn-delete" onclick="window.deleteExpenseItem(${index})">${deleteIconSvg}</button>
                    </div>
                `;
                modalExpenseListEdit.appendChild(div);
            }
        });
        if (modalExpenseValue) modalExpenseValue.textContent = formatCurrency(total);
    }
    localStorage.setItem('piggi_expenses', JSON.stringify(expenseSources));
}

Object.keys(cards).forEach(id => {
    const trigger = document.getElementById(id);
    if (trigger) {
        trigger.addEventListener('click', (e) => {
            if (e.target.closest('.icon-btn-edit') || e.target.closest('.icon-btn-delete')) return;
            const targetModal = cards[id];
            if (targetModal) {
                targetModal.classList.add('active');
                const s = targetModal.querySelector('.sheet-slider');
                if (s) s.setAttribute('data-active-slide', '0');
            }
        });
    }
});

const overlayClosers = [
    { btn: 'btn-close-balance', modal: 'balance-modal' },
    { btn: 'btn-close-goals', modal: 'goals-modal' },
    { btn: 'btn-close-income', modal: 'income-modal' },
    { btn: 'btn-close-expenses', modal: 'expenses-modal' },
    { btn: 'btn-close-profile-overlay', modal: 'profile-modal' },
    { btn: 'btn-close-ai', modal: 'modal-ai' }
];

overlayClosers.forEach(c => {
    const b = document.getElementById(c.btn);
    if (b) {
        b.addEventListener('click', () => {
            const m = document.getElementById(c.modal);
            if (m) closeModal(m);
        });
    }
});

function changeSlide(sliderId, targetSlide) {
    const slider = document.getElementById(sliderId);
    if (!slider) return;
    
    if (sliderId === 'profile-slider') {
        slider.classList.remove('show-branch-1', 'show-branch-2', 'show-branch-3', 'show-branch-4');
        if (targetSlide === 1) {
            slider.classList.add('show-branch-1');
            slider.setAttribute('data-active-slide', '1');
        } else if (targetSlide === 2) {
            slider.classList.add('show-branch-2');
            slider.setAttribute('data-active-slide', '1');
        } else if (targetSlide === 3) {
            slider.classList.add('show-branch-3');
            slider.setAttribute('data-active-slide', '1');
        } else if (targetSlide === 4) {
            slider.classList.add('show-branch-4');
            slider.setAttribute('data-active-slide', '1');
        } else {
            slider.setAttribute('data-active-slide', '0');
        }
    } else {
        slider.setAttribute('data-active-slide', targetSlide.toString());
    }
}

let editingBalanceMode = 'set';
const editBalanceTitle = document.getElementById('edit-balance-title');
const editBalanceLabel = document.getElementById('edit-balance-label');

function setupSliderNavigation(btnId, sliderId, slideIndex) {
    const btn = document.getElementById(btnId);
    if (btn) {
        btn.addEventListener('click', () => {
            if (btnId === 'btn-add-funds') {
                editingBalanceMode = 'add';
                if(editBalanceTitle) editBalanceTitle.textContent = 'Add Funds';
                if(editBalanceLabel) editBalanceLabel.textContent = 'Amount to Add (€)';
                clearValidation(inputBalance, errorBalance);
            } else if (btnId === 'btn-subtract-funds') {
                editingBalanceMode = 'subtract';
                if(editBalanceTitle) editBalanceTitle.textContent = 'Subtract Funds';
                if(editBalanceLabel) editBalanceLabel.textContent = 'Amount to Subtract (€)';
                clearValidation(inputBalance, errorBalance);
            } else if (btnId === 'btn-edit-balance') {
                editingBalanceMode = 'set';
                if(editBalanceTitle) editBalanceTitle.textContent = 'Edit Balance';
                if(editBalanceLabel) editBalanceLabel.textContent = 'New Balance (€)';
                clearValidation(inputBalance, errorBalance);
            }
            changeSlide(sliderId, slideIndex);
        });
    }
}

setupSliderNavigation('btn-edit-balance', 'balance-slider', 1);
setupSliderNavigation('btn-add-funds', 'balance-slider', 1);
setupSliderNavigation('btn-subtract-funds', 'balance-slider', 1);
setupSliderNavigation('btn-to-edit-goals', 'goals-slider', 1);
setupSliderNavigation('btn-save-goals-edit', 'goals-slider', 0);
setupSliderNavigation('btn-to-add-goal', 'goals-slider', 2);
setupSliderNavigation('btn-cancel-add-goal', 'goals-slider', 1);
setupSliderNavigation('btn-to-edit-income', 'income-slider', 1);
setupSliderNavigation('btn-save-income-edit', 'income-slider', 0);
setupSliderNavigation('btn-to-add-income', 'income-slider', 2);
setupSliderNavigation('btn-cancel-add-income', 'income-slider', 1);
setupSliderNavigation('btn-to-edit-expense', 'expenses-slider', 1);
setupSliderNavigation('btn-save-expense-edit', 'expenses-slider', 0);
setupSliderNavigation('btn-to-add-expense', 'expenses-slider', 2);
setupSliderNavigation('btn-cancel-add-expense', 'expenses-slider', 1);

setupSliderNavigation('btn-to-appearance', 'profile-slider', 1);
setupSliderNavigation('btn-to-edit-profile', 'profile-slider', 2);
setupSliderNavigation('btn-to-api-key', 'profile-slider', 3);
setupSliderNavigation('btn-to-reset', 'profile-slider', 4);

setupSliderNavigation('btn-back-to-profile', 'profile-slider', 0);

const btnBackToProfileAvatar = document.getElementById('btn-back-to-profile-avatar');
if(btnBackToProfileAvatar) {
    btnBackToProfileAvatar.addEventListener('click', () => {
        if (inputAvatarSymbol) inputAvatarSymbol.value = avatarSymbol;
        changeSlide('profile-slider', 0);
    });
}

const btnBackToProfileApi = document.getElementById('btn-back-to-profile-api');
if(btnBackToProfileApi) {
    btnBackToProfileApi.addEventListener('click', () => changeSlide('profile-slider', 0));
}

const btnCancelReset = document.getElementById('btn-cancel-reset');
if(btnCancelReset) {
    btnCancelReset.addEventListener('click', () => changeSlide('profile-slider', 0));
}

const btnCancelBalance = document.getElementById('btn-cancel-balance');
if(btnCancelBalance) {
    btnCancelBalance.addEventListener('click', () => {
        if (inputBalance) inputBalance.value = '';
        clearValidation(inputBalance, errorBalance);
        changeSlide('balance-slider', 0);
    });
}

const btnSaveBalance = document.getElementById('btn-save-balance');
if (btnSaveBalance && inputBalance) {
    btnSaveBalance.addEventListener('click', () => {
        if (!validateNumberInput(inputBalance, errorBalance)) return;
        const val = parseFloat(inputBalance.value.replace(',', '.'));
        if (!isNaN(val)) {
            if (editingBalanceMode === 'add') {
                currentBalance += val;
            } else if (editingBalanceMode === 'subtract') {
                currentBalance -= val;
            } else {
                currentBalance = val;
            }
            updateBalanceUI();
        }
        inputBalance.value = '';
        clearValidation(inputBalance, errorBalance);
        changeSlide('balance-slider', 0);
    });
}

let editingGoalIndex = null;
const inputGoalName = document.getElementById('input-goal-name');
const btnSubmitGoal = document.getElementById('btn-submit-goal');
const addGoalHeaderTitle = document.getElementById('add-goal-header-title');
const btnSubmitGoalText = document.getElementById('btn-submit-goal-text');

if (btnSubmitGoal) {
    btnSubmitGoal.addEventListener('click', () => {
        const isPriceValid = validateNumberInput(inputGoalPrice, errorGoalPrice);
        const name = inputGoalName.value.trim();
        if (!name || !isPriceValid || inputGoalPrice.value.trim() === '') {
            if (inputGoalPrice.value.trim() === '') validateNumberInput(inputGoalPrice, errorGoalPrice);
            return;
        }

        const amount = parseFloat(inputGoalPrice.value.replace(',', '.'));

        if (editingGoalIndex !== null) {
            savingGoals[editingGoalIndex].name = name;
            savingGoals[editingGoalIndex].amount = amount;
            editingGoalIndex = null;
            if (addGoalHeaderTitle) addGoalHeaderTitle.textContent = 'Add Goal';
            if (btnSubmitGoalText) btnSubmitGoalText.textContent = 'Add';
        } else {
            savingGoals.push({ name, amount });
        }
        renderGoals();

        inputGoalName.value = '';
        inputGoalPrice.value = '';
        clearValidation(inputGoalPrice, errorGoalPrice);
        if (sliders['goals-slider']) changeSlide('goals-slider', 1);
    });
}

window.deleteGoalItem = function (index) {
    savingGoals.splice(index, 1);
    renderGoals();
};

window.editGoalItem = function (index) {
    editingGoalIndex = index;
    const goal = savingGoals[index];
    if (inputGoalName) inputGoalName.value = goal.name;
    if (inputGoalPrice) inputGoalPrice.value = goal.amount.toString();
    clearValidation(inputGoalPrice, errorGoalPrice);
    if (addGoalHeaderTitle) addGoalHeaderTitle.textContent = 'Edit Goal';
    if (btnSubmitGoalText) btnSubmitGoalText.textContent = 'Save';
    if (sliders['goals-slider']) changeSlide('goals-slider', 2);
};

let editingIncomeIndex = null;
const inputIncomeName = document.getElementById('input-income-name');
const btnSubmitIncome = document.getElementById('btn-submit-income');
const addIncomeHeaderTitle = document.getElementById('add-income-header-title');
const btnSubmitIncomeText = document.getElementById('btn-submit-income-text');

if (btnSubmitIncome) {
    btnSubmitIncome.addEventListener('click', () => {
        const isAmountValid = validateNumberInput(inputIncomeAmount, errorIncomeAmount);
        const name = inputIncomeName.value.trim();
        if (!name || !isAmountValid || inputIncomeAmount.value.trim() === '') {
            if (inputIncomeAmount.value.trim() === '') validateNumberInput(inputIncomeAmount, errorIncomeAmount);
            return;
        }

        const amount = parseFloat(inputIncomeAmount.value.replace(',', '.'));

        if (editingIncomeIndex !== null) {
            incomeSources[editingIncomeIndex].name = name;
            incomeSources[editingIncomeIndex].amount = amount;
            editingIncomeIndex = null;
            if (addIncomeHeaderTitle) addIncomeHeaderTitle.textContent = 'Add Income';
            if (btnSubmitIncomeText) btnSubmitIncomeText.textContent = 'Add';
        } else {
            incomeSources.push({ name, amount });
        }

        renderIncome();
        inputIncomeName.value = '';
        inputIncomeAmount.value = '';
        clearValidation(inputIncomeAmount, errorIncomeAmount);
        if (sliders['income-slider']) changeSlide('income-slider', 1);
    });
}

window.deleteIncomeItem = function (index) {
    incomeSources.splice(index, 1);
    renderIncome();
};

window.editIncomeItem = function (index) {
    editingIncomeIndex = index;
    const inc = incomeSources[index];
    if (inputIncomeName) inputIncomeName.value = inc.name;
    if (inputIncomeAmount) inputIncomeAmount.value = inc.amount.toString();
    clearValidation(inputIncomeAmount, errorIncomeAmount);
    if (addIncomeHeaderTitle) addIncomeHeaderTitle.textContent = 'Edit Income';
    if (btnSubmitIncomeText) btnSubmitIncomeText.textContent = 'Save';
    if (sliders['income-slider']) changeSlide('income-slider', 2);
};

let editingExpenseIndex = null;
const inputExpenseName = document.getElementById('input-expense-name');
const btnSubmitExpense = document.getElementById('btn-submit-expense');
const addExpenseHeaderTitle = document.getElementById('add-expense-header-title');
const btnSubmitExpenseText = document.getElementById('btn-submit-expense-text');

if (btnSubmitExpense) {
    btnSubmitExpense.addEventListener('click', () => {
        const isAmountValid = validateNumberInput(inputExpenseAmount, errorExpenseAmount);
        const name = inputExpenseName.value.trim();
        if (!name || !isAmountValid || inputExpenseAmount.value.trim() === '') {
            if (inputExpenseAmount.value.trim() === '') validateNumberInput(inputExpenseAmount, errorExpenseAmount);
            return;
        }

        const amount = parseFloat(inputExpenseAmount.value.replace(',', '.'));

        if (editingExpenseIndex !== null) {
            expenseSources[editingExpenseIndex].name = name;
            expenseSources[editingExpenseIndex].amount = amount;
            editingExpenseIndex = null;
            if (addExpenseHeaderTitle) addExpenseHeaderTitle.textContent = 'Add Expense';
            if (btnSubmitExpenseText) btnSubmitExpenseText.textContent = 'Add';
        } else {
            expenseSources.push({ name, amount });
        }

        renderExpenses();
        inputExpenseName.value = '';
        inputExpenseAmount.value = '';
        clearValidation(inputExpenseAmount, errorExpenseAmount);
        if (sliders['expenses-slider']) changeSlide('expenses-slider', 1);
    });
}

window.deleteExpenseItem = function (index) {
    expenseSources.splice(index, 1);
    renderExpenses();
};

window.editExpenseItem = function (index) {
    editingExpenseIndex = index;
    const exp = expenseSources[index];
    if (inputExpenseName) inputExpenseName.value = exp.name;
    if (inputExpenseAmount) inputExpenseAmount.value = exp.amount.toString();
    clearValidation(inputExpenseAmount, errorExpenseAmount);
    if (addExpenseHeaderTitle) addExpenseHeaderTitle.textContent = 'Edit Expense';
    if (btnSubmitExpenseText) btnSubmitExpenseText.textContent = 'Save';
    if (sliders['expenses-slider']) changeSlide('expenses-slider', 2);
};

const inputAvatarSymbol = document.getElementById('input-avatar-symbol');
const btnSaveAvatar = document.getElementById('btn-save-avatar');

if (inputAvatarSymbol) {
    inputAvatarSymbol.value = avatarSymbol;
}

if (btnSaveAvatar && inputAvatarSymbol) {
    btnSaveAvatar.addEventListener('click', () => {
        const val = inputAvatarSymbol.value.trim();
        setAvatarSymbol(val.length > 0 ? val[0] : 'P');
        changeSlide('profile-slider', 0);
    });
}

function setAvatarSymbol(letter) {
    avatarSymbol = letter;
    localStorage.setItem('piggi_avatar', avatarSymbol);
    if (profileTrigger) profileTrigger.textContent = avatarSymbol;
    if (inputAvatarSymbol) inputAvatarSymbol.value = avatarSymbol;
}

const inputApiKey = document.getElementById('input-api-key');
const btnSaveApiKey = document.getElementById('btn-save-api-key');
if (btnSaveApiKey && inputApiKey) {
    inputApiKey.value = localStorage.getItem('gemini_api_key') || '';
    btnSaveApiKey.addEventListener('click', () => {
        localStorage.setItem('gemini_api_key', inputApiKey.value.trim());
        changeSlide('profile-slider', 0);
    });
}

const btnConfirmReset = document.getElementById('btn-confirm-reset');
if (btnConfirmReset) {
    btnConfirmReset.addEventListener('click', () => {
        localStorage.clear();
        currentBalance = 0.00;
        savingGoals = [];
        incomeSources = [];
        expenseSources = [];
        avatarSymbol = 'P';
        
        if (profileTrigger) profileTrigger.textContent = 'P';
        if (inputAvatarSymbol) inputAvatarSymbol.value = 'P';
        if (inputApiKey) inputApiKey.value = '';

        setTheme('light');

        updateBalanceUI();
        renderGoals();
        renderIncome();
        renderExpenses();

        changeSlide('profile-slider', 0);
        closeModal(document.getElementById('profile-modal'));
    });
}

const btnLightMode = document.getElementById('btn-light-mode');
const btnDarkMode = document.getElementById('btn-dark-mode');

function setTheme(theme) {
    if (theme === 'dark') {
        document.body.classList.add('dark-mode');
        localStorage.setItem('piggi_theme', 'dark');
    } else {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('piggi_theme', 'light');
    }
    updateCheckmarks();
}

function updateCheckmarks() {
    const isDark = document.body.classList.contains('dark-mode');
    const checkLight = document.getElementById('check-light');
    const checkDark = document.getElementById('check-dark');
    if (checkLight) checkLight.style.display = isDark ? 'none' : 'block';
    if (checkDark) checkDark.style.display = isDark ? 'block' : 'none';
}

if (btnLightMode) {
    btnLightMode.addEventListener('click', () => setTheme('light'));
}
if (btnDarkMode) {
    btnDarkMode.addEventListener('click', () => setTheme('dark'));
}

if (localStorage.getItem('piggi_theme') === 'dark') {
    setTheme('dark');
} else {
    updateCheckmarks();
}

if (mainInput) {
    mainInput.addEventListener('focus', function () {
        if (modalAi) {
            modalAi.classList.add('active');
        }
    });

    mainInput.addEventListener('click', function () {
        if (modalAi) {
            modalAi.classList.add('active');
        }
    });

    mainInput.addEventListener('input', function () {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
        if (this.value.trim().length > 0) {
            sendBtn.classList.add('active');
        } else {
            sendBtn.classList.remove('active');
        }
    });
}

function addChatMessage(role, text) {
    if (!aiChatHistory) return;

    if (role === 'user') {
        const div = document.createElement('div');
        div.className = 'chat-msg-user';
        div.textContent = text;
        aiChatHistory.appendChild(div);
    } else {
        const wrapper = document.createElement('div');
        wrapper.className = 'chat-msg-ai-wrapper';

        const tag = document.createElement('div');
        tag.className = 'chat-ai-tag';
        tag.textContent = 'PiggiAI';

        const div = document.createElement('div');
        div.className = 'chat-msg-ai';
        div.textContent = text;

        wrapper.appendChild(tag);
        wrapper.appendChild(div);
        aiChatHistory.appendChild(wrapper);
    }

    aiChatHistory.scrollTop = aiChatHistory.scrollHeight;
}

function executeAction(act) {
    if (!act || !act.action) return;

    switch (act.action) {
        case 'set_balance':
            if (typeof act.amount === 'number') {
                currentBalance = act.amount;
                updateBalanceUI();
            }
            break;

        case 'adjust_balance':
            if (typeof act.amount === 'number') {
                currentBalance += act.amount;
                updateBalanceUI();
            }
            break;

        case 'add_income':
            if (act.name && typeof act.amount === 'number') {
                incomeSources.push({ name: act.name, amount: act.amount });
                renderIncome();
            }
            break;

        case 'edit_income':
            if (act.name && typeof act.amount === 'number') {
                const idx = incomeSources.findIndex(i => i.name.toLowerCase() === act.name.toLowerCase());
                if (idx !== -1) {
                    incomeSources[idx].amount = act.amount;
                } else {
                    incomeSources.push({ name: act.name, amount: act.amount });
                }
                renderIncome();
            }
            break;

        case 'delete_income':
            if (act.name) {
                incomeSources = incomeSources.filter(i => i.name.toLowerCase() !== act.name.toLowerCase());
                renderIncome();
            }
            break;

        case 'add_expense':
            if (act.name && typeof act.amount === 'number') {
                expenseSources.push({ name: act.name, amount: act.amount });
                renderExpenses();
            }
            break;

        case 'edit_expense':
            if (act.name && typeof act.amount === 'number') {
                const idx = expenseSources.findIndex(e => e.name.toLowerCase() === act.name.toLowerCase());
                if (idx !== -1) {
                    expenseSources[idx].amount = act.amount;
                } else {
                    expenseSources.push({ name: act.name, amount: act.amount });
                }
                renderExpenses();
            }
            break;

        case 'delete_expense':
            if (act.name) {
                expenseSources = expenseSources.filter(e => e.name.toLowerCase() !== act.name.toLowerCase());
                renderExpenses();
            }
            break;

        case 'add_goal':
            if (act.name && typeof act.amount === 'number') {
                savingGoals.push({ name: act.name, amount: act.amount });
                renderGoals();
            }
            break;

        case 'edit_goal':
            if (act.name && typeof act.amount === 'number') {
                const idx = savingGoals.findIndex(g => g.name.toLowerCase() === act.name.toLowerCase());
                if (idx !== -1) {
                    savingGoals[idx].amount = act.amount;
                } else {
                    savingGoals.push({ name: act.name, amount: act.amount });
                }
                renderGoals();
            }
            break;

        case 'delete_goal':
            if (act.name) {
                savingGoals = savingGoals.filter(g => g.name.toLowerCase() !== act.name.toLowerCase());
                renderGoals();
            }
            break;

        case 'set_theme':
            if (act.theme === 'dark' || act.theme === 'light') {
                setTheme(act.theme);
            }
            break;

        case 'change_avatar':
            if (act.initial) {
                setAvatarSymbol(act.initial[0].toUpperCase());
            }
            break;
    }
}

if (sendBtn) {
    sendBtn.addEventListener('click', async function () {
        const userPrompt = mainInput.value.trim();
        if (!userPrompt) return;

        if (!modalAi.classList.contains('active')) {
            modalAi.classList.add('active');
        }

        addChatMessage('user', userPrompt);
        mainInput.value = '';
        mainInput.style.height = 'auto';
        sendBtn.classList.remove('active');

        const activeKey = localStorage.getItem('gemini_api_key');
        if (!activeKey) {
            addChatMessage('PiggiAI', 'Please add your Gemini API Key in the settings first (Profile -> API Key).');
            return;
        }

        const currentBalanceStr = mainBalanceValue?.textContent || '0.00 €';
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${activeKey}`;

        const requestData = {
            contents: [{
                parts: [{
                    text: `You are an AI assistant for the Piggi budgeting app.
Analyze the user input and output ONLY a valid JSON object matching this schema:

{
  "reply": "Friendly response string summarizing actions or answering questions.",
  "actions": [
    { "action": "action_name", ...params }
  ]
}

Supported Actions in 'actions' array:
1. Balance:
   - {"action": "set_balance", "amount": 500}
   - {"action": "adjust_balance", "amount": -20} (for one-off expenses/income)
2. Monthly Income:
   - {"action": "add_income", "name": "Salary", "amount": 2000}
   - {"action": "edit_income", "name": "Salary", "amount": 2200}
   - {"action": "delete_income", "name": "Salary"}
3. Monthly Expenses:
   - {"action": "add_expense", "name": "Rent", "amount": 800}
   - {"action": "edit_expense", "name": "Rent", "amount": 850}
   - {"action": "delete_expense", "name": "Rent"}
4. Savings Goals:
   - {"action": "add_goal", "name": "Phone", "amount": 1000}
   - {"action": "edit_goal", "name": "Phone", "amount": 1200}
   - {"action": "delete_goal", "name": "Phone"}
5. App Settings:
   - {"action": "set_theme", "theme": "dark" | "light"}
   - {"action": "change_avatar", "initial": "M"}

CURRENT APP CONTEXT:
- Active Balance: ${currentBalanceStr}
- Current Avatar: "${avatarSymbol}"
- Current Theme: "${document.body.classList.contains('dark-mode') ? 'dark' : 'light'}"
- Savings goals: ${JSON.stringify(savingGoals)}
- Monthly income: ${JSON.stringify(incomeSources)}
- Monthly expenses: ${JSON.stringify(expenseSources)}

User input: "${userPrompt}"`
                }]
            }],
            generationConfig: {
                responseMimeType: "application/json"
            }
        };

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestData)
            });

            if (response.status === 429) {
                addChatMessage('PiggiAI', 'Rate limit reached. Please wait a moment before asking again.');
                return;
            }

            if (!response.ok) {
                const errData = await response.json();
                const errMsg = errData.error?.message || 'Unknown error';
                addChatMessage('PiggiAI', `API Error: ${errMsg}`);
                return;
            }

            const data = await response.json();
            const cleanText = data.candidates[0].content.parts[0].text.trim();
            const result = JSON.parse(cleanText);

            if (result.actions && Array.isArray(result.actions)) {
                result.actions.forEach(executeAction);
            }

            if (result.reply) {
                addChatMessage('PiggiAI', result.reply);
            } else if (!result.actions || result.actions.length === 0) {
                addChatMessage('PiggiAI', 'I have processed your request.');
            }

        } catch (error) {
            console.error("An error occurred in the application logic:", error);
            addChatMessage('PiggiAI', 'An error occurred while processing the response.');
        }
    });
}

updateBalanceUI();
renderGoals();
renderIncome();
renderExpenses();