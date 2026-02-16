// Initialisation des réglages
let stepGoal = localStorage.getItem('stepGoal') || 1000;
let currentSteps = 0;

// Fonction pour configurer le nombre de pas
function setConfiguration(newGoal) {
    stepGoal = newGoal;
    localStorage.setItem('stepGoal', newGoal);
    console.log(`Nouvel objectif : ${stepGoal} pas.`);
}

// Simulation du capteur de mouvement (API Accéléromètre)
if ('LinearAccelerationSensor' in window) {
    let sensor = new LinearAccelerationSensor({frequency: 60});
    sensor.addEventListener('reading', () => {
        // Logique simplifiée de détection de pas
        if (sensor.z > 12) { // Détection d'un impact
            currentSteps++;
            checkUnlockStatus();
        }
    });
    sensor.start();
}

function checkUnlockStatus() {
    if (currentSteps >= stepGoal) {
        alert("Objectif atteint ! Temps d'écran débloqué.");
        // Ici, on réinitialise le compteur ou on envoie une notification
    }
}
function updateGoal() {
    const newGoal = document.getElementById('step-input').value;
    if(newGoal > 0) {
        localStorage.setItem('stepGoal', newGoal);
        document.getElementById('goal-display').innerText = newGoal;
        alert("Objectif mis à jour !");
    }
}

// Charger l'objectif au démarrage
document.getElementById('goal-display').innerText = localStorage.getItem('stepGoal') || 1000;