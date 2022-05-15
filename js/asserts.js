
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
function assertTrue(expression) {
  if (!expression) {
    throw "not true";
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
