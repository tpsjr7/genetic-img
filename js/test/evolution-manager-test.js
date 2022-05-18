import {addTests, assertEquals, assertTrue} from "./asserts.js";
import {EnvironmentManager} from "../main/evolve-canvas.js";
import {EvolutionManager} from "../main/evolution-manager.js";
import {MockWindow} from "./mocks.js";
import {pushParseString} from "../main/push.js";

addTests({
    testGetTopScoring() {
        let window = new MockWindow();
        let environmentManager = new EnvironmentManager(window,4);
        let em = new EvolutionManager(environmentManager, 5);
        em.scores = [
            {i: 0, score: 10},
            {i: 1, score: 15},
            {i: 2, score: 20},
            {i: 3, score: 5},
        ]
        let top = em.getTopScoring(2);
        assertEquals([2, 1], [top[0].i, top[1].i]);
    },
   testIt(){
       let window = new MockWindow();
       let environmentManager = new EnvironmentManager(window,5);
       let em = new EvolutionManager(environmentManager, 5);
       em.initPop();
       assertEquals(5, em.population.length);
       assertTrue(em.population[0].length > 0);
       em.population[2] = pushParseString("( 1.1 1.1 FLOAT.CV_FORWARD FLOAT.CV_FORWARD )");
       em.population[4] = pushParseString("( 1.1 FLOAT.CV_FORWARD )");
       em.scorePopulation((interpreter, program)=>{
           return interpreter.executionCounts['FLOAT.CV_FORWARD'];
       });
       let best = em.getTopScoring(2);
       assertEquals(2, best[0].score);
       assertEquals(1, best[1].score);
   }
});