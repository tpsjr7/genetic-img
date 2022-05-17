
addTests({
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
  testDecompose() {

    // then return a list containing NUMBER
    assertEquals('( 1 )', decompose(1, 3, null).toString());

    //MAX-PARTS is 1
    assertEquals('( 10 )', decompose(10, 1, null).toString());

    assertEquals('( 3 3 2 1 1 )', decompose(10, 10, makeRandomSeq([2, 2, 1, 0])).toString());
  },
  testRandomCodeWithSize() {
    let interpreter = new pushInterpreter();
    interpreter.randInstructions = [
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
    randFloatFunc = makeRandomSeq([0.75,0.03,0.94,0.7,0.14,0.7,0.45,0.43,0.94,0.14,0.88]);
    interpreter.nextRandInt = makeRandomSeq([2,1,0,0,1,1,3,1,1]);

    let actual = randomCode(10, interpreter, randFloatFunc).toString();

    // console.log(choseFloats.join(','));
    // console.log(choseInts.join(','));

    let expected =  '( INTEGER.+ ( INTEGER.MAX ) ( INTEGER.+ 9 ) INTEGER.+ )';
    assertEquals(expected, actual);

    assertThrows(()=>{
      randomCodeWithSize(0, interpreter, randFloatFunc);
    });
  },
  testGetPushInstructions() {
    let pi = {
      'aThing': 1,
      'FLOAT.+': 1,
      'INTEGER.+': 1
    };
    let keys = getPushInstructionSet(pi);
    assertEquals(['FLOAT.+', 'INTEGER.+'], keys);

    pi = new pushInterpreter();
    keys = getPushInstructionSet(pi);
    assertTrue(keys.length > 100);

    assertEquals(pi.randInstructions, keys);
  },
  testPushInstructionRandomCode() {
    let pi = new pushInterpreter();
    let program = pushParseString('( 10 CODE.RAND )' );
    pushRunProgram(pi, program);

    let item = pi.codeStack.pop();
    // console.log(item.toString());
    assertEquals(1, pi.codeStack.length);
    assertTrue(pi.codeStack[0].length >= 1);
  },
  testBug1() {
    //int: ( 1 )
    // bool: ( false false )
    //exec: ( CODE.POP CODE.POP BOOLEAN.FLUSH CODE.STACKDEPTH INTEGER.FROMBOOLEAN )
    let pi = new pushInterpreter();
    pi.boolStack.push(false);
    pi.boolStack.push(false);
    pi.intStack.push(1);

    let program = pushParseString('( CODE.POP CODE.POP BOOLEAN.FLUSH CODE.STACKDEPTH INTEGER.FROMBOOLEAN )' );
    pushRunProgram(pi, program);
  },
  testBug2() {
    let pi = new pushInterpreter();
    let program = pushParseString('(0.9 FLOAT.FROMINTEGER)' );
    pushRunProgram(pi, program);
    assertEquals(1, pi.floatStack.length);
  },
  testExecutionCounts() {
    let mockCanvas = {
      moveTo(){},
      forward(){},
      turn(){},
      getContext(){return {
        moveTo(){},
        lineTo(){},
        stroke(){}
      };}
    };
    let pi = new pushInterpreter(mockCanvas);
    pi.floatStack.push(...[1, 1, 1, 1, 3, 5]);
    let program = pushParseString('(FLOAT.CV_MOVE_TO FLOAT.CV_FORWARD FLOAT.CV_TURN FLOAT.CV_MOVE_TO)' );
    pushRunProgram(pi, program);
    assertEquals(2, pi.executionCounts['FLOAT.CV_MOVE_TO']);
    assertEquals(1, pi.executionCounts['FLOAT.CV_FORWARD']);
    assertEquals(1, pi.executionCounts['FLOAT.CV_TURN']);
  }
});

//this[ 'FLOAT.FROMINTEGER' ] = new pushInstruction( this.floatStack, pushInstructionFromInteger );
