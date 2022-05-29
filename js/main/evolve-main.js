import {EnvironmentManager} from './environment-manager.js';
import {EvolutionManager} from './evolution-manager.js';

let evolutionManager;

function pixelDistance(index) {
    let ce = em.getCanvasElem(index);
    let context = ce.getContext('2d');
    let {width, height} = ce;
    let {data} = context.getImageData(0, 0, width, height);
    let sum = 0;
    for (let i = 0; i < data.length ; i++) {
        sum += data[i];
    }
    return sum;
}


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

    runGeneration();

}

window.runGeneration = runGeneration;
main();
