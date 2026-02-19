let stepGoal = parseInt(localStorage.getItem('stepGoal')) || 1000;
let currentSteps = parseInt(localStorage.getItem('currentSteps')) || 0;
let isUnlocked = false;
let countdownTimer;

document.getElementById('goal-display').innerText = stepGoal;

// --- FONCTION VIBRATION ---
function triggerVibration(pattern = [300, 100, 300]) {
    if ("vibrate" in navigator) navigator.vibrate(pattern);
}

// --- LOGIQUE DU COMPTE À REBOURS (20 SECONDES) ---
function startCountdown() {
    isUnlocked = true;
    let secondsLeft = 20;
    const timerDiv = document.getElementById('timer-display');
    const secondsSpan = document.getElementById('seconds');
    
    timerDiv.classList.remove('timer-hidden');
    triggerVibration([500, 100, 500]); // Vibration de victoire

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
    currentSteps = 0; // On reset les pas pour le prochain cycle
    document.getElementById('timer-display').classList.add('timer-hidden');
    triggerVibration([1000]); // Une longue vibration pour dire "C'est fini"
    updateUI();
}

// --- LOGIQUE COMPTEUR DE PAS ---
function updateUI() {
    const percent = Math.min((currentSteps / stepGoal) * 100, 100);
    const fill = document.getElementById('progress-fill');
    const statusMsg = document.getElementById('status-msg');
    const counter = document.getElementById('step-counter');

    counter.innerText = currentSteps;
    fill.style.width = percent + "%";

    if (percent >= 100 && !isUnlocked) {
        startCountdown(); // Lance le timer de 20s
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

// Détection de mouvement
if ('DeviceMotionEvent' in window) {
    window.addEventListener('devicemotion', (event) => {
        if (isUnlocked) return; // On ne compte pas les pas si c'est déjà débloqué
        
        const acc = event.accelerationIncludingGravity;
        if(!acc) return;
        const totalAcc = Math.sqrt(acc.x**2 + acc.y**2 + acc.z**2);
        
        if (totalAcc > 12) { 
            currentSteps++;
            updateUI();
        }
    });
}

// TEST SUR PC
window.addEventListener('keydown', (e) => {
    if(e.code === 'Space' && !isUnlocked) { 
        currentSteps += 100; 
        updateUI(); 
    }
});

// Installation PWA
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    document.getElementById('install-btn').style.display = 'block';
});

document.getElementById('install-btn').addEventListener('click', async () => {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt = null;
    }
});

updateUI();