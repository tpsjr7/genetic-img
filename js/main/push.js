/*****************************************************************************
 *                                                                           *
 * PushScript                                                                *
 * Copyright (C) 2008-2010 Jonathan Klein                                    *
 *                                                                           *
 * This program is free software; you can redistribute it and/or modify      *
 * it under the terms of the GNU General Public License as published by      *
 * the Free Software Foundation; either version 2 of the License, or         *
 * (at your option) any later version.                                       *
 *                                                                           *
 * This program is distributed in the hope that it will be useful,           *
 * but WITHOUT ANY WARRANTY; without even the implied warranty of            *
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the             *
 * GNU General Public License for more details.                              *
 *                                                                           *
 * You should have received a copy of the GNU General Public License         *
 * along with this program; if not, write to the Free Software               *
 * Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA *
 *****************************************************************************/

//
// Push types
//

// slight modification to built-in types to lets us compare them like program
// export let window.logState;

import {CanvasWrapper} from "./canvas-wrapper.js";
import {RandomCodeGenerator} from "./random-code.js";
import {PushArray} from "./push-array.js";
import {MockCanvasElement} from "../test/mocks.js";

String.prototype.equals = function(inOther ) {
  return inOther == this;
}

Boolean.prototype.equals = function( inOther ) {
  return inOther == this;
}

Number.prototype.equals = function( inOther ) {
  return inOther == this;
}

Array.prototype._isPushProgram = true;
Array.prototype.toString = function() {
  var str = "";

  for( var i = 0; i < this.length; i++ )
    str += this[ i ] + " ";

  return "( " + str + ")";
}

Array.prototype.copy = function() {
  var newCopy = new PushArray();

  for( var i = 0; i < this.length; i++ ) {
    if( isPushProgram( this[ i ] ) )
      newCopy.push( this[ i ].copy() );
    else
      newCopy.push( this[ i ] );
  }

  return newCopy;
}

Array.prototype.equals = function( inOther ) {
  if( !isPushProgram( inOther ) ) return false;

  if( inOther.length != this.length ) return false;

  for( var i = 0; i < this.length; i++ ) {
    if( !this[ i ].equals( inOther[ i ] ) ) return false;
  }

  return true;
}

function pushFloat( inValue ) {
  this._value = inValue;

  this.toString = function() {
    var decimal = /\./;

    if( !decimal.test( this._value ) ) {
      // Force the float to look like a float so that it will be parsed back in correctly!
      return this._value + ".0";
    } else {
      return this._value;
    }
  }

  this.equals = function( inOther ) {
    return isPushFloat( inOther ) && this._value == inOther._value;
  }
}

function pushInt( inValue ) {
  this._value = inValue;

  this.toString = function() {
    return this._value;
  }

  this.equals = function( inOther ) {
    return isPushInt( inOther ) && this._value == inOther._value;
  }
}

function pushInstruction( inStack, inFunction ) {
  this._function = inFunction;
  this._stack = inStack;

  this.call = function( inInterpreter ) {
    this._function( inInterpreter, this._stack );
  }
}

function pushDefine( inStack, inValue ) {
  this._value = inValue;
  this._stack = inStack;

  this.call = function( inInterpreter ) {
    this._stack.push( this._value );
  }
}

//
// Utility typecheck functions
//

function isPushProgram( inObject ) {
  return typeof( inObject ) == "object" && inObject[ '_isPushProgram' ] == true;
}

function isPushFloat( inObject ) {
  return typeof( inObject ) == "object" && inObject.constructor == pushFloat;
}

function isPushInt( inObject ) {
  return typeof( inObject ) == "object" && inObject.constructor == pushInt;
}

function isPushInstruction( inObject ) {
  return typeof( inObject ) == "object" && inObject.constructor == pushInstruction;
}

function isPushDefine( inObject ) {
  return typeof( inObject ) == "object" && inObject.constructor == pushDefine;
}

//
//
// Boolean / Logic Instructions
//

function pushInstructionRandomBool( inInterpreter, inStack ) {
  inStack.push( Math.random() > 0.5 );
}

function pushInstructionRandomNumber( inInterpreter, inStack ) {
  inStack.push( Math.random() * 10 );
}

function pushInstructionRandomName( inInterpreter, inStack ) {
  inStack.push( "n" + inInterpreter._nameCounter++ );
}

function pushInstructionRandomCode( inInterpreter, inStack ) {
  if (inInterpreter.intStack.length == 0) {
    return;
  }
  let maxPoints = inInterpreter.conf['MAX-POINTS-IN-RANDOM-EXPRESSIONS'];
  if (!maxPoints) {
    throw 'MAX-POINTS-IN-RANDOM-EXPRESSIONS  is not set';
  }
  let randInstructions = inInterpreter.randInstructions
  if (!randInstructions) {
    throw "randInstructions not set";
  }
  let maxSize = Math.min(Math.abs(inInterpreter.intStack.pop()), maxPoints);
  let code = inInterpreter.codeGenerator.randomCode(maxSize);

  inInterpreter.codeStack.push(code);
  return;
}

function pushInstructionRandomBoundName( inInterpreter, inStack ) {
  throw "not implemented";
}


function pushInstructionAnd( inInterpreter, inStack ) {
  if( inStack.length > 1 ) {
    var o1 = inStack.pop();
    var o2 = inStack.pop();
    inInterpreter.boolStack.push( o2 && o1 );
  }
}

function pushInstructionOr( inInterpreter, inStack ) {
  if( inStack.length > 1 ) {
    var o1 = inStack.pop();
    var o2 = inStack.pop();
    inInterpreter.boolStack.push( o2 || o1 );
  }
}

