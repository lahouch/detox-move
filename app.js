let stepGoal = parseInt(localStorage.getItem('stepGoal')) || 1000;
let currentSteps = 0;
let isUnlocked = false;
let audioCtx = null;
let deferredPrompt;

// --- INITIALISATION DU SON (GÉNÉRATION NATIVE) ---
function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function playNativeAlarm(duration) {
    if (!audioCtx) return;
    
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sawtooth'; // Son agressif type sirène
    osc.frequency.setValueAtTime(440, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.5);
    osc.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 1);
    
    osc.loop = true;

    gain.gain.setValueAtTime(0.2, audioCtx.currentTime); // Volume
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + duration);

    if ("vibrate" in navigator) navigator.vibrate([500, 100, 500, 100, 500]);
}

// --- LOGIQUE UI ---
function updateUI() {
    document.getElementById('step-counter').innerText = currentSteps;
    document.getElementById('giant-counter').innerText = currentSteps;
    document.getElementById('goal-display').innerText = stepGoal;
    
    const percent = Math.min((currentSteps / stepGoal) * 100, 100);
    document.getElementById('progress-fill').style.width = percent + "%";

    if (percent >= 100 && !isUnlocked) unlockApp();
}

function unlockApp() {
    isUnlocked = true;
    document.getElementById('lock-overlay').classList.add('overlay-hidden');
    document.getElementById('timer-display').classList.remove('timer-hidden');
    
    playNativeAlarm(4); // Sirène de 4 secondes

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
            playNativeAlarm(1);
            updateUI();
        }
    }, 1000);
}

// --- EVENTS ---
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
});

document.getElementById('install-btn-giant').addEventListener('click', async () => {
    initAudio(); // Débloque le son
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt = null;
    }
});

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

// Détection de display-mode
if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
    document.getElementById('install-overlay').classList.add('overlay-hidden');
    document.getElementById('lock-overlay').classList.remove('overlay-hidden');
}

updateUI();