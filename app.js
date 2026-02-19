let stepGoal = parseInt(localStorage.getItem('stepGoal')) || 1000;
let currentSteps = 0;
let isUnlocked = false;
let deferredPrompt;

const installOverlay = document.getElementById('install-overlay');
const lockOverlay = document.getElementById('lock-overlay');
const giantCounter = document.getElementById('giant-counter');
const alarmSound = document.getElementById('alarm-sound');

// --- DÉTECTION SI DÉJÀ INSTALLÉ ---
if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
    // Si l'app est lancée depuis l'écran d'accueil
    installOverlay.classList.add('overlay-hidden');
    lockOverlay.classList.remove('overlay-hidden');
}

// --- LOGIQUE INSTALLATION ---
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
});

document.getElementById('install-btn-giant').addEventListener('click', async () => {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            alert("Installation réussie ! Lancez l'application depuis votre écran d'accueil.");
        }
        deferredPrompt = null;
    } else {
        alert("Cherchez l'option 'Installer' dans le menu de votre navigateur.");
    }
});

// Détecter si iOS pour afficher l'aide spécifique
if (/iPhone|iPad|iPod/.test(navigator.userAgent) && !window.navigator.standalone) {
    document.getElementById('ios-hint').style.display = 'block';
}

// --- LOGIQUE COMPTEUR ET UI ---
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
    
    if (alarmSound) alarmSound.play().catch(()=>{});
    if ("vibrate" in navigator) navigator.vibrate([500, 100, 500]);

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

// Détection mouvement (uniquement si installée et non débloquée)
window.addEventListener('devicemotion', (event) => {
    if (isUnlocked || !installOverlay.classList.contains('overlay-hidden')) return;
    
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