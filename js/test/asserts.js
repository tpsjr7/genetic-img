
export function makeRandomSeq(seq){
  let count = 0;
  return function() {
    if (count >= seq.length){
      throw "out of range";
    }
    return seq[count++];
  };
}

function isEqual(obj1, obj2) {
  let props1 = Object.getOwnPropertyNames(obj1);
  let props2 = Object.getOwnPropertyNames(obj2);
  if (props1.length !== props2.length) {
    return false;
  }
  for (let i = 0; i < props1.length; i++) {
    let val1 = obj1[props1[i]];
    let val2 = obj2[props1[i]];
    let isObjects = isObject(val1) && isObject(val2);
    if (isObjects && !isEqual(val1, val2) || !isObjects && val1 !== val2) {
      return false;
    }
  }

  return true;
}
function isObject(object) {
  return object != null && typeof object === 'object';
}

export function assertEquals(expected, actual, message) {
  if (typeof expected !== typeof actual) {
    throw new Error(`Fail: types dont match. Expected: ${expected} vs Actual: ${actual}`);
  }
  if (Array.isArray(expected) && Array.isArray(actual)) {
    if (expected.length !== actual.length || expected.toString() !== actual.toString()) {
      throw new Error(`Failed. Excepted: ${expected}, Actual: ${actual}`);
    }
    return;
  }

  if (typeof expected === 'object' && isEqual(expected, actual)) {
    return;
  }

  if (expected !== actual) {
    let mess = message ?  message + ', ' : '';
    mess += 'Failed: Expected: '
        + JSON.stringify(expected) + ', Actual: ' + JSON.stringify(actual);
    throw new Error(mess);
  }
}

export function assertTrue(expression) {
  if (!expression) {
    throw new Error("not true");
  }
}

export function assertThrows(code, expectedErrMessage) {
  try {
    code();

  } catch (e) {
    if (expectedErrMessage) {
      assertEquals(expectedErrMessage, e.message);
    }
    return;
  }
  throw new Error("Fail, didn't throw as expected");
}

export function fail(mess) {
  throw new Error("Fail " + mess);
}

let tests = [];
export function addTests(someTests) {
  for (let t in someTests) {
    if (tests[t]) {
      throw new Error(`test ${t} already exists`);
    }
    tests[t] = someTests[t];
  }
}
export function runTests() {
  try {
    let count = 0;
    for (let test of Object.keys(tests)) {
      count++;
      console.log('Running ' + test);
      tests[test]();
    }
    document.body.innerHTML = `<h1 style="color: green">${count} Pass</h1>`;
  } catch (e) {
    console.warn(e);
    document.body.innerHTML = '<h1 style="color: red">Fail</h1>';
  }
}
