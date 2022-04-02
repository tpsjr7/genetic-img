// let maybeOperations = {
//   add: () => {},
//   push: () => {},
//   pop: () =>{},
//   rotate: () => {},
//   forward: () => {},
//   pushSavePoint: () => {},
//   popSavePoint: () => {},
//   peekSavePoint: () => {},
//   setColor: () => {},
//   origin: () => {},
//   pushRandomDegrees: () => {},
//   setRegister:() => {},
//   pushRandomRegisterIndex: null,
//   increment: null,
//   0,
//   1,
//   2,
//   4,
//   8,
//   16,
//   32,
//   64,
//   multiply,
//   add,
//   divide,
//   substract,
//   negate,
//   getPosition,
//   moveToPosition
// };


let canvas = document.getElementsByTagName('canvas')[0];
let WIDTH = canvas.width;
let HEIGHT = canvas.height;

let ctx = canvas.getContext('2d');
let intStack = [];


let bumper = (x) => {
  if (x >= WIDTH) {
    return WIDTH;
  } else if (x <= 0){
    return 0;
  } else {
    return x;
  }
}

function pop1Int(cb) {
  return () => {
    let a = intStack.pop();
    if (a == undefined ) {
      return;
    }
    if (!cb) throw new Error("missing callback");
    cb(bumper(a));
  };
}

function pop2Ints(cb) {
  return ()=>{
    let a = intStack.pop();
    let b = intStack.pop();
    if (a == undefined || b == undefined) {
      return;
    }
    if (!cb) throw new Error("missing callback");
    cb(bumper(a),bumper(b));
  }
}

let currentX = 0, currentY = 0;
function moveTo(x,y){
  currentX = x;
  currentY = y;
  ctx.moveTo(x,y);
}

let theta = 0;

let operations = {
  "0": () => {
    intStack.push(0);
  },
  "move": pop2Ints(moveTo),
  "forward": pop1Int((a)=>{
    let rads = Math.PI / 180 * theta;
    let xNew = currentX + a * Math.cos(rads);
    let yNew = currentY + a * Math.sin(rads);
    currentX = xNew;
    currentY = yNew;
    ctx.lineTo(xNew, yNew);
    ctx.stroke();
  }),
  "originX": ()=>{
    intStack.push(WIDTH / 2);
  },
  "originY": ()=>{
    intStack.push(HEIGHT / 2);
  },
  "turn": pop1Int(a => {
    theta += a;
  })
};

let program = `
originX originY move
32 forward
45 turn
100 forward
`;

function runProgram(program) {
  let lines = program.split('\n');
  for (let line of lines) {
    for (let operationString of line.split(' ')) {
      if (operationString.trim() == '') continue;
      let operation = operations[operationString];
      let theInt;
      if (operation) {
        console.log(operationString);
        operation();
      } else if (theInt = parseInt(operationString)) {
        console.log(theInt);
        intStack.push(theInt);
      } else {
        console.error('invalid operation = ' + operationString);
      }
    }
  }
}

runProgram(program);
