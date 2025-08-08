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

        // If saved state is for a different day, reset it
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

    // Save habits state to local storage
    const saveHabits = () => {
        localStorage.setItem('habitsState', JSON.stringify(currentHabitsState));
    };

    // Update progress circle and text
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
        const circumference = 2 * Math.PI * 40; // 2 * PI * radius (radius is 40)
        const offset = circumference - (percentage / 100) * circumference;

        progressCircle.style.strokeDashoffset = offset;
        progressText.textContent = `${completedCount}/${totalHabits}`;
        progressCircle.style.stroke = completedCount === totalHabits ? '#10B981' : '#22C55E'; // Green-500 or Green-600

        // Show daily completion message if all habits are done
        if (completedCount === totalHabits) {
            dailyCompletionMessage.classList.remove('hidden');
        } else {
            dailyCompletionMessage.classList.add('hidden');
        }
    };

    // Render habits and attach event listeners
    habits.forEach(habit => {
        const habitElement = document.getElementById(habit.id); // Get the main element for the habit
        if (!habitElement) { // Skip if element not found, useful for meal-buttons which don't have direct ID
            return;
        }

        if (habit.type === 'checkbox') {
            const checkbox = habitElement; // The input itself has the ID
            if (checkbox) {
                checkbox.checked = currentHabitsState.completed[habit.id];
                checkbox.addEventListener('change', (event) => {
                    currentHabitsState.completed[habit.id] = event.target.checked;
                    saveHabits();
                    updateProgress();
                });
            }
        } else if (habit.type === 'button') {
            // Find the button within the parent habit-item div
            const button = document.querySelector(`#habits-list .habit-item:has(#${habit.id}) .action-button`);
            if (button) {
                if (currentHabitsState.completed[habit.id]) {
                    button.classList.add('completed');
                    button.textContent = 'Selesai ✔';
                }
                button.addEventListener('click', () => {
                    if (!currentHabitsState.completed[habit.id]) { // Prevent re-clicking
                        currentHabitsState.completed[habit.id] = true;
                        button.classList.add('completed');
                        button.textContent = 'Selesai ✔';
                        saveHabits();
                        updateProgress();
                    }
                });
            }
        } else if (habit.type === 'meal-buttons') {
            // Find the meal buttons within the parent habit-item div
            const mealButtons = document.querySelectorAll(`#habits-list .habit-item:has(#${habit.id}) .meal-button`);
            mealButtons.forEach(button => {
                const meal = button.dataset.meal;
                if (currentHabitsState.completed[habit.id] && currentHabitsState.completed[habit.id][meal]) {
                    button.classList.add('completed');
                }
                button.addEventListener('click', () => {
                    if (!currentHabitsState.completed[habit.id][meal]) { // Prevent re-clicking
                        currentHabitsState.completed[habit.id][meal] = true;
                        button.classList.add('completed');
                        saveHabits();
                        updateProgress();
                    }
                });
            });
        }
    });

    // --- User Name Logic ---
    const checkAndPromptName = () => {
        let userName = localStorage.getItem('userName');
        if (userName) {
            userNameSpan.textContent = userName;
            nameModal.classList.add('hidden'); // Ensure modal is hidden
            nameModalContent.classList.remove('show'); // Ensure modal content is hidden
        } else {
            userNameSpan.textContent = 'Teman Hebat'; // Default text
            nameModal.classList.remove('hidden'); // Show modal
            setTimeout(() => {
                nameModalContent.classList.add('show'); // Trigger transition
            }, 10); // Small delay for transition to work
            nameInput.focus(); // Focus on input field
        }
    };

    saveNameButton.addEventListener('click', () => {
        const inputName = nameInput.value.trim();
        if (inputName) {
            localStorage.setItem('userName', inputName);
            userNameSpan.textContent = inputName;
            nameModalContent.classList.remove('show'); // Hide content with transition
            setTimeout(() => {
                nameModal.classList.add('hidden'); // Hide modal wrapper after transition
            }, 300); // Match transition duration
        } else {
            // Optionally, show a message to the user that name cannot be empty
            console.log("Nama tidak boleh kosong!");
            nameInput.placeholder = "Nama tidak boleh kosong!";
            nameInput.classList.add('border-red-500'); // Highlight input as error
        }
    });

    nameInput.addEventListener('input', () => {
        // Remove error styling when user starts typing
        nameInput.classList.remove('border-red-500');
        nameInput.placeholder = "Masukkan namamu di sini...";
    });


    // Initial calls on load
    checkAndPromptName(); // Check for name and prompt if needed
    updateProgress(); // Initial progress update
});
