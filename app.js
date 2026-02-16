let stepGoal = parseInt(localStorage.getItem('stepGoal')) || 1000;
let currentSteps = 0;

// Initialiser l'affichage
document.getElementById('goal-display').innerText = stepGoal;

function updateGoal() {
    const input = document.getElementById('step-input');
    const newGoal = parseInt(input.value);
    if (newGoal > 0) {
        stepGoal = newGoal;
        localStorage.setItem('stepGoal', newGoal);
        document.getElementById('goal-display').innerText = stepGoal;
        currentSteps = 0; // On réinitialise pour le nouveau défi
        updateUI();
        input.value = '';
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
    } else if (percent > 50) {
        fill.style.background = "var(--orange)";
        statusMsg.innerText = "🔒 Encore un effort...";
        statusMsg.classList.remove('unlocked');
    } else {
        fill.style.background = "var(--danger)";
    }
}

// Détection de mouvement simplifiée (Accéléromètre)
if ('DeviceMotionEvent' in window) {
    window.addEventListener('devicemotion', (event) => {
        const acc = event.accelerationIncludingGravity;
        const totalAcc = Math.sqrt(acc.x**2 + acc.y**2 + acc.z**2);
        
        // Seuil de détection d'un pas (à ajuster selon les tests)
        if (totalAcc > 5) { 
            currentSteps++;
            updateUI();
        }
    });
} else {
    alert("Le capteur de mouvement n'est pas supporté sur ce navigateur.");

}
