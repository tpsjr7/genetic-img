

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
    throw `Fail: types dont match. Expected: ${expected} vs Actual: ${actual}`;
  }
  if (Array.isArray(expected) && Array.isArray(actual)) {
    if (expected.length != actual.length || expected.toString() !== actual.toString()) {
      throw `Failed. Excepted: ${expected}, Actual: ${actual}`;
    }
    return;
  }
  if (expected !== actual) {
    let mess = message ?  message + ', ' : '';
    mess += 'Failed: Expected: ' + expected + ', Actual: ' + actual;
    throw mess;
  }
}
function assertThrows(code) {
  try {
    code();

  } catch (e) {
    return;
  }
  throw "Fail, didn't throw as expected";
}

function fail(mess) {
  throw "Fail " + mess;
}
let tests = {
  testAssertEquals() {
    assertEquals([0], [0]);
    assertEquals([0, [3]], [0, [3]]);
    assertThrows(() => {
      assertEquals([0, [4]], [0, [3]]);
    });
    assertThrows(() => {
      assertEquals({}, []);
    });
    assertThrows(() => {
      assertEquals('true', true);
    });
  },
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

    assertEquals('( 3 3 2 1 1 )', decompose(10, 10, makeRandomSeq([2, 2, 1, 0])).toString());
  },
  testRandomCodeWithSize() {
    let interpreter = new pushInterpreter();
    interpreter.conf.randomInstructions = [
      'CODE.NOOP',
      'INTEGER.+',
      'INTEGER.-',
      'INTEGER.MAX'
    ];

    // choose random float
    interpreter.nextRandInt = makeRandomSeq([2, 1]);
    let randFloatFunc = makeRandomSeq([0.04, 0.75, 0.0, 0.85]);
    assertEquals(5.0, randomCodeWithSize(1, interpreter, randFloatFunc));

    // choose random int
    interpreter.clearStacks();
    assertEquals(7, randomCodeWithSize(1, interpreter, randFloatFunc));

    // choose random bool
    interpreter.clearStacks();
    interpreter.nextRandInt = makeRandomSeq([0, 0]);
    assertEquals('TRUE', randomCodeWithSize(1, interpreter, makeRandomSeq([0.04, 0.9])));
    interpreter.clearStacks();
    assertEquals('FALSE', randomCodeWithSize(1, interpreter, makeRandomSeq([0.04, 0.2])));

    // choose random element
    interpreter.clearStacks();
    interpreter.nextRandInt = makeRandomSeq([2]);
    assertEquals('INTEGER.-', randomCodeWithSize(1, interpreter, makeRandomSeq([0.1])));

    // more than one point
    interpreter.clearStacks();
    randFloatFunc = makeRandomSeq([0.1, 0.1, 0.5]);
    interpreter.nextRandInt = makeRandomSeq([0, 0, 0]);
    assertEquals(['CODE.NOOP', 'CODE.NOOP'], randomCodeWithSize(3, interpreter, randFloatFunc));

    interpreter.clearStacks();

    // choseFloats = [];
    // randFloatFunc = () => {
    //   let ret = parseFloat(Math.random().toFixed(2));
    //   choseFloats.push(ret);
    //   return ret;
    // }
    // choseInts = [];
    // interpreter.nextRandInt = (max)=>{
    //   let ret = Math.floor(Math.random() * max)
    //   choseInts.push(ret);
    //   return ret;
    // };
    randFloatFunc = makeRandomSeq([0.03, 0.01, 0.96, 0.07, 0.88, 0.84, 0.44, 0.93]);
    interpreter.nextRandInt = makeRandomSeq([0, 1, 1, 1, 1, 3, 1]);

    let actual = randomCodeWithSize(7, interpreter, randFloatFunc).toString();
    let expected =  '( -10 ( INTEGER.MAX ) ( INTEGER.+ ) INTEGER.+ )';
    assertEquals(expected, actual);

    assertThrows(()=>{
      randomCodeWithSize(0, interpreter, randFloatFunc);
    });
  }
};


function runTests() {
  for (let test in tests) {
    console.log('Running ' + test);
    tests[test]();
  }
  console.log('Pass');
}
