addTests({
   testIt(){
       let em = new EvolutionManager();
       em.conf.popSize = 100;
       em.initPop();
       em.scorePopulation();
       let best = em.getTopScoring(16);
   }
});