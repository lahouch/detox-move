let stepGoal = parseInt(localStorage.getItem('stepGoal')) || 1000;
let currentSteps = 0;
let isUnlocked = false;
const alarmSound = document.getElementById('alarm-sound');
const lockOverlay = document.getElementById('lock-overlay');
const giantCounter = document.getElementById('giant-counter');

// --- DEMANDER PERMISSION NOTIFICATIONS ---
if ("Notification" in window) {
    Notification.requestPermission();
}

function playAlert() {
    if (alarmSound) alarmSound.play().catch(() => {});
    if ("vibrate" in navigator) navigator.vibrate([500, 110, 500]);
}

function updateUI() {
    document.getElementById('step-counter').innerText = currentSteps;
    giantCounter.innerText = currentSteps;
    document.getElementById('goal-display').innerText = stepGoal;
    
    const percent = Math.min((currentSteps / stepGoal) * 100, 100);
    document.getElementById('progress-fill').style.width = percent + "%";

    if (percent >= 100 && !isUnlocked) {
        unlockApp();
    } else if (!isUnlocked) {
        lockOverlay.classList.remove('overlay-hidden');
    }
}

function unlockApp() {
    isUnlocked = true;
    lockOverlay.classList.add('overlay-hidden');
    document.getElementById('timer-display').classList.remove('timer-hidden');
    playAlert();

    let timeLeft = 20;
    const interval = setInterval(() => {
        timeLeft--;
        document.getElementById('seconds').innerText = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(interval);
            currentSteps = 0;
            isUnlocked = false;
            playAlert();
            updateUI();
        }
    }, 1000);
}

function updateGoal() {
    const val = parseInt(document.getElementById('step-input').value);
    if (val > 0) {
        stepGoal = val;
        localStorage.setItem('stepGoal', stepGoal);
        currentSteps = 0;
        updateUI();
    }
}

// Détection mouvement
window.addEventListener('devicemotion', (event) => {
    if (isUnlocked) return;
    const acc = event.accelerationIncludingGravity;
    if (!acc) return;
    const total = Math.sqrt(acc.x**2 + acc.y**2 + acc.z**2);
    if (total > 12) {
        currentSteps++;
        updateUI();
    }
});

// Test PC
window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !isUnlocked) { currentSteps += 50; updateUI(); }
});

updateUI();