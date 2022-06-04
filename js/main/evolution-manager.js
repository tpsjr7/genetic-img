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
    mutationChance = .03;
    maxMutateAddPoints = 5;
    crossProbability = 0.15;
    mateBoost = 0.03;

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

        let count = 0;
        let check = () => {
            count ++;
            if (count > this.conf.popSize * 100) {
                throw new Error("too many loops during selection");
            }
        }
        while (newPop.length < this.conf.popSize) {

            do {
                check();
                i1 = Math.floor(this.random() * nPop);
            } while (this.random()  > ( this.scores[i1].normalizedScore + this.mateBoost) );

            do {
                check();
                i2 = Math.floor(this.random() * nPop);
            } while (i1 === i2 || this.random()  > ( this.scores[i2].normalizedScore + this.mateBoost) );

            let child = this.crossIndividuals(
                this.population[this.scores[i1].i],
                this.population[this.scores[i2].i]
            );

            this.mutate(child, rcg);
            newPop.push(child);
        }
        this.population = newPop
        console.log("loops: ", count);
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

    _rebalance(childTokenizedArray) {
        let p = Number.NaN;
        let i = 0;
        let count = 0;
        while (true) {
            count++;
            if (count > 1000) throw new Error("oops too many loops");

            if (i < childTokenizedArray.length) {
                let token = childTokenizedArray[i];
                if (i===0) {
                    if (token === '(') {
                        p = 1;
                    } else {
                        childTokenizedArray.splice(0,0,'(');
                        continue;
                    }
                } else if (p === 0){
                    childTokenizedArray.splice(0,0,'(');
                    p++;
                    i++;
                    continue;
                } else if (token === ')') {
                    p--;
                    if (childTokenizedArray[i-1] === '('){
                        childTokenizedArray.splice(i - 1, 2)
                        i--;
                        i--;
                    }
                } else if (token === '(') {
                    p++;
                }
            } else {
                break;
            }
            i++;
        }

        while (p > 0) {
            childTokenizedArray.push(')');
            p--;
        }
        if (childTokenizedArray.length === 0){
            childTokenizedArray.push('(', ')');
        }
        return childTokenizedArray.join(' ');
    }

    crossIndividuals(first, second) {
        let p1 = first.toString().split(' ');
        let p2 = second.toString().split(' ');

        let childTokenizedArray = [];
        let chosen = p1;

        // cross it first
        let i = 0;
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
                childTokenizedArray.push(chosen[i]);
            } else {
                break;
            }
            i++;
        }

        let childAsString = this._rebalance(childTokenizedArray);

        return pushParseString(childAsString);
    }


}