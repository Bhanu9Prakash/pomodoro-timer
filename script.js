let timer;
let timeLeft;
let isRunning = false;
let currentTask = '';
let workDuration = 25 * 60;
let breakDuration = 5 * 60;
let completedSessions = 0;

const timerDisplay = document.getElementById('timer');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const settingsBtn = document.getElementById('settingsBtn');
const darkModeToggle = document.getElementById('darkModeToggle');
const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');
const historyList = document.getElementById('historyList');
const timerProgress = document.querySelector('.timer-progress');
const settingsModal = document.getElementById('settingsModal');
const saveSettingsBtn = document.getElementById('saveSettings');
const alert = document.getElementById('alert');

// Initialize weekly data
let weeklyData = [
    { day: 'Mon', focusTime: 0 },
    { day: 'Tue', focusTime: 0 },
    { day: 'Wed', focusTime: 0 },
    { day: 'Thu', focusTime: 0 },
    { day: 'Fri', focusTime: 0 },
    { day: 'Sat', focusTime: 0 },
    { day: 'Sun', focusTime: 0 }
];

function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    updateProgress();
}

function updateProgress() {
    const progress = 1 - (timeLeft / workDuration);
    const dashoffset = 283 * (1 - progress);
    timerProgress.style.strokeDashoffset = dashoffset;
}

function startTimer() {
    if (!isRunning) {
        isRunning = true;
        timer = setInterval(() => {
            timeLeft--;
            updateTimerDisplay();
            if (timeLeft === 0) {
                clearInterval(timer);
                isRunning = false;
                addToHistory();
                playNotificationSound();
                showAlert();
                updateWeeklyData();
                resetTimer();
            }
        }, 1000);
    }
}

function pauseTimer() {
    clearInterval(timer);
    isRunning = false;
}

function resetTimer() {
    clearInterval(timer);
    isRunning = false;
    timeLeft = workDuration;
    updateTimerDisplay();
}

function addTask() {
    const taskText = taskInput.value.trim();
    if (taskText) {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${taskText}</span>
            <button class="btn delete-task"><i class="fas fa-trash"></i></button>
        `;
        li.querySelector('.delete-task').addEventListener('click', () => {
            li.remove();
            saveTasks();
        });
        taskList.appendChild(li);
        taskInput.value = '';
        currentTask = taskText;
        saveTasks();
    }
}

function addToHistory() {
    const li = document.createElement('li');
    li.textContent = `${currentTask} - Completed`;
    historyList.appendChild(li);
    saveHistory();
    completedSessions++;
}

function saveTasks() {
    const tasks = Array.from(taskList.children).map(li => li.querySelector('span').textContent);
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function loadTasks() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.forEach(task => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${task}</span>
            <button class="btn delete-task"><i class="fas fa-trash"></i></button>
        `;
        li.querySelector('.delete-task').addEventListener('click', () => {
            li.remove();
            saveTasks();
        });
        taskList.appendChild(li);
    });
}

function saveHistory() {
    const history = Array.from(historyList.children).map(li => li.textContent);
    localStorage.setItem('history', JSON.stringify(history));
}

function loadHistory() {
    const history = JSON.parse(localStorage.getItem('history')) || [];
    history.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        historyList.appendChild(li);
    });
}

function playNotificationSound() {
    const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3');
    audio.play();
}

function showAlert() {
    alert.style.display = 'block';
    setTimeout(() => {
        alert.style.display = 'none';
    }, 5000);
}

function updateWeeklyData() {
    const today = new Date().getDay();
    const dayIndex = today === 0 ? 6 : today - 1; // Adjust for Sunday
    weeklyData[dayIndex].focusTime += workDuration / 60; // Add completed session time in minutes
    renderChart();
}

function renderChart() {
    const ctx = document.getElementById('weeklyChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: weeklyData.map(d => d.day),
            datasets: [{
                label: 'Focus Time (minutes)',
                data: weeklyData.map(d => d.focusTime),
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
    darkModeToggle.innerHTML = isDarkMode ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
}

function loadDarkModePreference() {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
}

function openSettings() {
    settingsModal.style.display = 'block';
    document.getElementById('workDuration').value = workDuration / 60;
    document.getElementById('breakDuration').value = breakDuration / 60;
}

function closeSettings() {
    settingsModal.style.display = 'none';
}

function saveSettings() {
    workDuration = document.getElementById('workDuration').value * 60;
    breakDuration = document.getElementById('breakDuration').value * 60;
    localStorage.setItem('workDuration', workDuration);
    localStorage.setItem('breakDuration', breakDuration);
    closeSettings();
    resetTimer();
}

// Event Listeners
startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);
settingsBtn.addEventListener('click', openSettings);
darkModeToggle.addEventListener('click', toggleDarkMode);
addTaskBtn.addEventListener('click', addTask);
saveSettingsBtn.addEventListener('click', saveSettings);

window.addEventListener('click', (event) => {
    if (event.target == settingsModal) {
        closeSettings();
    }
});
// Add these functions to your existing JavaScript

function addTouchSupport() {
    // Add touch support for buttons
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('touchstart', function(e) {
            e.preventDefault(); // Prevent double-tap zoom on mobile
            this.click();
        });
    });

    // Add swipe support for task list items
    const taskItems = document.querySelectorAll('.task-list li');
    taskItems.forEach(item => {
        let touchStartX = 0;
        let touchEndX = 0;

        item.addEventListener('touchstart', function(e) {
            touchStartX = e.changedTouches[0].screenX;
        }, false);

        item.addEventListener('touchend', function(e) {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe(this);
        }, false);

        function handleSwipe(element) {
            if (touchStartX - touchEndX > 50) { // Swipe left
                // Show delete button
                const deleteBtn = element.querySelector('.delete-task');
                deleteBtn.style.display = 'block';
            }
        }
    });
}

function optimizeForMobile() {
    // Adjust chart options for better mobile display
    if (window.innerWidth < 768) {
        Chart.defaults.font.size = 10;
        Chart.defaults.plugins.legend.display = false;
    }

    // Lazy load session history
    const sessionHistory = document.getElementById('sessionHistory');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                loadHistory();
                observer.unobserve(entry.target);
            }
        });
    });
    observer.observe(sessionHistory);
}

// Modify the init function to include these new mobile optimizations
function init() {
    loadDarkModePreference();
    workDuration = parseInt(localStorage.getItem('workDuration')) || workDuration;
    breakDuration = parseInt(localStorage.getItem('breakDuration')) || breakDuration;
    resetTimer();
    loadTasks();
    renderChart();
    addTouchSupport();
    optimizeForMobile();
}

// Add a resize event listener to adjust the chart when the screen size changes
window.addEventListener('resize', () => {
    optimizeForMobile();
    renderChart(); // Re-render the chart with new options
});

init();



