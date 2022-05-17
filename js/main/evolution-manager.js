class EvolutionManager {
    population = [];
    fitnessFunction;
    conf = {
        popSize: null,
        maxPoints: 25
    }
    canvasManager;
    constructor(window, popSize) {
        if (!window) throw new Error("missing window");
        if (!(popSize > 0)) throw new Error("invalid population size");

        this.canvasManager = new CanvasManager(window, popSize);
        this.conf.popSize = popSize;
    }

    setFitnessFunction(func) {
        this.fitnessFunction = func;
    }

    initPop() {
        this.population = [];
        let n = this.conf.popSize;
        for (let i = 0; i < n; i++){
            let pi = new pushInterpreter();
            let prog = randomCode(this.conf.maxPoints, pi, Math.random);
            this.population.push(prog);
        }
    }

    scorePopulation() {
        let n = this.conf.popSize;
        for (let i = 0 ; i < n ; i++) {
            let pi = new pushInterpreter(cm.getCanvas(i));
            let prog = this.population[i].copy();
            pushRunProgram(pi, prog);
        }
    }
}