function pushInstructionNot( inInterpreter, inStack ) {
  if( inStack.length > 0 ) {
    inInterpreter.boolStack.push( !inStack.pop() );
  }
}

function pushInstructionFromInteger( inInterpreter, inStack ) {
  if( inInterpreter.intStack.length > 0 ) {
    inStack.push( inInterpreter.intStack.pop() );
  }
}

function pushInstructionFromFloat( inInterpreter, inStack ) {
  if( inInterpreter.floatStack.length > 0 ) {
    inStack.push( inInterpreter.floatStack.pop() );
  }
}

function pushInstructionFromBoolean( inInterpreter, inStack ) {
  if( inStack.length > 0 ) {
    var num = 0;

    if( inInterpreter.boolStack.pop() == true ) num = 1;
    inStack.push( num );
  }
}


//
// Code stack functions
//

function pushInstructionQuote( inInterpreter, inStack ) {
  if( inInterpreter.execStack.length > 0 ) {
    inStack.push( inInterpreter.execStack.pop() );
  }
}

function pushInstructionCar( inInterpreter, inStack ) {
  if( inStack.length > 0 ) {
    var top = inStack.pop();
    if( isPushProgram( top ) ) {
      inStack.push( top.shift() );
    } else {
      inStack.push( top );
    }
  }
}

function pushInstructionCdr( inInterpreter, inStack ) {
  if( inStack.length > 0 ) {
    var top = inStack.pop();
    if( isPushProgram( top ) ) {
      top.shift();
      inStack.push( top );
    } else {
      inStack.push( new PushArray() );
    }
  }
}

function pushInstructionNth( inInterpreter, inStack ) {
  if( inStack.length > 0 && inInterpreter.intStack.length > 0 ) {
    var top = inStack.pop();
    var index = inInterpreter.intStack.pop();

    if( isPushProgram( top ) ) {
      index %= top.length;
      inStack.push( top[ ( top.length - 1 ) - index ] );
    } else {
      inStack.push( top );
    }
  }
}

function pushInstructionContains( inInterpreter, inStack ) {
  if( inStack.length > 1 ) {
    var program = inStack.pop();
    var sub = inStack.pop();

    for( var i = 0; i < program.length; i++ ) {
      if( program[ i ].equals( sub ) ) {
        inInterpreter.boolStack.push( true );
        return;
      }
    }
  }

  inInterpreter.boolStack.push( false );
}

function pushInstructionList( inInterpreter, inStack ) {
  if( inStack.length > 1 ) {
    var o1 = inStack.pop();
    var o2 = inStack.pop();
    var newCode = new PushArray();

    newCode.push( o2 );
    newCode.push( o1 );

    inStack.push( newCode );
  }
}

function pushInstructionCons( inInterpreter, inStack ) {
  if( inStack.length > 1 ) {
    var cdr = inStack.pop();
    var car = inStack.pop();

    if( !isPushProgram( cdr ) ) {
      var program = new PushArray();
      program.push( cdr );
      cdr = program;
    }

    cdr.unshift( car );
    inStack.push( cdr );
  }
}

function pushInstructionNoop( inInterpreter, inStack ) { }

function pushInstructionDo( inInterpreter, inStack ) {
  if( inInterpreter.codeStack.length > 0 ) {
    inInterpreter.execStack.push( "CODE.POP" );
    inInterpreter.execStack.push( inInterpreter.codeStack[ inInterpreter.codeStack.length - 1 ] );
  }
}

function pushInstructionDoStar( inInterpreter, inStack ) {
  if( inInterpreter.codeStack.length > 0 )
    inInterpreter.execStack.push( inInterpreter.codeStack.pop() );
}

function pushInstructionDoCount( inInterpreter, inStack ) {
  if( inStack.length > 0 && inInterpreter.intStack.length > 0 ) {
    var count = inInterpreter.intStack.pop();

    if( count < 1 ) return;

    var code = inStack.pop();
    var program = new PushArray();

    program.push( new pushInt( 0 ) );
    program.push( new pushInt( count - 1 ) );
    program.push( "EXEC.DO*RANGE" );
    program.push( code );

    inInterpreter.execStack.push( program );
  }
}

function pushInstructionDoTimes( inInterpreter, inStack ) {
  if( inStack.length > 0 && inInterpreter.intStack.length > 1 ) {
    var code = inStack.pop();

    if( !isPushProgram( code ) ) {
      var program = new PushArray();
      program.push( code );
      code = program;
    }

    code.splice( 0, 0, 'INTEGER.POP' );

    inStack.push( code );

    pushInstructionDoRange( inInterpreter, inStack );
  }
}

function pushInstructionDoRange( inInterpreter, inStack ) {
  if( inStack.length > 0 && inInterpreter.intStack.length > 1 ) {
    var end = inInterpreter.intStack.pop();
    var start = inInterpreter.intStack.pop();
    var code = inStack.pop();

    var inc = 1;
    if( end > start ) inc = -1;

    for( var i = end; i != start + inc; i += inc ) {
      inInterpreter.execStack.push( code );
      inInterpreter.execStack.push( new pushInt( i ) );
    }
  }
}

function pushInstructionIf( inInterpreter, inStack ) {
  if( inStack.length > 1 && inInterpreter.boolStack.length > 0 ) {
    var cond = inInterpreter.boolStack.pop();
    var ifFalse = inStack.pop();
    var ifTrue = inStack.pop();

    if( cond )
      inInterpreter.execStack.push( ifTrue );
    else
      inInterpreter.execStack.push( ifFalse );
  }
}

