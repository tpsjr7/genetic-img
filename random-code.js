
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
function decompose(number, maxParts, randomFunc) {
  if (number == 0) {
    return [];
  }
  if (number == 1 || maxParts == 1) {
    return [number];
  }

  let thisPart = randomFunc(number - 1) + 1;
  let toReturn = [thisPart];
  for (let val of decompose(number - thisPart, maxParts - 1, randomFunc)) {
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
