import {PushArray} from "./push-array.js";

function xoshiro128ss(a, b, c, d) {
    return function() {
        let t = b << 9, r = a * 5; r = (r << 7 | r >>> 25) * 9;
        c ^= a; d ^= b;
        b ^= c; a ^= d; c ^= t;
        d = d << 11 | d >>> 21;
        return (r >>> 0) / 4294967296;
    }
}

function cyrb128(str) {
    let h1 = 1779033703, h2 = 3144134277,
        h3 = 1013904242, h4 = 2773480762;
    for (let i = 0, k; i < str.length; i++) {
        k = str.charCodeAt(i);
        h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
        h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
        h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
        h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
    }
    h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
    h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
    h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
    h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
    return [(h1^h2^h3^h4)>>>0, (h2^h1)>>>0, (h3^h1)>>>0, (h4^h1)>>>0];
}

function mulberry32(a) {
    return function() {
        let t = a += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

export function rand(seed) {
    return mulberry32(cyrb128(seed)[0]);
}

export class RandomCodeGenerator {

    randFloatFunc;
    nextRandIntFunc;
    randInstructions;
    conf;

    constructor(inInterpreter) {
      if (inInterpreter) {
        this.conf =  inInterpreter.conf
        this.randInstructions = inInterpreter.randInstructions;
        this.randFloatFunc = Math.random;
        this.nextRandIntFunc = inInterpreter.nextRandInt;
      }
    }

    /*
    function DECOMPOSE (inputs: NUMBER,  MAX-PARTS)
      If NUMBER is 1 or MAX-PARTS is 1 then return a list
          containing NUMBER
      Otherwise set THIS-PART to be a random number between 1 and
          (NUMBER - 1). Return a list containing THIS-PART and
          all of the items in the result of DECOMPOSE with inputs
          (NUMBER - THIS-PART) and (MAX-PARTS - 1)
    End
    */
    decompose(number, maxParts) {
        if (number === 0) {
            return new PushArray();
        }
        if (number === 1 || maxParts === 1) {
            let pa = new PushArray();
            pa.push(number);
            return pa;
        }

        let thisPart = this.nextRandIntFunc(number - 1) + 1;
        let toReturn = new PushArray();
        toReturn.push(thisPart);
        for (let val of this.decompose(number - thisPart, maxParts - 1)) {
            toReturn.push(val);
        }
        return toReturn;
    }


    /*
    Function RANDOM-CODE-WITH-SIZE (input: POINTS)
      If POINTS is 1 then choose a random element of the instruction
         set. If this is an ephemeral random constant then return a
         randomly-chosen value of the appropriate type; otherwise
         return the chosen element.
      Otherwise set SIZES-THIS-LEVEL to the result of DECOMPOSE
          called with both inputs (POINTS - 1). Return a list
          containing the results, in random order, of
          RANDOM-CODE-WITH-SIZE called with all inputs in
          SIZES-THIS-LEVEL.
    End
    */
    /* Randomize array in-place using Durstenfeld shuffle algorithm */
    function

    shuffleArray(array) {
        for (var i = array.length - 1; i > 0; i--) {
            var j = Math.floor(this.randFloatFunc() * (i + 1));
            var temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
    }

    /**
     * random int from min to max inclusive
     * @param min
     * @param max
     * @param randFloatFunc
     * @returns int
     */
    #randIntRange(min, max) {
        return Math.floor(this.randFloatFunc() * (max - min + 1)) + min;
    }

    randomCodeWithSize(points) {
        if (points < 1) throw "points must be > 0";
        if (points === 1) {
            if (this.randFloatFunc() < this.conf['RAND-CONST-PROB']) {
                // choose random constant
                let min, max;
                switch (this.nextRandIntFunc(3)) {
                    case 0: // bool
                        return this.#randIntRange(0, 1) === 1 ? 'TRUE' : 'FALSE';
                    case 1: // int
                        min = this.conf['MIN-RANDOM-INTEGER'];
                        max = this.conf['MAX-RANDOM-INTEGER'];
                        return this.#randIntRange(min, max);
                    case 2: // float
                        min = this.conf['MIN-RANDOM-FLOAT'];
                        max = this.conf['MAX-RANDOM-FLOAT'];
                        return this.randFloatFunc() * (max - min) + min;
                    default:
                        throw "invalid case"
                }
            } else {
                // choose random element
                return this.randInstructions[this.nextRandIntFunc(this.randInstructions.length)];
            }
        } else if (points !== 1) {
            /*
            Otherwise set SIZES-THIS-LEVEL to the result of DECOMPOSE
                called with both inputs (POINTS - 1). Return a list
                containing the results, in random order, of
                RANDOM-CODE-WITH-SIZE called with all inputs in
                SIZES-THIS-LEVEL.
            */
            let sizesThisLevel = this.decompose(points - 1, points - 1);
            let ret = new PushArray();
            for (let val of sizesThisLevel) {
                ret.push(this.randomCodeWithSize(val));
            }
            this.shuffleArray(ret, this.randFloatFunc);
            return ret;
        }
    }

    randomCode(maxPoints) {
        return this.randomCodeWithSize(this.#randIntRange(1, maxPoints));
    }

}
