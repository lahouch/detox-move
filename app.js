let stepGoal = parseInt(localStorage.getItem('stepGoal')) || 1000;
let currentSteps = 0;
let deferredPrompt;

// Initialisation
document.getElementById('goal-display').innerText = stepGoal;

// --- LOGIQUE INSTALLATION ---
const installBtn = document.getElementById('install-btn');

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installBtn.style.display = 'block'; // Affiche le bouton si l'app peut être installée
});

installBtn.addEventListener('click', async () => {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            installBtn.style.display = 'none';
        }
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
        const acc = event.accelerationIncludingGravity;
        if(!acc) return;
        
        const totalAcc = Math.sqrt(acc.x**2 + acc.y**2 + acc.z**2);
        
        if (totalAcc > 12) { // Seuil de sensibilité (12-15 est idéal)
            currentSteps++;
            updateUI();
        }
    });
}

// TEST SUR PC : Appuyez sur Espace pour simuler des pas
window.addEventListener('keydown', (e) => {
    if(e.code === 'Space') { currentSteps += 50; updateUI(); }
});