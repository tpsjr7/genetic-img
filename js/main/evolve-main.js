import {EnvironmentManager} from './environment-manager.js';
import {EvolutionManager} from './evolution-manager.js';

let evolutionManager;

function runGeneration() {
    evolutionManager.scorePopulation((interpreter, program, index)=>{
        // return interpreter.executionCounts['FLOAT.CV_FORWARD'];
        let dist = interpreter.stats.drawDistance;
        return dist;
    });

    evolutionManager.createNextGeneration();
}

function main() {
    let em = new EnvironmentManager(window, 100);
    evolutionManager = new EvolutionManager(em, 100);

    window.addEventListener('resize', ()=>{
        em.positionCanvases()
    });

    // runGeneration();

}

main();
window.runGeneration = runGeneration;
window.evolutionManager = evolutionManager;
