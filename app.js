let stepGoal = parseInt(localStorage.getItem('stepGoal')) || 1000;
let currentSteps = 0;
let isUnlocked = false;
let deferredPrompt;

const installOverlay = document.getElementById('install-overlay');
const lockOverlay = document.getElementById('lock-overlay');
const giantCounter = document.getElementById('giant-counter');
const alarmSound = document.getElementById('alarm-sound');

// --- DÉTECTION STANDALONE ---
if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
    installOverlay.classList.add('overlay-hidden');
    lockOverlay.classList.remove('overlay-hidden');
}

// --- ALARME RENFORCÉE ---
function playStrongAlert(duration) {
    if (alarmSound) {
        alarmSound.currentTime = 0;
        alarmSound.volume = 1.0;
        alarmSound.play().catch(() => {});
        setTimeout(() => { alarmSound.pause(); }, duration * 1000);
    }
    if ("vibrate" in navigator) {
        navigator.vibrate([400, 100, 400, 100, 400, 100, 800]);
    }
}

// --- INSTALLATION ---
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
});

document.getElementById('install-btn-giant').addEventListener('click', async () => {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') installOverlay.classList.add('overlay-hidden');
        deferredPrompt = null;
    } else {
        alert("Ouvrez le menu de votre navigateur pour installer l'application.");
    }
});

// --- LOGIQUE CORE ---
function updateUI() {
    document.getElementById('step-counter').innerText = currentSteps;
    giantCounter.innerText = currentSteps;
    document.getElementById('goal-display').innerText = stepGoal;
    
    const percent = Math.min((currentSteps / stepGoal) * 100, 100);
    document.getElementById('progress-fill').style.width = percent + "%";

    if (percent >= 100 && !isUnlocked) {
        unlockApp();
    }
}

function unlockApp() {
    isUnlocked = true;
    lockOverlay.classList.add('overlay-hidden');
    document.getElementById('timer-display').classList.remove('timer-hidden');
    
    playStrongAlert(5); // Alarme de 5 secondes

    let timeLeft = 20;
    const interval = setInterval(() => {
        timeLeft--;
        document.getElementById('seconds').innerText = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(interval);
            currentSteps = 0;
            isUnlocked = false;
            lockOverlay.classList.remove('overlay-hidden');
            document.getElementById('timer-display').classList.add('timer-hidden');
            playStrongAlert(2);
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
        alert("Objectif fixé à " + stepGoal + " pas.");
    }
}

// Capteur de mouvement
window.addEventListener('devicemotion', (event) => {
    if (isUnlocked || !installOverlay.classList.contains('overlay-hidden')) return;
    const acc = event.accelerationIncludingGravity;
    if (!acc) return;
    const total = Math.sqrt(acc.x**2 + acc.y**2 + acc.z**2);
    if (total > 13) {
        currentSteps++;
        updateUI();
    }
});

// Test Espace PC
window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !isUnlocked) { currentSteps += 50; updateUI(); }
});

updateUI();