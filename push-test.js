

function assertEquals(expected, actual, message) {
  if (expected != actual) {
    let mess = message ?  message + ', ' : '';
    mess += 'Failed: Expected: ' + expected + ', Actual: ' + actual;
    throw mess;
  }
}
let tests = {
  testAdd() {
    let inProgram = '(5 7 INTEGER.+)'
    let program = pushParseString( inProgram );
    let interpreter = new pushInterpreter();
    let info = pushRunProgram( interpreter, program );
    assertEquals(interpreter.intStack[0], 12);
  },

  testCodeRand() {
    let interpreter = new pushInterpreter();
    interpreter.randInstructions = ['INTEGER.+', 'CODE.NOOP'];
    interpreter.conf['MAX-POINTS-IN-RANDOM-EXPRESSIONS'] = 4;

    let count = 0;
    let seq = [4,0,1,1,0];
    interpreter.nextRandInt = function() {
      if (count >= seq.length){
        throw "out of range";
      }
      return seq[count++];
    };

    let program = pushParseString('( 4 CODE.RAND )' );
    pushRunProgram( interpreter, program );

    let item = interpreter.codeStack.pop();
    assertEquals('( INTEGER.+ CODE.NOOP CODE.NOOP INTEGER.+ )', item.toString());

  }
};


function runTests() {
  for (let test in tests) {
    console.log('Running ' + test);
    tests[test]();
  }
  console.log('Pass');
}
