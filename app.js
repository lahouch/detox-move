let stepGoal = parseInt(localStorage.getItem('stepGoal')) || 1000;
let currentSteps = 0;
let isUnlocked = false;
let audioEnabled = false;
let deferredPrompt;

const alarmSound = document.getElementById('alarm-sound');

// --- FONCTION POUR DÉBLOQUER L'AUDIO ---
function enableAudio() {
    if (!audioEnabled) {
        alarmSound.play().then(() => {
            alarmSound.pause(); // Joue et coupe de suite pour "valider" l'accès
            audioEnabled = true;
            console.log("Audio activé");
        }).catch(e => console.log("Attente d'interaction réelle..."));
    }
}

function playEmergencyAlert(seconds) {
    if (alarmSound && audioEnabled) {
        alarmSound.currentTime = 0;
        alarmSound.volume = 1.0;
        alarmSound.play();
        setTimeout(() => { alarmSound.pause(); }, seconds * 1000);
    }
    if ("vibrate" in navigator) navigator.vibrate([500, 100, 500, 100, 800]);
}

// --- INITIALISATION ---
document.getElementById('goal-display').innerText = stepGoal;
if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
    document.getElementById('install-overlay').classList.add('overlay-hidden');
    document.getElementById('lock-overlay').classList.remove('overlay-hidden');
}

function updateUI() {
    document.getElementById('step-counter').innerText = currentSteps;
    document.getElementById('giant-counter').innerText = currentSteps;
    const percent = Math.min((currentSteps / stepGoal) * 100, 100);
    document.getElementById('progress-fill').style.width = percent + "%";
    if (percent >= 100 && !isUnlocked) unlockApp();
}

function unlockApp() {
    isUnlocked = true;
    document.getElementById('lock-overlay').classList.add('overlay-hidden');
    document.getElementById('timer-display').classList.remove('timer-hidden');
    playEmergencyAlert(5);

    let timeLeft = 20;
    const interval = setInterval(() => {
        timeLeft--;
        document.getElementById('seconds').innerText = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(interval);
            currentSteps = 0;
            isUnlocked = false;
            document.getElementById('lock-overlay').classList.remove('overlay-hidden');
            document.getElementById('timer-display').classList.add('timer-hidden');
            playEmergencyAlert(2);
            updateUI();
        }
    }, 1000);
}

// Installation
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
});

document.getElementById('install-btn-giant').addEventListener('click', async () => {
    enableAudio(); // Débloque le son au clic sur le bouton
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt = null;
    }
});

// Mouvement
window.addEventListener('devicemotion', (event) => {
    if (isUnlocked || !document.getElementById('install-overlay').classList.contains('overlay-hidden')) return;
    const total = Math.sqrt(event.accelerationIncludingGravity.x**2 + event.accelerationIncludingGravity.y**2 + event.accelerationIncludingGravity.z**2);
    if (total > 13) {
        currentSteps++;
        updateUI();
    }
});

function updateGoal() {
    const val = parseInt(document.getElementById('step-input').value);
    if (val > 0) { stepGoal = val; localStorage.setItem('stepGoal', stepGoal); currentSteps = 0; updateUI(); }
}

updateUI();