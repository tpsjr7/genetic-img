import {
  addTests,
  assertEquals,
  assertTrue,
  assertThrows,
  makeRandomSeq
} from "./asserts.js";

import {getPushInstructionSet, pushInterpreter, pushParseString, pushRunProgram} from "../main/push.js";
import {MockCanvasElement} from "./mocks.js";
import {decompose, randomCode, randomCodeWithSize} from "../main/random-code.js";
import {PushArray} from "../main/push-array.js";

addTests({
  testAssertEquals() {
    assertEquals([0], [0]);
    assertEquals([0, [3]], [0, [3]]);
    assertEquals(1, 1);
    assertEquals({}, {});
    assertEquals({a:1}, {a:1});
    assertEquals({a:1, b:2}, {b:2, a:1});
    assertThrows(() => { assertEquals(1, 2);});
    assertThrows(() => { assertEquals([], [1]);});
    assertThrows(() => { assertEquals([], {});});
    assertThrows(() => { assertEquals({a:1}, {b:1});});
    assertThrows(() => { assertEquals({a:1}, {a:2});});
    assertThrows(() => { assertEquals({a:1}, {a:1, b:2});});
    assertThrows(() => { assertEquals({a:1, b:2}, {a:1});});
    assertThrows(() => { assertEquals("1", 1);});

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
  testSplice() {
    let a, b;
    a = pushParseString('( 1 2 3 )');
    b = a.splice(0, 1);
    assertEquals('( 1 )', b.toString());
    assertEquals(2, b.count);

    assertEquals('( 2 3 )', a.toString());
    assertEquals(3, a.count);

    a = pushParseString('( ( 1 2 ) 3 )');
    assertEquals(5, a.count);

    b = a.splice(0, 1);
    assertEquals('( ( 1 2 ) )', b.toString());
    assertEquals(4, b.count);
    assertTrue(b.parent == null);

    assertEquals('( 3 )', a.toString());
    assertEquals(2, a.count);

    a = pushParseString('( ( 1 2 ) 3 )');
    b = a.splice(0, 2);

    assertEquals('( ( 1 2 ) 3 )', b.toString());
    assertEquals(5, b.count);

    assertEquals('( )', a.toString());
    assertEquals(1, a.count);


    a = pushParseString('( ( 1 ( 2 4 ) ) 3 )');
    assertEquals(7, a.count);

    b = a[0][1];
    assertEquals('( 2 4 )', b.toString());
    assertEquals(3, b.count);

    let c = b.splice(1, 1);
    assertEquals('( 4 )', c.toString());
    assertEquals(2, c.count);

    assertEquals('( ( 1 ( 2 ) ) 3 )', a.toString());
    assertEquals(6, a.count);
  },
  testStackLengthCount() {
    let stack = new PushArray();
    assertEquals(1, stack.count);

    assertEquals(undefined, stack.pop());
    assertEquals(1, stack.count);

    stack.push(1); // [1]
    assertEquals(2, stack.count);

    let s2 = new PushArray();
    s2.push(1);
    s2.push(2);
    stack.push(s2); // [1, [1, 2]]
    assertEquals(5, stack.count);

    stack.push(new PushArray()); // [1, [1, 2], []]
    assertEquals(6, stack.count);

    stack.pop(); //[1, [1, 2] ]
    assertEquals(5, stack.count);

    stack.pop(); //[1]
    assertEquals(2, stack.count);

    stack.pop(); //[]
    assertEquals(1, stack.count);

    stack.pop(); //[]
    assertEquals(1, stack.count);

    let s3 = new PushArray();
    s3.push(1);
    s3.push(1);
    stack.push(s3); //[[1,1]]
    assertEquals(4, stack.count);

    stack.pop(); // []
    assertEquals(1, stack.count);

    stack.pop(); // []
    assertEquals(1, stack.count);

  },
  testParentStackCount() {
    let a1 = new PushArray();
    a1.push(1);
    a1.push(2); // [1, 2]
    assertEquals(3, a1.count);

    let a2 = new PushArray();
    a2.push(3);
    a2.push(4); // [3, 4]

    a1.push(a2); // [1, 2, [3, 4]]
    assertEquals(6, a1.count);
    assertTrue(a1 === a2.parent );

    a2.push(5); // [1, 2, [3, 4, 5]]

    assertEquals(4, a2.count);
    assertEquals(7, a1.count);

    a2.pop(); // [1, 2, [3, 4]]
    assertEquals(3, a2.count);
    assertEquals(6, a1.count);

    a1.pop(); // [1, 2]
    assertEquals(3, a2.count);
    assertEquals(3, a1.count);
    assertTrue(a2.parent !== a1);
    assertTrue(a2.parent == null);

  },
  testStackLengthCountWithParse() {
    let p1 = pushParseString('( 1 1 )');
    assertEquals(3, p1.count);

    let p2 = pushParseString('( 2 2 ( 2 ) )');
    assertEquals(5, p2.count);

    p1.push(p2);
    assertEquals('( 1 1 ( 2 2 ( 2 ) ) )', p1.toString());

    assertEquals(8, p1.count);
    p1.pop();

    assertEquals('( 1 1 )', p1.toString());
    assertEquals(3, p1.count);
  },
  testSpliceWithReplace() {
    let a = pushParseString('( ( 1 ( 2 4 7 8 ) ) 3 )');

    let b = pushParseString('( 5 5 5 )');

    let c = pushParseString('( 6 6 6 )');

    let d =  a[0][1];
    assertEquals('( 2 4 7 8 )', d.toString());

    let e = a[0][1].splice(1, 2, b, c);
    assertEquals('( 2 ( 5 5 5 ) ( 6 6 6 ) 8 )', d.toString());
    assertEquals(11, d.count);

    assertEquals('( ( 1 ( 2 ( 5 5 5 ) ( 6 6 6 ) 8 ) ) 3 )', a.toString());
    assertEquals(15, a.count);

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
    let interpreter = new pushInterpreter(new MockCanvasElement());
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
    let interpreter = new pushInterpreter(new MockCanvasElement());
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

    pi = new pushInterpreter(new MockCanvasElement());
    keys = getPushInstructionSet(pi);
    assertTrue(keys.length > 100);

    assertEquals(pi.randInstructions, keys);
  },
  testPushInstructionRandomCode() {
    let pi = new pushInterpreter(new MockCanvasElement());
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
    let pi = new pushInterpreter(new MockCanvasElement());
    pi.boolStack.push(false);
    pi.boolStack.push(false);
    pi.intStack.push(1);

    let program = pushParseString('( CODE.POP CODE.POP BOOLEAN.FLUSH CODE.STACKDEPTH INTEGER.FROMBOOLEAN )' );
    pushRunProgram(pi, program);
  },
  testBug2() {
    let pi = new pushInterpreter(new MockCanvasElement());
    let program = pushParseString('(0.9 FLOAT.FROMINTEGER)' );
    pushRunProgram(pi, program);
    assertEquals(1, pi.floatStack.length);
  },
  testExecutionCounts() {
    let pi = new pushInterpreter(new MockCanvasElement());
    for (let v of [1, 1, 1, 1, 3, 5]) {
      pi.floatStack.push(v);
    }
    let program = pushParseString('(FLOAT.CV_MOVE_TO FLOAT.CV_FORWARD FLOAT.CV_TURN FLOAT.CV_MOVE_TO)' );
    pushRunProgram(pi, program);
    assertEquals(2, pi.executionCounts['FLOAT.CV_MOVE_TO']);
    assertEquals(1, pi.executionCounts['FLOAT.CV_FORWARD']);
    assertEquals(1, pi.executionCounts['FLOAT.CV_TURN']);
  },
  testPushArray() {
    let pa = new PushArray();
    pa.push(3);
    assertEquals(1, pa.length);
    assertEquals(3, pa[0]);
  },
  testInfiniteLoopBug() {
    let bad ='( NAME.RAND ( INTEGER.FLUSH ( EXEC.IF ( FLOAT.ROT ) CODE.DUP ) ( CODE.IF CODE.LIST ) ( EXEC.K ) ( CODE.QUOTE ) ) ( EXEC.POP ) ( FLOAT.% ) CODE.DO )';
    let program = pushParseString(bad);
    let pi = new pushInterpreter(new MockCanvasElement());
    let ret = pushRunProgram(pi, program);
    assertEquals(-1, ret);
    assertEquals(2,  pi._error);
  },
  testInvalidStateBug() {
    let bad = '( 0 EXEC.SHOVE CODE.FLUSH )';
    let program = pushParseString(bad);
    let pi = new pushInterpreter(new MockCanvasElement());
    let ret = pushRunProgram(pi, program);
  },
  testExecDupBug() {
    let bad;
    bad = '( EXEC.DUP EXEC.DUP )';
    let program = pushParseString(bad);
    let pi = new pushInterpreter(new MockCanvasElement());
    let ret = pushRunProgram(pi, program);
    assertEquals(1,  pi._error);
  }
});

//this[ 'FLOAT.FROMINTEGER' ] = new pushInstruction( this.floatStack, pushInstructionFromInteger );
