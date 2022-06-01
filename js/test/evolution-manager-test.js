import {addTests, assertEquals, assertTrue, makeRandomSeq} from "./asserts.js";
import {EnvironmentManager} from "../main/environment-manager.js";
import {EvolutionManager} from "../main/evolution-manager.js";
import {MockCanvasElement, MockWindow} from "./mocks.js";
import {pushInterpreter, pushParseString} from "../main/push.js";
import {RandomCodeGenerator} from "../main/random-code.js";
import {CanvasWrapper} from "../main/canvas-wrapper.js";

addTests({
    testGetTopScoring() {
        let window = new MockWindow();
        let environmentManager = new EnvironmentManager(window,4);
        let em = new EvolutionManager(environmentManager, 4);
        em.scores = [
            {i: 0, score: 10},
            {i: 1, score: 15},
            {i: 2, score: 20},
            {i: 3, score: 5},
        ]
        let top = em.getTopScoring(2);
        assertEquals([2, 1], [top[0].i, top[1].i]);
    },
   testEvolutionManager(){
       let window = new MockWindow();
       let environmentManager = new EnvironmentManager(window,5);
       let em = new EvolutionManager(environmentManager, 5);
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
    focus_testRebalance() {
        let mockWindow = new MockWindow();
        let environmentManager = new EnvironmentManager(mockWindow, 2);
        let em = new EvolutionManager(environmentManager, 2);
        let input = '( 0 1 ( 2 ) ) ) 3 ( 4 ( 5 6 7';
        let rebalanced = em._rebalance(input.split(' '));
        assertEquals(
            '( ( ( 0 1 ( 2 ) ) ) 3 ( 4 ( 5 6 7 ) ) )',
            rebalanced
        );
        let parsed = pushParseString(rebalanced);

    },
    focus_testCrossIndividuals() {
        let mockWindow = new MockWindow();
        let environmentManager = new EnvironmentManager(mockWindow, 2);
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


        // em.random = makeRandomSeq([], {rest: 1});
        // assertEquals('( ( 1 ) ( 1 ) )', em.crossIndividuals(
        //     '( 0 0 1 ) 1 )',
        //     '( )'
        // ));


        em.random = makeRandomSeq([0, 1, 1, 0, 1, 1, 1, 1]); // 0 is swap, 1 is keep the same
        i1 = pushParseString('( ( 1 1 ) 1 )');
        i2 = pushParseString('( 0 0 0 0 0 0 0 0 )');
        assertEquals('( ( ( 0 0 1 ) 1 ) )', em.crossIndividuals(i1, i2).toString());

        em.random = makeRandomSeq([], {rest: 1});
        assertEquals('( ( 1 ) ( 1 ) )', em.crossIndividuals(
            '( 1 ) ( 1 )',
            '( )'
        ).toString());

    },
    focus_testCreateNextGeneration() {
        let mockWindow = new MockWindow();
        let environmentManager = new EnvironmentManager(mockWindow, 10);
        let em = new EvolutionManager(environmentManager, 10);

        for (let i = 0 ; i < 10 ; i++) {
            em.population.push(pushParseString(`( ${i} ${i} ${i} ${i} ${i} ${i} )`));
        }

        em.scorePopulation(()=>{return 0.95;});

            // em.random = makeRandomSeq([
        //     0, 0, .1, 0, // pick 0th and 1st individuals
        //     1, 1, 1,// don't switch with cross
        //     0, // switch to 1st individual ( 1 1 1 ...
        //     1, // don't switch
        // ],
        //     {rest: 0.99}
        // );
        for (let i = 0 ; i < 50 ; i++) {
            em.createNextGeneration();
        }

        assertEquals(1, em.elitesPopulation.length);
        assertEquals(10, em.population.length);
    },
    testMutate() {
        let p1 = pushParseString('( 1 1 1 1 )');
        let enm = new EnvironmentManager(new MockWindow(), 1);
        let evm = new EvolutionManager(enm, 1);

        let pi = new pushInterpreter(new CanvasWrapper(new MockCanvasElement()));

        pi.randInstructions = [
            'INTEGER.+',
            'INTEGER.-',
            'INTEGER./'
        ];


        let rcg  = new RandomCodeGenerator(pi);

        evm.random = makeRandomSeq([
            1,// skip first
            0, // mutate second
            1,// delete it
        ], {rest: 1, mess: "A"} // skip the rest
        );

        evm.mutate(p1, rcg);
        assertEquals('( 1 1 1 )', p1.toString());

        evm.random = makeRandomSeq([
                1,// skip first (
                0, // mutate second '1'
                0,// change it
                0,
                0
            ], {mess: "B random"}//, 1 // skip the rest
        );

        rcg  = new RandomCodeGenerator(pi);
        rcg.nextRandIntFunc = makeRandomSeq([
            1, // decombonse this part
            1,
            0
        ], {mess: "B nextRandIntFunc"});
        rcg.randFloatFunc = makeRandomSeq([
            0.3,
            0.9,
            0.1,
            0.5
        ])

        evm.maxMutateAddPoints = 3;
        evm.mutate(p1, rcg);
        assertEquals('( 1 INTEGER.- INTEGER.- )', p1.toString());

    }


});