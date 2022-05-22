import {pushInterpreter, pushParseString, pushRunProgram} from "./push.js";
import {randomCode} from "./random-code.js";

export class EvolutionManager {
    population = [];
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
        this.scores.forEach((v, i) => {
            v.normalizedScore = v.score / this.maxScoreObj.score;
        });
        console.log(new Date().getTime() - now);
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

    findCoordinatesAtFraction(individualIndex, fraction) {
        let individual = this.population[individualIndex];

        let interval = 1.0 / (individual.count - 1);
        let i = Math.floor(fraction / interval);

        return [i];
    }

    random(){
        return Math.random();
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
                if (chosen == p1) {
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