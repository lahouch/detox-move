let stepGoal = parseInt(localStorage.getItem('stepGoal')) || 1000;
let currentSteps = parseInt(localStorage.getItem('currentSteps')) || 0;
let lastUpdate = localStorage.getItem('lastUpdateTime');
let isUnlocked = false;
let countdownTimer;
let wakeLock = null;

const alarmSound = document.getElementById('alarm-sound');
document.getElementById('goal-display').innerText = stepGoal;

// --- FONCTIONS ALERTE (SON + VIBRER) ---
function playAlert() {
    if (alarmSound) {
        alarmSound.play().catch(e => console.log("L'utilisateur doit interagir d'abord."));
    }
    if ("vibrate" in navigator) navigator.vibrate([300, 100, 300]);
}

// --- EMPECHER LA MISE EN VEILLE (BACKGROUND WORK) ---
async function requestWakeLock() {
    try {
        if ('wakeLock' in navigator) {
            wakeLock = await navigator.wakeLock.request('screen');
            console.log("Wake Lock actif : l'app ne s'endormira pas.");
        }
    } catch (err) {
        console.error(`${err.name}, ${err.message}`);
    }
}

// Relancer le Wake Lock si on revient sur l'app
document.addEventListener('visibilitychange', () => {
    if (wakeLock !== null && document.visibilityState === 'visible') {
        requestWakeLock();
    }
});

// --- CONFIGURATION OBJECTIF ---
function updateGoal() {
    const input = document.getElementById('step-input');
    const newGoal = parseInt(input.value);
    if (isNaN(newGoal) || newGoal <= 0) return;
    stepGoal = newGoal;
    localStorage.setItem('stepGoal', stepGoal);
    document.getElementById('goal-display').innerText = stepGoal;
    currentSteps = 0;
    updateUI();
}

// --- COMPTE À REBOURS ---
function startCountdown() {
    isUnlocked = true;
    let secondsLeft = 20;
    const timerDiv = document.getElementById('timer-display');
    const secondsSpan = document.getElementById('seconds');
    
    timerDiv.classList.remove('timer-hidden');
    playAlert(); // Alarme de début

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
    document.getElementById('timer-display').classList.add('timer-hidden');
    playAlert(); // Alarme de fin
    updateUI();
}

// --- MISE À JOUR UI ---
function updateUI() {
    const counter = document.getElementById('step-counter');
    const fill = document.getElementById('progress-fill');
    const statusMsg = document.getElementById('status-msg');
    
    counter.innerText = currentSteps;
    const percent = Math.min((currentSteps / stepGoal) * 100, 100);
    fill.style.width = percent + "%";

    if (percent >= 100 && !isUnlocked) startCountdown();

    if (isUnlocked) {
        statusMsg.innerText = "✅ LIBRE !";
        statusMsg.classList.add('unlocked');
        fill.style.background = "var(--primary)";
    } else {
        statusMsg.innerText = "🔒 Verrouillé";
        statusMsg.classList.remove('unlocked');
        fill.style.background = percent > 50 ? "var(--orange)" : "var(--danger)";
    }
}

// --- CAPTEUR DE MOUVEMENT ---
if ('DeviceMotionEvent' in window) {
    // Demander le Wake Lock au premier mouvement pour économiser la batterie avant
    requestWakeLock();

    window.addEventListener('devicemotion', (event) => {
        if (isUnlocked) return;
        
        const acc = event.accelerationIncludingGravity;
        if(!acc) return;
        const totalAcc = Math.sqrt(acc.x**2 + acc.y**2 + acc.z**2);
        
        if (totalAcc > 12) { 
            currentSteps++;
            localStorage.setItem('currentSteps', currentSteps);
            updateUI();
        }
    });
}

// Test PC
window.addEventListener('keydown', (e) => {
    if(e.code === 'Space' && !isUnlocked) { currentSteps += 100; updateUI(); }
});

updateUI();