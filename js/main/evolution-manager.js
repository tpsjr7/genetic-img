import {pushInterpreter, pushParseString, pushRunProgram} from "./push.js";
import {randomCode} from "./random-code.js";

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

    purgePercent = 0.20;
    elitePercent = 0.05;

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
        for (let i = 0; i < n; i++){
            let pi = new pushInterpreter(this.environmentManager.getCanvasElem(i));
            let prog = randomCode(this.conf.maxPoints, pi, Math.random);
            this.population.push(prog);
        }
    }

    scorePopulation(scoreCb) {
        let now = new Date().getTime();
        let n = this.conf.popSize;
        this.scores = [];
        for (let i = 0 ; i < n ; i++) {
            let pi = new pushInterpreter(this.environmentManager.getCanvasElem(i));
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

    findCoordinatesAtFraction(individualIndex, fraction) {
        let individual = this.population[individualIndex];

        let interval = 1.0 / (individual.count - 1);
        let i = Math.floor(fraction / interval);

        return [i];
    }

    random(){
        return Math.random();
    }

    createNextGeneration() {
        this.sortScoresDesc();

        let newPop = [];
        const elitesFraction = .1;
        const nElites = Math.floor(this.conf.popSize * elitesFraction);

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

        debugger;
        while (newPop.length < this.conf.popSize) {
            do {
                i1 = Math.floor(this.random() * nPop);
            } while (this.random()  > this.scores[i1].normalizedScore);

            do {
                i2 = Math.floor(this.random() * nPop);
            } while (this.random()  > this.scores[i2].normalizedScore);

            let child = this.crossIndividuals(
                this.population[this.scores[i1].i], this.population[this.scores[i2].i]
            );
            newPop.push(child);
        }
        this.population = newPop;
    }

    _mutate(program, path) {

    }
    mutate() {


    }

    crossIndividuals(first, second) {
        let p1 = first.toString().split(' ');
        let p2 = second.toString().split(' ');
        const crossProbability = 0.15;

        let child = [];
        let chosen = p1;

        let i = 0;
        let part;
        let parenLevel = 0;

        while (true) {
            let rand = this.random();
            if (rand < crossProbability) {
                // switch source
                if (chosen === p1) {
                    chosen = p2;
                } else {
                    chosen = p1;
                }
            }
            if (i < chosen.length) {
                part = chosen[i];
                if (part === '(') {
                    parenLevel++;
                } else if (part === ')') {
                    if (parenLevel > 0) {
                        parenLevel--;
                    }
                }
            } else {
                break;
            }
            child.push(part);
            i++;
        }

        while (parenLevel > 0) {
            child.push(')');
            parenLevel--;
        }

        return pushParseString(child.join(' '));
    }


}