function pushInstructionLength( inInterpreter, inStack ) {
  if( inStack.length > 0 ) {
    var code = inStack.pop();
    inInterpreter.intStack.push( code.length );
  }
}

function pushInstructionNull( inInterpreter, inStack ) {
  if( inStack.length > 0 ) {
    var code = inStack.pop();
    inInterpreter.boolStack.push( isPushProgram( code ) && code.length == 0 );
  }
}

function pushInstructionAtom( inInterpreter, inStack ) {
  if( inStack.length > 0 ) {
    inInterpreter.boolStack.push( !isPushProgram( inStack.pop() ) );
  }
}

//
// Freaky Exec Combinators

function pushInstructionK( inInterpreter, inStack ) {
  if( inStack.length > 1 ) {
    inStack.splice( inStack.length - 1, 1 );
  }
}

function pushInstructionS( inInterpreter, inStack ) {
  if( inStack.length > 2 ) {
      var a = inStack.pop();
      var b = inStack.pop();
      var c = inStack.pop();

      var list = new PushArray();

      list.push( b );
      list.push( c );

      inStack.push( list );
      inStack.push( c );
      inStack.push( a );
    }
}

function pushInstructionY( inInterpreter, inStack ) {
  if( inStack.length > 0 ) {
      var top = inStack.pop();
      var list = new PushArray();

      list.push( "EXEC.Y" );
      list.push( top );
  }
}

//
// Comparison Instructions
//

function pushInstructionGreaterThan( inInterpreter, inStack ) {
  if( inStack.length > 1 ) {
    var o1 = inStack.pop();
    var o2 = inStack.pop();
    inInterpreter.boolStack.push( o2 > o1 );
  }
}

function pushInstructionLessThan( inInterpreter, inStack ) {
  if( inStack.length > 1 ) {
    var o1 = inStack.pop();
    var o2 = inStack.pop();
    inInterpreter.boolStack.push( o2 < o1 );
  }
}

function pushInstructionEquals( inInterpreter, inStack ) {
  if( inStack.length > 1 ) {
    var o1 = inStack.pop();
    var o2 = inStack.pop();
    inInterpreter.boolStack.push( o2.equals( o1 ) );
  }
}

//
// Arithmatic Instructions
//

function pushInstructionAdd( inInterpreter, inStack ) {
  if( inStack.length > 1 ) {
    var o1 = inStack.pop();
    var o2 = inStack.pop();
    inStack.push( o2 + o1 );
  }
}

function pushInstructionSubtract( inInterpreter, inStack ) {
  if( inStack.length > 1 ) {
    var o1 = inStack.pop();
    var o2 = inStack.pop();
    inStack.push( o2 - o1 );
  }
}

function pushInstructionCos( inInterpreter, inStack ) {
  if( inStack.length > 0 ) {
    inStack.push( Math.cos( inStack.pop() ) );
  }
}

function pushInstructionSin( inInterpreter, inStack ) {
  if( inStack.length > 0 ) {
    inStack.push( Math.sin( inStack.pop() ) );
  }
}

function pushInstructionTan( inInterpreter, inStack ) {
  if( inStack.length > 0 ) {
    inStack.push( Math.tan( inStack.pop() ) );
  }
}

function pushInstructionMultiply( inInterpreter, inStack ) {
  if( inStack.length > 1 ) {
    var o1 = inStack.pop();
    var o2 = inStack.pop();
    inStack.push( o2 * o1 );
  }
}

function pushInstructionDivide( inInterpreter, inStack ) {
  if( inStack.length > 1 ) {
    var o1 = inStack.pop();

    if( o1 == 0.0 ) { // oops!  protect the divide and return;
      inStack.push( o1 );
      return;
    }

    var o2 = inStack.pop();
    inStack.push( o2 / o1 );
  }
}

function pushInstructionModulus( inInterpreter, inStack ) {
  if( inStack.length > 1 ) {
    var o1 = inStack.pop();

    if( o1 == 0.0 ) { // oops!  protect the divide and return;
      inStack.push( o1 );
      return;
    }

    var o2 = inStack.pop();
    inStack.push( o2 % o1 );
  }
}
function pushInstructionMin( inInterpreter, inStack ) {
  if( inStack.length > 1 ) {
    var o1 = inStack.pop();
    var o2 = inStack.pop();
    inStack.push( Math.min( o1, o2 ) );
  }
}

function pushInstructionMax( inInterpreter, inStack ) {
  if( inStack.length > 1 ) {
    var o1 = inStack.pop();
    var o2 = inStack.pop();
    inStack.push( Math.max( o1, o2 ) );
  }
}

//
// Stack Manipulation Instructions
//

function pushInstructionPop( inInterpreter, inStack ) {
  if( inStack.length > 0 ) {
    inStack.pop();
  }
}

function pushInstructionStackdepth( inInterpreter, inStack ) {
  inInterpreter.intStack.push( inStack.length );
}

function pushInstructionDup( inInterpreter, inStack ) {
  if( inStack.length > 0 ) {
    inStack.push( inStack[ inStack.length - 1 ] );
  }
}

function pushInstructionDefine( inInterpreter, inStack ) {
  if( inStack.length > 0 && inInterpreter.nameStack.length > 0 ) {
    inInterpreter[ inInterpreter.nameStack.pop() ] = new pushDefine( inStack, inStack.pop() );
  }
}

