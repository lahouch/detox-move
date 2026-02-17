let stepGoal = parseInt(localStorage.getItem('stepGoal')) || 1000;
let currentSteps = parseInt(localStorage.getItem('currentSteps')) || 0;
let lastUpdate = localStorage.getItem('lastUpdateTime');
let deferredPrompt;

// Initialisation de l'affichage
document.getElementById('goal-display').innerText = stepGoal;

// --- FONCTION VIBRATION ---
function triggerVibration() {
    if ("vibrate" in navigator) {
        // Vibration : 300ms marche, 100ms pause, 300ms marche
        navigator.vibrate([300, 100, 300]);
        console.log("Vibration de reset déclenchée");
    }
}

// --- LOGIQUE DE RESET AUTOMATIQUE (1 MINUTE) ---
function checkTimeReset() {
    const now = new Date().getTime();
    
    if (lastUpdate) {
        const diffInSeconds = (now - parseInt(lastUpdate)) / 1000;
        
        if (diffInSeconds > 30 && currentSteps > 0) {
            console.log("Inactivité > 30s : Reset du compteur.");
            currentSteps = 0;
            triggerVibration(); // On fait vibrer le téléphone au reset
            saveData();
            updateUI();
        }
    }
}

function saveData() {
    localStorage.setItem('currentSteps', currentSteps);
    localStorage.setItem('lastUpdateTime', new Date().getTime());
}

// --- LOGIQUE INSTALLATION ---
const installBtn = document.getElementById('install-btn');
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installBtn.style.display = 'block';
});

installBtn.addEventListener('click', async () => {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') installBtn.style.display = 'none';
        deferredPrompt = null;
    }
});

// --- LOGIQUE COMPTEUR DE PAS ---
function updateGoal() {
    const input = document.getElementById('step-input');
    const newGoal = parseInt(input.value);
    if (newGoal > 0) {
        stepGoal = newGoal;
        localStorage.setItem('stepGoal', newGoal);
        document.getElementById('goal-display').innerText = stepGoal;
        currentSteps = 0;
        saveData();
        updateUI();
    }
}

function updateUI() {
    const percent = Math.min((currentSteps / stepGoal) * 100, 100);
    const fill = document.getElementById('progress-fill');
    const statusMsg = document.getElementById('status-msg');
    const counter = document.getElementById('step-counter');

    counter.innerText = currentSteps;
    fill.style.width = percent + "%";

    if (percent >= 100) {
        fill.style.background = "var(--primary)";
        statusMsg.innerText = "✅ Écran Débloqué !";
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
        checkTimeReset();
        const acc = event.accelerationIncludingGravity;
        if(!acc) return;
        const totalAcc = Math.sqrt(acc.x**2 + acc.y**2 + acc.z**2);
        if (totalAcc > 12) { 
            currentSteps++;
            saveData();
            updateUI();
        }
    });
}

// Vérification constante
setInterval(checkTimeReset, 1000);

// TEST SUR PC : Espace pour simuler
window.addEventListener('keydown', (e) => {
    if(e.code === 'Space') { 
        checkTimeReset();
        currentSteps += 50; 
        saveData();
        updateUI(); 
    }
});

updateUI();