addTests({
   testIt(){
       let em = new EvolutionManager();
       em.conf.popSize = 100;
       em.initPop();
       em.scorePoputation();
       let best = em.getTopScoring(16);
   }
});