function pushInstructionYank( inInterpreter, inStack ) {
  var intReq = 1;

  if( inStack == inInterpreter.intStack ) intReq = 2;

  if( inInterpreter.intStack.length >= intReq && inStack.length > 0 ) {
    var index = inInterpreter.intStack.pop();
    if (index < 0) {
      // do nothing if integer is negative;
      return;
    }

    if( index < inStack.length )
      inStack.push( inStack.splice( inStack.length - ( index + 1 ), 1 )[ 0 ] )
  }
}

function pushInstructionYankDup( inInterpreter, inStack ) {
  var intReq = 1;

  if( inStack == inInterpreter.intStack ) intReq = 2;

  if( inInterpreter.intStack.length >= intReq && inStack.length > 0 ) {
    var index = inInterpreter.intStack.pop();
    if (index < 0) {
      // do nothing if integer is negative;
      return;
    }

    if( index < inStack.length )
      inStack.push( inStack[ inStack.length - ( index + 1 ) ] )
  }
}

function pushInstructionShove( inInterpreter, inStack ) {
  var intReq = 1;

  if( inStack == inInterpreter.intStack ) intReq = 2;

  if( inInterpreter.intStack.length >= intReq && inStack.length > 0 ) {
    var index = inInterpreter.intStack.pop();
    if (index < 0) {
      // do nothing if integer is negative;
      return;
    }
    if( index < inStack.length ) {
      var replace = inStack.pop();
      inStack.splice( inStack.length - index, 0, replace );
    }
  }
}

function pushInstructionSwap( inInterpreter, inStack ) {
  if( inStack.length > 1 ) {
    var o1 = inStack.pop();
    var o2 = inStack.pop();
    inStack.push( o1 );
    inStack.push( o2 );
  }
}

function pushInstructionRot( inInterpreter, inStack ) {
  if( inStack.length > 2 ) {
    var index = inStack.length - 3;
    inStack.push( inStack.splice( index, 1 )[ 0 ] );
  }
}

function pushInstructionFlush( inInterpreter, inStack ) {
  // Do not construct a new stack -- we need to preserve our custom accessors.
  inStack.splice( 0, inStack.length );
}

function float_input( inInterpreter ) {
  inInterpreter.floatStack.push( inInterpreter[ 'inputValue' ] );
  inInterpreter.intStack.push( inInterpreter[ 'inputValue' ] );
}

