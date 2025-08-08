document.addEventListener('DOMContentLoaded', () => {
    const habits = [
        { id: 'bangun-pagi', type: 'checkbox' },
        { id: 'beribadah', type: 'checkbox' },
        { id: 'berolahraga', type: 'button' },
        { id: 'makan-sehat', type: 'meal-buttons', meals: ['sarapan', 'makan-siang', 'makan-malam'] },
        { id: 'gemar-belajar', type: 'button' },
        { id: 'bermasyarakat', type: 'button' },
        { id: 'tidur-cepat', type: 'checkbox' }
    ];

    const progressCircle = document.getElementById('progress-circle');
    const progressText = document.getElementById('progress-text');
    const totalHabits = habits.length;
    const userNameSpan = document.getElementById('user-name');
    const nameModal = document.getElementById('name-modal');
    const nameModalContent = document.getElementById('name-modal-content');
    const nameInput = document.getElementById('name-input');
    const saveNameButton = document.getElementById('save-name-button');
    const dailyCompletionMessage = document.getElementById('daily-completion-message');

    // Function to get today's date in YYYY-MM-DD format
    const getTodayDate = () => {
        const date = new Date();
        return date.toISOString().split('T')[0];
    };

    // Load habits state from local storage
    const loadHabits = () => {
        const today = getTodayDate();
        let savedState = JSON.parse(localStorage.getItem('habitsState')) || {};

        if (savedState.date !== today) {
            savedState = {
                date: today,
                completed: {}
            };
            habits.forEach(habit => {
                if (habit.type === 'meal-buttons') {
                    savedState.completed[habit.id] = {};
                    habit.meals.forEach(meal => {
                        savedState.completed[habit.id][meal] = false;
                    });
                } else {
                    savedState.completed[habit.id] = false;
                }
            });
            localStorage.setItem('habitsState', JSON.stringify(savedState));
        }
        return savedState;
    };

    let currentHabitsState = loadHabits();

    const saveHabits = () => {
        localStorage.setItem('habitsState', JSON.stringify(currentHabitsState));
    };

    const updateProgress = () => {
        let completedCount = 0;
        habits.forEach(habit => {
            if (habit.type === 'meal-buttons') {
                const mealStatus = currentHabitsState.completed[habit.id];
                if (mealStatus && Object.values(mealStatus).every(status => status)) {
                    completedCount++;
                }
            } else if (currentHabitsState.completed[habit.id]) {
                completedCount++;
            }
        });

        const percentage = (completedCount / totalHabits) * 100;
        const circumference = 2 * Math.PI * 40;
        const offset = circumference - (percentage / 100) * circumference;

        progressCircle.style.strokeDashoffset = offset;
        progressText.textContent = `${completedCount}/${totalHabits}`;
        progressCircle.style.stroke = completedCount === totalHabits ? '#10B981' : '#22C55E';

        if (completedCount === totalHabits) {
            dailyCompletionMessage.classList.remove('hidden');
        } else {
            dailyCompletionMessage.classList.add('hidden');
        }
    };

    // Corrected way to select and attach event listeners to buttons
    const bindEventListeners = () => {
        habits.forEach(habit => {
            if (habit.type === 'checkbox') {
                const checkbox = document.getElementById(habit.id);
                if (checkbox) {
                    checkbox.checked = currentHabitsState.completed[habit.id];
                    checkbox.addEventListener('change', (event) => {
                        currentHabitsState.completed[habit.id] = event.target.checked;
                        saveHabits();
                        updateProgress();
                    });
                }
            } else if (habit.type === 'button') {
                const button = document.querySelector(`[data-habit-id="${habit.id}"]`);
                if (button) {
                    if (currentHabitsState.completed[habit.id]) {
                        button.classList.add('completed');
                        button.textContent = 'Selesai ✔';
                    }
                    button.addEventListener('click', () => {
                        if (!currentHabitsState.completed[habit.id]) {
                            currentHabitsState.completed[habit.id] = true;
                            button.classList.add('completed');
                            button.textContent = 'Selesai ✔';
                            saveHabits();
                            updateProgress();
                        }
                    });
                }
            } else if (habit.type === 'meal-buttons') {
                const mealButtons = document.querySelectorAll(`[data-habit-id="${habit.id}"]`);
                mealButtons.forEach(button => {
                    const meal = button.dataset.meal;
                    if (currentHabitsState.completed[habit.id] && currentHabitsState.completed[habit.id][meal]) {
                        button.classList.add('completed');
                    }
                    button.addEventListener('click', () => {
                        if (!currentHabitsState.completed[habit.id][meal]) {
                            currentHabitsState.completed[habit.id][meal] = true;
                            button.classList.add('completed');
                            saveHabits();
                            updateProgress();
                        }
                    });
                });
            }
        });
    };

    const checkAndPromptName = () => {
        const userName = localStorage.getItem('userName');
        if (userName) {
            userNameSpan.textContent = userName;
            nameModal.classList.add('hidden');
            nameModalContent.classList.remove('show');
        } else {
            nameModal.classList.remove('hidden');
            setTimeout(() => {
                nameModal.classList.add('show');
                nameModalContent.classList.add('show');
            }, 10);
            nameInput.focus();
        }
    };

    saveNameButton.addEventListener('click', () => {
        const inputName = nameInput.value.trim();
        if (inputName) {
            localStorage.setItem('userName', inputName);
            userNameSpan.textContent = inputName;
            nameModal.classList.remove('show');
            nameModalContent.classList.remove('show');
            setTimeout(() => {
                nameModal.classList.add('hidden');
            }, 300);
        } else {
            nameInput.placeholder = "Nama tidak boleh kosong!";
            nameInput.classList.add('border-red-500');
        }
    });

    nameInput.addEventListener('input', () => {
        nameInput.classList.remove('border-red-500');
        nameInput.placeholder = "Masukkan namamu di sini...";
    });

    // Initial calls on load
    bindEventListeners();
    checkAndPromptName();
    updateProgress();
});
