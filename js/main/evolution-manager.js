import "./push.js"
import {pushInterpreter, pushRunProgram} from "./push.js";
import {randomCode} from "./random-code.js";

export class EvolutionManager {
    population = [];
    conf = {
        popSize: null,
        maxPoints: 25
    }
    environmentManager;
    scores = [];
    constructor(environmentManager, popSize) {
        if (!environmentManager) throw new Error("missing window");
        if (!(popSize > 0)) throw new Error("invalid population size");

        this.environmentManager = environmentManager;
        this.conf.popSize = popSize;
    }

    initPop() {
        this.environmentManager.createCanvases();
        this.population = [];
        let n = this.conf.popSize;
        for (let i = 0; i < n; i++){
            let pi = new pushInterpreter(this.environmentManager.getCanvasElem(i));
            let prog = randomCode(this.conf.maxPoints, pi, Math.random);
            this.population.push(prog);
        }
    }

    scorePopulation(scoreCb) {
        let n = this.conf.popSize;
        this.scores = [];
        for (let i = 0 ; i < n ; i++) {
            let pi = new pushInterpreter(this.environmentManager.getCanvasElem(i));
            let prog = this.population[i];
            pushRunProgram(pi, prog);
            this.scores.push({
                i: i,
                score: scoreCb(pi, prog)
            });
        }
    }

    getTopScoring(n) {
        if (n > this.scores.length) throw new Error("n too big");
        this.scores.sort((a, b)=>{
            return b.score - a.score;
        });
        let ret = [];
        for (let i = 0 ; i < n ; i++) {
            ret.push(this.scores[i]);
        }
        return ret;
    }
}