export function pushInterpreter(canvasWrapper) {

  if (!canvasWrapper) {
    throw new Error("Missing canvas");
  }
  this.executionCounts = {};

  this.floatStack = new PushArray();
  this.execStack = new PushArray();
  this.codeStack = new PushArray();
  this.intStack = new PushArray();
  this.boolStack = new PushArray();
  this.nameStack = new PushArray();

  this._nameCounter = 0;

  this.conf = {
    'RAND-CONST-PROB': 0.05,
    'MIN-RANDOM-FLOAT': -10.0,
    'MAX-RANDOM-FLOAT': 10.0,
    'MAX-RANDOM-INTEGER': 10,
    'MIN-RANDOM-INTEGER': -10,
    'MAX-POINTS-IN-RANDOM-EXPRESSIONS': 25,
    'STACK-SIZE-LIMIT': 500,
    'EFFORT-LIMIT': 1000,
  };


  this.stats = {
    drawDistance: 0
  };

  this.intStack.push = function( inValue ) {
      this.parentpush = PushArray.prototype.push;
      this.parentpush( parseInt( inValue ) );
  };

  this.boolStack.push = function( inValue ) {
      this.parentpush = PushArray.prototype.push;
      this.parentpush( inValue != 0 );
  };

  this.codeStack.push = function( inValue ) {
      this.parentpush = PushArray.prototype.push;

      if( isPushProgram( inValue ) ) inValue = inValue.copy();

      this.parentpush( inValue );
  };

  this.execStack.push = function( inValue ) {
      this.parentpush = PushArray.prototype.push;

      if( isPushProgram( inValue ) ) inValue = inValue.copy();

      this.parentpush( inValue );
  };

  let stackNames = ['float', 'exec', 'code', 'int', 'bool', 'name'];


  if (false) {
    let theThis = this;
    for (let stackName of stackNames) {
      let theStack = theThis[stackName+'Stack'];
      theStack.pop = (function(me, origFunc, pushInt){
        return function(){
          let retval = origFunc.call(me);
          if (window.logState) {
            window.logState(pushInt, "pop " + stackName + ' = ' + retval);
          }
          return retval;
        };
      })(theStack, theStack.pop, this);

      theStack.push = (function(me, origFunc, pushInt){
        return function(val){
          let retval = origFunc.call(me, val);
          if (window.logState) {
            window.logState(pushInt, "push " + stackName + ' = ' + val );
          }
          return retval;
        };
      })(theStack, theStack.push, this);
    }
  }

  this.nextRandInt = function(maxVal) {
    return Math.floor(Math.random() * maxVal);
  };

  this.clearStacks = function() {
    this.floatStack.splice( 0, this.floatStack.length );
    this.execStack.splice( 0, this.execStack.length );
    this.codeStack.splice( 0, this.codeStack.length );
    this.intStack.splice( 0, this.intStack.length );
    this.boolStack.splice( 0, this.boolStack.length );
    this.nameStack.splice( 0, this.nameStack.length );
  }

  this.toString = function() {
    var text = "";
    for (let stack of ['float', 'int', 'bool', 'name', 'code', 'exec']) {
      let theStack = this[stack+'Stack'];
      if (theStack.length > 0) {
        text += stack + ': ' + theStack + "\n";
      }
    }
    return text;
  }

  this.floatStackTop = function() {
    return this.floatStack[ this.floatStack.length - 1 ];
  }

  this.intStackTop = function() {
    return this.intStack[ this.intStack.length - 1 ];
  }

  this.boolStackTop = function() {
    return this.boolStack[ this.boolStack.length - 1 ];
  }

  this.nameStackTop = function() {
    return this.boolStack[ this.nameStack.length - 1 ];
  }

  this.execStackTop = function() {
    return this.execStack[ this.execStack.length - 1 ];
  }

  this.codeStackTop = function() {
    return this.codeStack[ this.codeStack.length - 1 ];
  }

  this[ 'INTEGER.FROMFLOAT' ] = new pushInstruction( this.intStack, pushInstructionFromFloat );
  this[ 'BOOLEAN.FROMFLOAT' ] = new pushInstruction( this.boolStack, pushInstructionFromFloat );

  this[ 'FLOAT.FROMINTEGER' ] = new pushInstruction( this.floatStack, pushInstructionFromInteger );
  this[ 'BOOLEAN.FROMINTEGER' ] = new pushInstruction( this.boolStack, pushInstructionFromInteger );

  this[ 'FLOAT.FROMBOOLEAN' ] = new pushInstruction( this.floatStack, pushInstructionFromBoolean );
  this[ 'INTEGER.FROMBOOLEAN' ] = new pushInstruction( this.intStack, pushInstructionFromBoolean );

  this[ 'FLOAT.COS' ] = new pushInstruction( this.floatStack, pushInstructionCos );
  this[ 'FLOAT.SIN' ] = new pushInstruction( this.floatStack, pushInstructionSin );
  this[ 'FLOAT.TAN' ] = new pushInstruction( this.floatStack, pushInstructionTan );

  this[ 'INTEGER.>' ] = new pushInstruction( this.intStack, pushInstructionGreaterThan );
  this[ 'FLOAT.>' ] = new pushInstruction( this.floatStack, pushInstructionGreaterThan );

  this[ 'INTEGER.<' ] = new pushInstruction( this.intStack, pushInstructionLessThan );
  this[ 'FLOAT.<' ] = new pushInstruction( this.floatStack, pushInstructionLessThan );

  this[ 'INTEGER.=' ] = new pushInstruction( this.intStack, pushInstructionEquals  );
  this[ 'FLOAT.=' ] = new pushInstruction( this.floatStack, pushInstructionEquals );
  this[ 'BOOLEAN.=' ] = new pushInstruction( this.boolStack, pushInstructionEquals );
  this[ 'NAME.=' ] = new pushInstruction( this.nameStack, pushInstructionEquals );
  this[ 'EXEC.=' ] = new pushInstruction( this.execStack, pushInstructionEquals );
  this[ 'CODE.=' ] = new pushInstruction( this.codeStack, pushInstructionEquals );

  this[ 'INTEGER.+' ] = new pushInstruction( this.intStack, pushInstructionAdd );
  this[ 'FLOAT.+' ] = new pushInstruction( this.floatStack, pushInstructionAdd );

  this[ 'INTEGER.-' ] = new pushInstruction( this.intStack, pushInstructionSubtract );
  this[ 'FLOAT.-' ] = new pushInstruction( this.floatStack, pushInstructionSubtract );

  this[ 'INTEGER./' ] = new pushInstruction( this.intStack, pushInstructionDivide );
  this[ 'FLOAT./' ] = new pushInstruction( this.floatStack, pushInstructionDivide );

  this[ 'INTEGER.*' ] = new pushInstruction( this.intStack, pushInstructionMultiply );
  this[ 'FLOAT.*' ] = new pushInstruction( this.floatStack, pushInstructionMultiply );

  this[ 'INTEGER.%' ] = new pushInstruction( this.intStack, pushInstructionModulus );
  this[ 'FLOAT.%' ] = new pushInstruction( this.floatStack, pushInstructionModulus);

  this[ 'INTEGER.MIN' ] = new pushInstruction( this.intStack, pushInstructionMin );
  this[ 'FLOAT.MIN' ] = new pushInstruction( this.floatStack, pushInstructionMin );

  this[ 'INTEGER.MAX' ] = new pushInstruction( this.intStack, pushInstructionMax );
  this[ 'FLOAT.MAX' ] = new pushInstruction( this.floatStack, pushInstructionMax );

  this[ 'FLOAT.DEFINE' ] = new pushInstruction( this.floatStack, pushInstructionDefine );
  this[ 'INTEGER.DEFINE' ] = new pushInstruction( this.intStack, pushInstructionDefine );
  this[ 'CODE.DEFINE' ] = new pushInstruction( this.codeStack, pushInstructionDefine );
  this[ 'EXEC.DEFINE' ] = new pushInstruction( this.execStack, pushInstructionDefine );
  this[ 'BOOLEAN.DEFINE' ] = new pushInstruction( this.boolStack, pushInstructionDefine );

  this[ 'FLOAT.POP' ] = new pushInstruction( this.floatStack, pushInstructionPop );
  this[ 'INTEGER.POP' ] = new pushInstruction( this.intStack, pushInstructionPop );
  this[ 'CODE.POP' ] = new pushInstruction( this.codeStack, pushInstructionPop );
  this[ 'EXEC.POP' ] = new pushInstruction( this.execStack, pushInstructionPop );
  this[ 'BOOLEAN.POP' ] = new pushInstruction( this.boolStack, pushInstructionPop );
  this[ 'NAME.POP' ] = new pushInstruction( this.nameStack, pushInstructionPop );

  this[ 'FLOAT.DUP' ] = new pushInstruction( this.floatStack, pushInstructionDup );
  this[ 'INTEGER.DUP' ] = new pushInstruction( this.intStack, pushInstructionDup );
  this[ 'CODE.DUP' ] = new pushInstruction( this.codeStack, pushInstructionDup );
  this[ 'EXEC.DUP' ] = new pushInstruction( this.execStack, pushInstructionDup );
  this[ 'BOOLEAN.DUP' ] = new pushInstruction( this.boolStack, pushInstructionDup );
  this[ 'NAME.DUP' ] = new pushInstruction( this.nameStack, pushInstructionDup );

  this[ 'FLOAT.YANK' ] = new pushInstruction( this.floatStack, pushInstructionYank );
  this[ 'INTEGER.YANK' ] = new pushInstruction( this.intStack, pushInstructionYank );
  this[ 'CODE.YANK' ] = new pushInstruction( this.codeStack, pushInstructionYank );
  this[ 'EXEC.YANK' ] = new pushInstruction( this.execStack, pushInstructionYank );
  this[ 'BOOLEAN.YANK' ] = new pushInstruction( this.boolStack, pushInstructionYank );
  this[ 'NAME.YANK' ] = new pushInstruction( this.nameStack, pushInstructionYank );

  this[ 'FLOAT.YANKDUP' ] = new pushInstruction( this.floatStack, pushInstructionYankDup );
  this[ 'INTEGER.YANKDUP' ] = new pushInstruction( this.intStack, pushInstructionYankDup );
  this[ 'CODE.YANKDUP' ] = new pushInstruction( this.codeStack, pushInstructionYankDup );
  this[ 'EXEC.YANKDUP' ] = new pushInstruction( this.execStack, pushInstructionYankDup );
  this[ 'BOOLEAN.YANKDUP' ] = new pushInstruction( this.boolStack, pushInstructionYankDup );
  this[ 'NAME.YANKDUP' ] = new pushInstruction( this.nameStack, pushInstructionYankDup );

  this[ 'FLOAT.SHOVE' ] = new pushInstruction( this.floatStack, pushInstructionShove );
  this[ 'INTEGER.SHOVE' ] = new pushInstruction( this.intStack, pushInstructionShove );
  this[ 'CODE.SHOVE' ] = new pushInstruction( this.codeStack, pushInstructionShove );
  this[ 'EXEC.SHOVE' ] = new pushInstruction( this.execStack, pushInstructionShove );
  this[ 'BOOLEAN.SHOVE' ] = new pushInstruction( this.boolStack, pushInstructionShove );
  this[ 'NAME.SHOVE' ] = new pushInstruction( this.nameStack, pushInstructionShove );

  this[ 'FLOAT.ROT' ] = new pushInstruction( this.floatStack, pushInstructionRot );
  this[ 'INTEGER.ROT' ] = new pushInstruction( this.intStack, pushInstructionRot );
  this[ 'CODE.ROT' ] = new pushInstruction( this.codeStack, pushInstructionRot );
  this[ 'EXEC.ROT' ] = new pushInstruction( this.execStack, pushInstructionRot );
  this[ 'BOOLEAN.ROT' ] = new pushInstruction( this.boolStack, pushInstructionRot );
  this[ 'NAME.ROT' ] = new pushInstruction( this.nameStack, pushInstructionRot );

  this[ 'FLOAT.STACKDEPTH' ] = new pushInstruction( this.floatStack, pushInstructionStackdepth );
  this[ 'INTEGER.STACKDEPTH' ] = new pushInstruction( this.intStack, pushInstructionStackdepth );
  this[ 'CODE.STACKDEPTH' ] = new pushInstruction( this.codeStack, pushInstructionStackdepth );
  this[ 'EXEC.STACKDEPTH' ] = new pushInstruction( this.execStack, pushInstructionStackdepth );
  this[ 'BOOLEAN.STACKDEPTH' ] = new pushInstruction( this.boolStack, pushInstructionStackdepth );
  this[ 'NAME.STACKDEPTH' ] = new pushInstruction( this.nameStack, pushInstructionStackdepth );

  this[ 'FLOAT.SWAP' ] = new pushInstruction( this.floatStack, pushInstructionSwap );
  this[ 'INTEGER.SWAP' ] = new pushInstruction( this.intStack, pushInstructionSwap );
  this[ 'CODE.SWAP' ] = new pushInstruction( this.codeStack, pushInstructionSwap );
  this[ 'EXEC.SWAP' ] = new pushInstruction( this.execStack, pushInstructionSwap );
  this[ 'BOOLEAN.SWAP' ] = new pushInstruction( this.boolStack, pushInstructionSwap );
  this[ 'NAME.SWAP' ] = new pushInstruction( this.nameStack, pushInstructionSwap );

  this[ 'FLOAT.FLUSH' ] = new pushInstruction( this.floatStack, pushInstructionFlush );
  this[ 'INTEGER.FLUSH' ] = new pushInstruction( this.intStack, pushInstructionFlush );
  this[ 'CODE.FLUSH' ] = new pushInstruction( this.codeStack, pushInstructionFlush );
  this[ 'EXEC.FLUSH' ] = new pushInstruction( this.execStack, pushInstructionFlush );
  this[ 'BOOLEAN.FLUSH' ] = new pushInstruction( this.boolStack, pushInstructionFlush );
  this[ 'NAME.FLUSH' ] = new pushInstruction( this.nameStack, pushInstructionFlush );

  this[ 'BOOLEAN.AND' ] = new pushInstruction( this.boolStack, pushInstructionAnd );
  this[ 'BOOLEAN.OR' ] = new pushInstruction( this.boolStack, pushInstructionOr );
  this[ 'BOOLEAN.NOT' ] = new pushInstruction( this.boolStack, pushInstructionNot );

  this[ 'CODE.QUOTE' ] = new pushInstruction( this.codeStack, pushInstructionQuote );
  this[ 'CODE.CAR' ] = new pushInstruction( this.codeStack, pushInstructionCar );
  this[ 'CODE.CDR' ] = new pushInstruction( this.codeStack, pushInstructionCdr );
  this[ 'CODE.CONTAINS' ] = new pushInstruction( this.codeStack, pushInstructionContains );
  this[ 'CODE.NTH' ] = new pushInstruction( this.codeStack, pushInstructionNth );
  this[ 'CODE.LIST' ] = new pushInstruction( this.codeStack, pushInstructionList );
  this[ 'CODE.CONS' ] = new pushInstruction( this.codeStack, pushInstructionCons );
  this[ 'CODE.DO' ] = new pushInstruction( this.codeStack, pushInstructionDo );
  this[ 'CODE.DO*' ] = new pushInstruction( this.codeStack, pushInstructionDoStar );
  this[ 'CODE.DO*RANGE' ] = new pushInstruction( this.codeStack, pushInstructionDoRange );
  this[ 'CODE.DO*COUNT' ] = new pushInstruction( this.codeStack, pushInstructionDoCount );
  this[ 'CODE.DO*TIMES' ] = new pushInstruction( this.codeStack, pushInstructionDoTimes );
  this[ 'CODE.IF' ] = new pushInstruction( this.codeStack, pushInstructionIf );
  this[ 'CODE.NULL' ] = new pushInstruction( this.codeStack, pushInstructionNull );
  this[ 'CODE.ATOM' ] = new pushInstruction( this.codeStack, pushInstructionAtom );
  this[ 'CODE.LENGTH' ] = new pushInstruction( this.codeStack, pushInstructionLength );
  this[ 'CODE.NOOP' ] = new pushInstruction( this.codeStack, pushInstructionNoop );

  this[ 'EXEC.DO*RANGE' ] = new pushInstruction( this.execStack, pushInstructionDoRange );
  this[ 'EXEC.DO*TIMES' ] = new pushInstruction( this.execStack, pushInstructionDoTimes );
  this[ 'EXEC.DO*COUNT' ] = new pushInstruction( this.execStack, pushInstructionDoCount );
  this[ 'EXEC.IF' ] = new pushInstruction( this.execStack, pushInstructionIf );
  this[ 'EXEC.S' ] = new pushInstruction( this.execStack, pushInstructionS );
  this[ 'EXEC.K' ] = new pushInstruction( this.execStack, pushInstructionK );
  this[ 'EXEC.Y' ] = new pushInstruction( this.execStack, pushInstructionY );

  this[ 'BOOLEAN.RAND' ] = new pushInstruction( this.boolStack, pushInstructionRandomBool );
  this[ 'INTEGER.RAND' ] = new pushInstruction( this.intStack, pushInstructionRandomNumber );
  this[ 'FLOAT.RAND' ] = new pushInstruction( this.floatStack, pushInstructionRandomNumber );
  this[ 'NAME.RAND' ] = new pushInstruction( this.nameStack, pushInstructionRandomName );
  this[ 'CODE.RAND' ] = new pushInstruction( this.codeStack, pushInstructionRandomCode );

  this[ 'TRUE' ] = new pushDefine( this.boolStack, true );
  this['FALSE'] = new pushDefine(this.boolStack, false);

  // this[ 'INPUT' ] = float_input;

  /// Canvas stuff
  this['FLOAT.CV_MOVE_TO'] = new pushInstruction(this.floatStack, function (inInterpreter, inStack) {
    if (inStack.length >= 2) {
      let a = inStack.pop();
      let b = inStack.pop();
      if (canvasWrapper.moveTo(a, b)) {
        inInterpreter.executionCounts['FLOAT.CV_MOVE_TO']++;
      } else {
        inStack.push(b);
        inStack.push(a);
      }
    }
  });

  this['FLOAT.CV_FORWARD'] = new pushInstruction(this.floatStack, function (inInterpreter, inStack) {
    if (inStack.length >= 1) {
      let val = inStack.pop();
      if (canvasWrapper.forward(val)) {
        inInterpreter.stats.drawDistance += canvasWrapper.lastDrawDistance;
        inInterpreter.executionCounts['FLOAT.CV_FORWARD']++;
      } else {
        inStack.push(val);
      }
    }
  });

  this['FLOAT.CV_TURN'] = new pushInstruction(this.floatStack, function (inInterpreter, inStack) {
    if (inStack.length >= 1) {
      inInterpreter.executionCounts['FLOAT.CV_TURN']++;
      canvasWrapper.turn(inStack.pop());
    }
  });

  this.randInstructions = getPushInstructionSet(this);

  this.codeGenerator = new RandomCodeGenerator(this);
  /// End Canvas stuff
}

