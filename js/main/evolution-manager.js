import {pushInterpreter, pushParseString, pushRunProgram} from "./push.js";
import {RandomCodeGenerator} from "./random-code.js";
import {MockCanvasElement} from "../test/mocks.js";
import {CanvasWrapper} from "./canvas-wrapper.js";

export class EvolutionManager {
    population = [];
    elitesPopulation = [];
    conf = {
        popSize: null,
        maxPoints: 25
    }
    environmentManager;
    scores = [];
    maxScoreObj;

    elitesFraction = .1;
    mutationChance = .05;
    maxMutateAddPoints = 5;
    crossProbability = 0.15;

    constructor(environmentManager, popSize) {
        if (!environmentManager) throw new Error("missing window");
        if (!(popSize > 0)) throw new Error("invalid population size");

        this.environmentManager = environmentManager;
        this.conf.popSize = popSize;
        this.#_initPop();
    }

    _findMaxScore() {
        let maxScoreObj = this.scores[0];
        for (let scoreObj of this.scores) {
            if (scoreObj.score > maxScoreObj.score) {
                maxScoreObj = scoreObj;
            }
        }
        this.maxScoreObj = maxScoreObj;
        return maxScoreObj;
    }

    #_initPop() {
        this.environmentManager.createCanvases();
        this.population = [];
        let n = this.conf.popSize;
        let rcg = new RandomCodeGenerator(new pushInterpreter(this.environmentManager.getCanvasWrapper(0)));
        for (let i = 0; i < n; i++){
            let prog = rcg.randomCode(this.conf.maxPoints);
            this.population.push(prog);
        }
    }

    scorePopulation(scoreCb) {
        let now = new Date().getTime();
        this.environmentManager.resetCanvases();
        let n = this.conf.popSize;
        this.scores = [];
        for (let i = 0 ; i < n ; i++) {
            let pi = new pushInterpreter(this.environmentManager.getCanvasWrapper(i));
            let prog = this.population[i];
            pushRunProgram(pi, prog);
            this.scores.push({
                i: i,
                score: scoreCb(pi, prog, i)
            });
        }

        this._findMaxScore();
        let maxScore = this.maxScoreObj.score || 1.0;

        this.scores.forEach((v, i) => {
            v.normalizedScore = v.score / maxScore;
        });
        console.log(new Date().getTime() - now);
    }

    sortScoresDesc() {
        this.scores.sort((a, b)=>{
            return b.score - a.score;
        });
    }

    getTopScoring(n) {
        if (n > this.scores.length) throw new Error("n too big");
        this.sortScoresDesc();

        let ret = [];
        for (let i = 0 ; i < n ; i++) {
            ret.push(this.scores[i]);
        }
        return ret;
    }

    random(){
        return Math.random();
    }

    createNextGeneration() {
        this.sortScoresDesc();

        let newPop = [];

        const nElites = Math.floor(this.conf.popSize * this.elitesFraction);

        // keep elites
        this.elitesPopulation = [];
        for (let i = 0 ; i < nElites ; i++) {
            let ind = this.population[this.scores[i].i];
            newPop.push(ind);
            this.elitesPopulation.push(ind);
        }

        // create children
        let i1, i2;
        let nPop = this.conf.popSize;

        let pi = new pushInterpreter(new CanvasWrapper(new MockCanvasElement()));
        let rcg = new RandomCodeGenerator(pi);

        while (newPop.length < this.conf.popSize) {
            do {
                i1 = Math.floor(this.random() * nPop);
            } while (this.random()  > this.scores[i1].normalizedScore);

            do {
                i2 = Math.floor(this.random() * nPop);
            } while (i1 === i2 || this.random()  > this.scores[i2].normalizedScore);

            let child = this.crossIndividuals(
                this.population[this.scores[i1].i],
                this.population[this.scores[i2].i]
            );

            this.mutate(child, rcg);
            newPop.push(child);
        }
        this.population = newPop;
    }

    mutate(program, rcg) {
        for (let i = 0 ; i < program.length ; i++) {
            if (this.random() < this.mutationChance) {
                if (this.random() < 0.5) {
                    // change
                    // use splice because it keeps the program count constant;
                    let code =  rcg.randomCode(this.maxMutateAddPoints)
                    program.splice(i, 1, code);
                } else {
                    // delete
                    program.splice(i, 1);
                    i--;
                }
                continue;
            } else if (Array.isArray(program[i])) {
                this.mutate(program[i], rcg);
            }
        }
    }

    crossIndividuals(first, second) {
        let p1 = first.toString().split(' ');
        let p2 = second.toString().split(' ');

        let child = [];
        let chosen = p1;

        let i = 0;

        let parenLevel = 0;

        while (true) {
            let rand = this.random();
            if (rand < this.crossProbability) {
                // switch source
                if (chosen === p1) {
                    chosen = p2;
                } else {
                    chosen = p1;
                }
            }
            if (i < chosen.length) {
                let part = chosen[i];
                if (part === '(') {
                    parenLevel++;
                } else if (part === ')') {
                    parenLevel--;
                }
                child.push(part);
                i++;
            } else {
                break;
            }
        }

        while (parenLevel > 0) {
            child.push(')');
            parenLevel--;
        }

        while (parenLevel < 0 ) {
            child.splice(0,0,'(');
            parenLevel++;
        }

        return pushParseString(child.join(' '));
    }


}