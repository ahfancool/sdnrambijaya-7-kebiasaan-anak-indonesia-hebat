// js/script.js

document.addEventListener('DOMContentLoaded', () => {
    // Definisi kebiasaan dan tipenya
    const habits = [
        { id: 'bangun-pagi', type: 'checkbox' },
        { id: 'beribadah', type: 'checkbox' },
        { id: 'berolahraga', type: 'button' },
        { id: 'makan-sehat', type: 'meal-buttons', meals: ['sarapan', 'makan-siang', 'makan-malam'] },
        { id: 'gemar-belajar', type: 'button' },
        { id: 'bermasyarakat', type: 'button' },
        { id: 'tidur-cepat', type: 'checkbox' }
    ];

    // Elemen DOM utama
    const progressCircle = document.getElementById('progress-circle');
    const progressText = document.getElementById('progress-text');
    const totalHabits = habits.length;
    const userNameSpan = document.getElementById('user-name');
    const nameModal = document.getElementById('name-modal');
    const nameModalContent = document.getElementById('name-modal-content');
    const nameInput = document.getElementById('name-input');
    const saveNameButton = document.getElementById('save-name-button');
    const dailyCompletionMessage = document.getElementById('daily-completion-message');

    // Target bulanan
    const MONTHLY_TARGET_DAYS = 30;

    // Fungsi untuk mendapatkan tanggal hari ini dalam format YYYY-MM-DD
    const getTodayDate = () => {
        const date = new Date();
        return date.toISOString().split('T')[0];
    };

    // Fungsi untuk mendapatkan tanggal N hari yang lalu dalam format YYYY-MM-DD
    const getDateNDaysAgo = (n) => {
        const date = new Date();
        date.setDate(date.getDate() - n);
        return date.toISOString().split('T')[0];
    };

    // Memuat status kebiasaan harian dari local storage
    const loadDailyHabits = () => {
        const today = getTodayDate();
        let savedState = JSON.parse(localStorage.getItem('dailyHabitState')) || {};

        // Jika status yang tersimpan bukan untuk hari ini, reset kebiasaan harian
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
            localStorage.setItem('dailyHabitState', JSON.stringify(savedState));
        }
        return savedState;
    };

    // Memuat progres bulanan dari local storage
    const loadMonthlyProgress = () => {
        let monthlyProgress = JSON.parse(localStorage.getItem('monthlyProgress')) || {
            startDate: getTodayDate(), // Tanggal mulai tantangan
            completedDates: [] // Array tanggal di mana semua kebiasaan harian selesai
        };

        // Jika sudah 30 hari sejak startDate dan belum ada reset, atau jika bulan berganti
        // Ini adalah logika untuk menentukan apakah tantangan 30 hari perlu direset
        const today = new Date(getTodayDate());
        const startDate = new Date(monthlyProgress.startDate);
        const diffTime = Math.abs(today - startDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Jika sudah melewati 30 hari dari start date, dan belum ada redirect/reset
        // Atau jika ada 30 hari yang selesai dalam periode 30 hari terakhir
        if (monthlyProgress.completedDates.length >= MONTHLY_TARGET_DAYS) {
            // Filter completedDates untuk 30 hari terakhir
            const thirtyDaysAgo = getDateNDaysAgo(MONTHLY_TARGET_DAYS);
            const recentCompletedDates = monthlyProgress.completedDates.filter(date => new Date(date) >= new Date(thirtyDaysAgo));
            
            // Jika ada 30 hari unik yang selesai dalam 30 hari terakhir, berarti target tercapai
            const uniqueRecentCompletedDays = new Set(recentCompletedDates).size;

            if (uniqueRecentCompletedDays >= MONTHLY_TARGET_DAYS) {
                // Target 30 hari tercapai, arahkan ke halaman rekap
                window.location.href = 'recap.html';
                // Setelah redirect, data bulanan akan direset di halaman rekap saat "Mulai Tantangan Baru" diklik
                return monthlyProgress; // Kembalikan progres saat ini, reset akan terjadi di recap.html
            }
        }
        
        return monthlyProgress;
    };

    let currentDailyHabitState = loadDailyHabits();
    let currentMonthlyProgress = loadMonthlyProgress();

    // Menyimpan status kebiasaan harian ke local storage
    const saveDailyHabits = () => {
        localStorage.setItem('dailyHabitState', JSON.stringify(currentDailyHabitState));
    };

    // Menyimpan progres bulanan ke local storage
    const saveMonthlyProgress = () => {
        localStorage.setItem('monthlyProgress', JSON.stringify(currentMonthlyProgress));
    };

    // Memperbarui lingkaran progres dan teks
    const updateProgress = () => {
        let completedCount = 0;
        habits.forEach(habit => {
            if (habit.type === 'meal-buttons') {
                const mealStatus = currentDailyHabitState.completed[habit.id];
                if (mealStatus && Object.values(mealStatus).every(status => status)) {
                    completedCount++;
                }
            } else if (currentDailyHabitState.completed[habit.id]) {
                completedCount++;
            }
        });

        const percentage = (completedCount / totalHabits) * 100;
        const circumference = 2 * Math.PI * 40;
        const offset = circumference - (percentage / 100) * circumference;

        progressCircle.style.strokeDashoffset = offset;
        progressText.textContent = `${completedCount}/${totalHabits}`;
        progressCircle.style.stroke = completedCount === totalHabits ? '#10B981' : '#22C55E'; // Hijau jika semua selesai, hijau terang jika belum

        // Tampilkan pesan selesai harian jika semua kebiasaan selesai
        if (completedCount === totalHabits) {
            dailyCompletionMessage.classList.remove('hidden');
            // Jika semua kebiasaan harian selesai, catat tanggal ini ke progres bulanan
            const today = getTodayDate();
            if (!currentMonthlyProgress.completedDates.includes(today)) {
                currentMonthlyProgress.completedDates.push(today);
                saveMonthlyProgress();
            }
            
            // Periksa apakah target 30 hari tercapai
            const uniqueCompletedDays = new Set(currentMonthlyProgress.completedDates).size;
            if (uniqueCompletedDays >= MONTHLY_TARGET_DAYS) {
                window.location.href = 'recap.html'; // Arahkan ke halaman rekap
                // Data akan direset di recap.html saat tombol "Mulai Tantangan Baru" diklik
            }

        } else {
            dailyCompletionMessage.classList.add('hidden');
        }
    };

    // Mengikat event listener ke tombol dan checkbox kebiasaan
    const bindEventListeners = () => {
        habits.forEach(habit => {
            if (habit.type === 'checkbox') {
                const checkbox = document.getElementById(habit.id);
                if (checkbox) {
                    checkbox.checked = currentDailyHabitState.completed[habit.id];
                    checkbox.addEventListener('change', (event) => {
                        currentDailyHabitState.completed[habit.id] = event.target.checked;
                        saveDailyHabits();
                        updateProgress();
                    });
                }
            } else if (habit.type === 'button') {
                const button = document.querySelector(`[data-habit-id="${habit.id}"]`);
                if (button) {
                    if (currentDailyHabitState.completed[habit.id]) {
                        button.classList.add('completed');
                        button.textContent = 'Selesai ✔';
                    }
                    button.addEventListener('click', () => {
                        if (!currentDailyHabitState.completed[habit.id]) { // Mencegah klik berulang
                            currentDailyHabitState.completed[habit.id] = true;
                            button.classList.add('completed');
                            button.textContent = 'Selesai ✔';
                            saveDailyHabits();
                            updateProgress();
                        }
                    });
                }
            } else if (habit.type === 'meal-buttons') {
                const mealButtonsContainer = document.querySelector(`[data-habit-id="${habit.id}"]`); // Container div
                if (mealButtonsContainer) {
                    const mealButtons = mealButtonsContainer.querySelectorAll('.meal-button');
                    mealButtons.forEach(button => {
                        const meal = button.dataset.meal;
                        if (currentDailyHabitState.completed[habit.id] && currentDailyHabitState.completed[habit.id][meal]) {
                            button.classList.add('completed');
                        }
                        button.addEventListener('click', () => {
                            if (!currentDailyHabitState.completed[habit.id][meal]) { // Mencegah klik berulang
                                currentDailyHabitState.completed[habit.id][meal] = true;
                                button.classList.add('completed');
                                saveDailyHabits();
                                updateProgress();
                            }
                        });
                    });
                }
            }
        });
    };

    // --- Logika Nama Pengguna ---
    const checkAndPromptName = () => {
        const userName = localStorage.getItem('userName');
        if (userName) {
            userNameSpan.textContent = userName;
            nameModal.classList.add('hidden');
            nameModalContent.classList.remove('show');
        } else {
            userNameSpan.textContent = 'Teman Hebat'; // Teks default jika belum ada nama
            nameModal.classList.remove('hidden');
            setTimeout(() => {
                nameModal.classList.add('show'); // Menambahkan kelas 'show' untuk modal wrapper
                nameModalContent.classList.add('show'); // Menambahkan kelas 'show' untuk konten modal
            }, 10);
            nameInput.focus();
        }
    };

    saveNameButton.addEventListener('click', () => {
        const inputName = nameInput.value.trim();
        if (inputName) {
            localStorage.setItem('userName', inputName);
            userNameSpan.textContent = inputName;
            nameModalContent.classList.remove('show');
            setTimeout(() => {
                nameModal.classList.remove('show'); // Hapus kelas 'show' dari modal wrapper
                nameModal.classList.add('hidden');
            }, 300); // Sesuaikan dengan durasi transisi CSS
        } else {
            nameInput.placeholder = "Nama tidak boleh kosong!";
            nameInput.classList.add('border-red-500');
        }
    });

    nameInput.addEventListener('input', () => {
        nameInput.classList.remove('border-red-500');
        nameInput.placeholder = "Masukkan namamu di sini...";
    });

    // Panggilan awal saat DOM selesai dimuat
    bindEventListeners(); // Mengikat event listener ke kebiasaan
    checkAndPromptName(); // Memeriksa dan meminta nama pengguna
    updateProgress(); // Memperbarui progres awal
});