/**
 * Runs a parsed Push program.
 *
 * @return 0 upon success, or -1 on error.
 */
export function pushRunProgram( inInterpreter, inProgramArray ) {
  try {
    return _pushRunProgramHelper(inInterpreter, inProgramArray);
  } catch (e) {
    console.error(e);
    alert('error');
    debugger;
    throw e;
  }
}

function _pushRunProgramHelper( inInterpreter, inProgramArray ) {
  console.log('running', inProgramArray.toString());
  var atom;

  inInterpreter.executionCounts = {};
  for (let key of getPushInstructionSet(inInterpreter)) {
    inInterpreter.executionCounts[key] = 0;
  }

  inInterpreter._effort = 0;

  inInterpreter.codeStack.push( inProgramArray );
  inInterpreter.execStack.push( inProgramArray );

  const stackLimit = inInterpreter.conf['STACK-SIZE-LIMIT'];
  const effortLimit = inInterpreter.conf['EFFORT-LIMIT'];

  while( inInterpreter.execStack.length > 0 ) {

    atom = inInterpreter.execStack.pop();

    if( isPushProgram( atom ) ) {
      while( atom.length > 0 ) inInterpreter.execStack.push( atom.pop() )
    } else if( isPushFloat( atom ) ) {
      inInterpreter.floatStack.push( atom._value );
    } else if( isPushInt( atom ) ) {
      inInterpreter.intStack.push( atom._value );
    } else {
      var func = inInterpreter[ atom ];

      if( func == null ) {
        inInterpreter.nameStack.push( atom );
      } else if( isPushInstruction( func ) || isPushDefine( func ) ) {

        window.logState && window.logState(inInterpreter, 'before run ' + atom);
        func.call( inInterpreter );
        window.logState && window.logState(inInterpreter, 'after run ' + atom);
      } else {
        window.logState && window.logState(inInterpreter, 'before run ' + atom);
        func( inInterpreter );
        window.logState && window.logState(inInterpreter, 'after run ' + atom);
      }
    }


    inInterpreter._effort++;
    // console.log(inInterpreter._effort);
    // console.log("code stack: " + inInterpreter.codeStack.count);

    if (inInterpreter.codeStack.count > stackLimit ||
        inInterpreter.execStack.count > stackLimit ||
        inInterpreter.intStack.count > stackLimit ||
        inInterpreter.floatStack.count > stackLimit ||
        inInterpreter.boolStack.count > stackLimit ||
        inInterpreter.nameStack.count > stackLimit
    ) {
        inInterpreter._errorMessage = `Stack size limit reached`;
        inInterpreter._error = 2;
        return -1;
    }


    if( inInterpreter._effort > effortLimit ) {
      inInterpreter._errorMessage = `Hardcoded effort limit reached (${effortLimit} instructions)`;
      inInterpreter._error = 1;
      console.log(inProgramArray.toString());
      // throw new Error(inInterpreter._errorMessage);
      return -1;
    }
  }

  return 0;
}

