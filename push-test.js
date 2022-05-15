

function makeRandomSeq(seq){
  let count = 0;
  return function() {
    if (count >= seq.length){
      throw "out of range";
    }
    return seq[count++];
  };
}

function assertEquals(expected, actual, message) {
  if (typeof expected != typeof actual) {
    throw `Fail: types dont match. Expected:${typeof expected} vs Actual:${typeof actual}`;
  }
  if (expected !== actual) {
    let mess = message ?  message + ', ' : '';
    mess += 'Failed: Expected: ' + expected + ', Actual: ' + actual;
    throw mess;
  }
}
function fail(mess) {
  throw "Fail " + mess;
}
let tests = {
  testMakeRanSeq() {
    let rand = makeRandomSeq([4,3,7]);
    assertEquals(4, rand());
    assertEquals(3, rand());
    assertEquals(7, rand());

    rand = makeRandomSeq([2, 1]);
    assertEquals(2, rand());
    assertEquals(1, rand());
    try {
      assertEquals(99, rand());
      fail("should have thrown")
    } catch (e) { }

  },
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
  },
  testDecompose() {

    // then return a list containing NUMBER
    assertEquals('( 1 )', decompose(1, 3, null).toString());

    //MAX-PARTS is 1
    assertEquals('( 10 )', decompose(10, 1, null).toString());

    let count=0;
    let rand = function(max){
      let vals = [0.3, 0.34, 0.56, 0.574, 0.2, 0.9];
      let ret = Math.floor(vals[count++] * max);
      // console.log('rand: ' + ret);
      return ret;
    };
    assertEquals('( 3 3 2 1 1 )', decompose(10, 10, rand).toString());
  },
  testRandomCodeWithSize() {
    let interpreter = new pushInterpreter();
    interpreter.conf.randomInstructions = [
      'CODE.NOOP',
      'INTEGER.+',
      'INTEGER.-',
      'INTEGER.MAX'
    ];
    interpreter.nextRandInt = makeRandomSeq([2, 1]);
    let randFloatFunc = makeRandomSeq([0.04, 0.75, 0.0, 0.75]);

    assertEquals(5.0, randomCodeWithSize(1, interpreter, randFloatFunc));

    interpreter.clearStacks();
    assertEquals(5.0, randomCodeWithSize(1, interpreter, randFloatFunc));

    interpreter.clearStacks();

    interpreter.nextRandInt = makeRandomSeq([0, 0]);
    assertEquals('TRUE', randomCodeWithSize(1, interpreter, makeRandomSeq([0.04, 0.9])));
    interpreter.clearStacks();
    assertEquals('FALSE', randomCodeWithSize(1, interpreter, makeRandomSeq([0.04, 0.2])));

  }
};


function runTests() {
  for (let test in tests) {
    console.log('Running ' + test);
    tests[test]();
  }
  console.log('Pass');
}
