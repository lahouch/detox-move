// --- VARIABLES GLOBALES ---
let stepGoal = parseInt(localStorage.getItem('stepGoal')) || 1000;
let currentSteps = parseInt(localStorage.getItem('currentSteps')) || 0;
let lastUpdate = localStorage.getItem('lastUpdateTime');
let isUnlocked = false;
let countdownTimer;
let deferredPrompt;

// Initialisation affichage objectif au chargement
document.getElementById('goal-display').innerText = stepGoal;

// --- FONCTION VIBRATION ---
function triggerVibration(pattern = [300, 100, 300]) {
    if ("vibrate" in navigator) navigator.vibrate(pattern);
}

// --- CONFIGURATION DE L'OBJECTIF (CORRIGÉ) ---
function updateGoal() {
    const input = document.getElementById('step-input');
    const newGoal = parseInt(input.value);

    if (isNaN(newGoal) || newGoal <= 0) {
        alert("Veuillez entrer un nombre de pas valide.");
        return;
    }

    // Mise à jour
    stepGoal = newGoal;
    localStorage.setItem('stepGoal', stepGoal);
    
    // Mise à jour visuelle immédiate
    document.getElementById('goal-display').innerText = stepGoal;
    
    // Reset de l'effort actuel
    currentSteps = 0;
    localStorage.setItem('currentSteps', 0);
    
    input.value = '';
    alert("Nouvel objectif : " + stepGoal + " pas !");
    updateUI();
}

// --- LOGIQUE DU COMPTE À REBOURS (20 SECONDES) ---
function startCountdown() {
    isUnlocked = true;
    let secondsLeft = 20;
    const timerDiv = document.getElementById('timer-display');
    const secondsSpan = document.getElementById('seconds');
    
    timerDiv.classList.remove('timer-hidden');
    triggerVibration([500, 100, 500]); // Vibration victoire

    countdownTimer = setInterval(() => {
        secondsLeft--;
        secondsSpan.innerText = secondsLeft;

        if (secondsLeft <= 0) {
            clearInterval(countdownTimer);
            lockAgain();
        }
    }, 1000);
}

function lockAgain() {
    isUnlocked = false;
    currentSteps = 0;
    localStorage.setItem('currentSteps', 0);
    document.getElementById('timer-display').classList.add('timer-hidden');
    triggerVibration([1000]); // Vibration fin
    updateUI();
}

// --- RESET AUTO APRÈS 1 MINUTE D'INACTIVITÉ ---
function checkTimeReset() {
    const now = new Date().getTime();
    if (lastUpdate && !isUnlocked) {
        const diffInSeconds = (now - parseInt(lastUpdate)) / 1000;
        if (diffInSeconds > 60 && currentSteps > 0) {
            currentSteps = 0;
            localStorage.setItem('currentSteps', 0);
            triggerVibration([300, 100, 300]);
            updateUI();
        }
    }
}

// --- MISE À JOUR DE L'INTERFACE ---
function updateUI() {
    const counter = document.getElementById('step-counter');
    const fill = document.getElementById('progress-fill');
    const statusMsg = document.getElementById('status-msg');
    
    counter.innerText = currentSteps;
    const percent = Math.min((currentSteps / stepGoal) * 100, 100);
    fill.style.width = percent + "%";

    if (percent >= 100 && !isUnlocked) {
        startCountdown();
    }

    if (isUnlocked) {
        fill.style.background = "var(--primary)";
        statusMsg.innerText = "✅ TEMPS ÉCRAN OUVERT";
        statusMsg.classList.add('unlocked');
    } else {
        fill.style.background = percent > 50 ? "var(--orange)" : "var(--danger)";
        statusMsg.innerText = "🔒 Écran Verrouillé";
        statusMsg.classList.remove('unlocked');
    }
}

// --- CAPTEURS ET EVENTS ---
if ('DeviceMotionEvent' in window) {
    window.addEventListener('devicemotion', (event) => {
        if (isUnlocked) return;
        checkTimeReset();
        
        const acc = event.accelerationIncludingGravity;
        if(!acc) return;
        const totalAcc = Math.sqrt(acc.x**2 + acc.y**2 + acc.z**2);
        
        if (totalAcc > 12) { 
            currentSteps++;
            lastUpdate = new Date().getTime();
            localStorage.setItem('lastUpdateTime', lastUpdate);
            localStorage.setItem('currentSteps', currentSteps);
            updateUI();
        }
    });
}

// Simuler des pas sur PC
window.addEventListener('keydown', (e) => {
    if(e.code === 'Space' && !isUnlocked) { 
        currentSteps += 100; 
        lastUpdate = new Date().getTime();
        localStorage.setItem('lastUpdateTime', lastUpdate);
        updateUI(); 
    }
});

// Installation PWA
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    document.getElementById('install-btn').style.display = 'block';
});

document.getElementById('install-btn').addEventListener('click', () => {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt = null;
    }
});

setInterval(checkTimeReset, 1000);
updateUI();