function pushSetInputValue( inInterpreter, inValue ) {
  inInterpreter[ 'inputValue' ] = inValue;
}

function pushFloatStackPush( inInterpreter, inValue ) {
  return inInterpreter.floatStack.push( inValue );
}

function pushIntStackPush( inInterpreter, inValue ) {
  return inInterpreter.intStack.push( inValue );
}

export function getPushInstructionSet(inInterpreter) {
  let keys = [];
  for (let i in inInterpreter) {
      if(/^[A-Z]/.test(i)) {
        keys.push(i);
      }
  }
  return keys;
}
/**
 * Parses a string into a Push program suitable for execution with an interpreter
 */
export function pushParseString( inString ) {
  // insert spaces around all parens so that our split works

  let origString = inString;
  var parens = /[\(\)]/;

  if( !parens.test( inString ) ) {
    inString = " ( " + inString + " ) ";
  }

  inString = inString.replace( /([\(\)])/g, ' $1 ' );
  inString = inString.replace( /[\r\n]/g, ' ' );

  var tokens = inString.split( ' ' );

  var listStack = new PushArray();

  var currentList = null;
  var lastList = null;

  var spaces = /\ +/;
  var decimal = /\./;
  var num = 0;
  function error(mess) {
    console.log("Error running: " + origString);
    throw new Error(mess);
  }

  for( var i = 0; i < tokens.length; i++ ) {
    if( !spaces.test( tokens[ i ] ) ) {

      if( tokens[ i ] === '(' ) {        // Push

        listStack.push( new PushArray() );
        currentList = listStack[ listStack.length - 1 ];

      } else if( tokens[ i ] == ')' ) {    // Pop
        if( listStack.length < 1 ) {
          error( "Unmatched ')' in Push program (token #" + i + ")");
        }

        var newList = listStack.pop();

        lastList = newList;

        currentList = listStack[ listStack.length - 1 ];

        if( currentList != null )
          currentList.push( newList );

      } else if ( ( num = parseFloat( tokens[ i ] ) ) == tokens[ i ] ) {  // Number literal
        if( currentList == null ) {
          // alert( 'Push parse error near token "' + tokens[ i ] + '"' );
          error('Push parse error near token "' + tokens[ i ] + '"');
        }

        if( decimal.test( tokens[ i ] ) )
          currentList.push( new pushFloat( num ) );
        else
          currentList.push( new pushInt( num ) );
      } else if( tokens[ i ] != '' ) {    // Instruction token
        if( currentList == null ) {
          error('Push parse error near token "' + tokens[ i ] + '"');
        }

        currentList.push( tokens[ i ] );
      }
    }
  }

  if( listStack.length > 0 ) {
    error("Unmatched '(' in Push program");
  }

  return lastList;
}

window.pushParseString = pushParseString;

/**
 * Parses a string into a program and executes the program with a new interpreter
 *
 * @return The string state of the interpreter
 */

export function pushRunString( inProgram, canvasWrapper ) {
  if (!canvasWrapper) {
    canvasWrapper = new CanvasWrapper(new MockCanvasElement());
  }

  var program = pushParseString( inProgram );

  var interpreter = new pushInterpreter(canvasWrapper);

  var info = pushRunProgram( interpreter, program )

  return interpreter.toString();
}

window.pushRunString = pushRunString;
