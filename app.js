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

// --- LOGIQUE ALARME FORTE ---
function playStrongAlert(durationSeconds = 3) {
    if (alarmSound) {
        alarmSound.currentTime = 0; // Recommencer au début
        alarmSound.volume = 1.0;    // Volume maximum
        alarmSound.play().catch(e => console.log("Audio bloqué par le navigateur"));
        
        // Arrêter le son après la durée souhaitée
        setTimeout(() => {
            alarmSound.pause();
        }, durationSeconds * 1000);
    }

    if ("vibrate" in navigator) {
        // Séquence de vibration longue : 500ms ON, 200ms OFF, répétée
        navigator.vibrate([500, 200, 500, 200, 500, 200, 1000]);
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
        alert("Action requise : Utilisez le menu de votre navigateur pour 'Installer' ou 'Ajouter à l'écran d'accueil'.");
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
    
    playStrongAlert(4); // Alarme de 4 secondes pour le déblocage

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
            playStrongAlert(2); // Alarme de 2 secondes pour le re-verrouillage
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
        alert("Nouvel objectif enregistré !");
    }
}

// Capteur de mouvement
window.addEventListener('devicemotion', (event) => {
    if (isUnlocked || !installOverlay.classList.contains('overlay-hidden')) return;
    const acc = event.accelerationIncludingGravity;
    if (!acc) return;
    const total = Math.sqrt(acc.x**2 + acc.y**2 + acc.z**2);
    if (total > 13) { // Sensibilité légèrement réduite pour éviter la triche
        currentSteps++;
        updateUI();
    }
});

// Test Espace PC
window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !isUnlocked) { currentSteps += 50; updateUI(); }
});

updateUI();