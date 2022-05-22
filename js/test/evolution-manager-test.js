import {addTests, assertEquals, assertTrue, makeRandomSeq} from "./asserts.js";
import {EnvironmentManager} from "../main/environment-manager.js";
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
       em.scorePopulation((interpreter, program, index)=>{
           assertTrue(typeof index !== 'undefined');
           return interpreter.stats.drawDistance;
       });
       let best = em.getTopScoring(2);
       assertEquals(2.2, best[0].score);
       assertEquals(1.1, best[1].score);
   },

    testFindCoordinates() {
        let window = new MockWindow();
        let environmentManager = new EnvironmentManager(window,2);
        let em = new EvolutionManager(environmentManager, 2);

        let p0 = em.population[0] = pushParseString('( 0.0 0.25 0.5 0.75 )')

        assertEquals([0], em.findCoordinatesAtFraction(0, 0));
        assertEquals([0], em.findCoordinatesAtFraction(0, 0.01));
        assertEquals([1], em.findCoordinatesAtFraction(0, 0.26));
        assertEquals([3], em.findCoordinatesAtFraction(0, 0.99));

    },

    testCrossIndividuals() {
        let mockWindow = new MockWindow();
        let environmentManager = new EnvironmentManager(mockWindow, 1);
        let em = new EvolutionManager(environmentManager, 2);

        em.random = makeRandomSeq([1, 1, 1, 1, 1, 1]);

        let i1, i2;
        i1 = pushParseString('( 1 1 1 )');
        i2 = pushParseString('( 2 2 2 )');

        assertEquals('( 1 1 1 )', em.crossIndividuals(i1, i2).toString());

        em.random = makeRandomSeq([1, 1, 0, 1, 1, 1]);

        assertEquals('( 1 2 2 )', em.crossIndividuals(i1, i2).toString());

        em.random = makeRandomSeq([0, 1, 1, 0, 1, 1]);
        i1 = pushParseString('( 1 1 1 )');
        i2 = pushParseString('( 2 ( 2 2 ) )');
        assertEquals('( 2 ( 1 ) )', em.crossIndividuals(i1, i2).toString());
    }
});