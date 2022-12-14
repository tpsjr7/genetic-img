
export function makeRandomSeq(seq, opts, log){
  if (!log) {
    log = console.log;
  }
  let count = 0;
  let label;
  let theRestValue;
  if (typeof opts !== 'undefined') {
    if (typeof opts !== 'object') {
      throw new Error('expecting options object');
    }
    theRestValue = opts.rest;
    label = opts.mess;
  }
  label = label ? 'Seq ' + label + ': ' : '';
  let COUNT_LIMIT = 100;
  return function() {
    if (count > COUNT_LIMIT) {
      throw new Error("hit count limit " + COUNT_LIMIT);
    }
    if (count >= seq.length){
      if (typeof theRestValue != 'undefined') {
        log(`${label}index #${count}, val: ${theRestValue} rest:true`);
        count++;
        return theRestValue;
      } else {
        throw new Error("out of range");
      }
    }
    log(`${label}index #${count}, val: ${seq[count]}`);
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
  let html = '';
  try {
    let count = 0;
    let keys = Object.keys(tests);
    let focused = keys.filter(it => it.startsWith("focus_"));

    let keysToRun = keys;
    if (focused.length > 0) {
      keysToRun = focused;
    }

    keysToRun = keysToRun.filter((it => !it.startsWith("skip_")));

    for (let test of keysToRun) {
      count++;
      console.log('Running ' + test);
      html += `Running ${test} </br>`;
      document.body.innerHTML = html;
      tests[test]();
    }
    html += `<h1 style="color: green">${count} Pass</h1>`
    document.body.innerHTML = html;
  } catch (e) {
    console.warn(e);
    html += '<h1 style="color: red">Fail</h1>';
    document.body.innerHTML = html;
  }
}
