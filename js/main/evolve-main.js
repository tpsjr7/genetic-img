import {EnvironmentManager} from './environment-manager.js';
import {EvolutionManager} from './evolution-manager.js';

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


function main() {
    let em = new EnvironmentManager(window, 100);
    let ev = new EvolutionManager(em, 100);

    window.em = em;
    window.ev = ev;

    window.addEventListener('resize', ()=>{
        em.positionCanvases()
    });

    ev.scorePopulation((interpreter, program, index)=>{
        // return interpreter.executionCounts['FLOAT.CV_FORWARD'];
        let dist = interpreter.stats.drawDistance;
        return dist;
    });

    let goodOnes = ev.getTopScoring(10).filter(it => it.score > 0);
    if ( goodOnes.length > 0) {
        console.log('found');
        console.log
        (goodOnes.map(
            it => {
                return {
                    prog: ev.population[it.i].toString(),
                    score: it.score
                }
            }
        ));
    }

}

main();
