const fs = require("fs");
const assert = require("assert");

const parseData = (str) => {
  return str.trim().split("\n");
};

const data = parseData(fs.readFileSync("18.dat").toString());

const getParantheses = (array) => {
  let pos = 0;
  let indexes = [];
  let count = 0;

  while (pos < array.length) {
    const char = array[pos];
    if (char === "(") {
      count++;
      if (indexes[0] === undefined) {
        indexes.push(pos);
      }
    } else if (char === ")") {
      count--;
      if (count === 0) {
        indexes.push(pos);
        return indexes;
      }
    }
    pos++;
  }

  return null;
};

assert.deepStrictEqual(getParantheses("1+2+3+4".split("")), null);
assert.deepStrictEqual(getParantheses("1+2+(3+4)".split("")), [4, 8]);
assert.deepStrictEqual(getParantheses("1+2+(3+4)+(5+6)".split("")), [4, 8]);
assert.deepStrictEqual(getParantheses("1+2+(3+4+5)+(5+6)".split("")), [4, 10]);
assert.deepStrictEqual(getParantheses("1+2+(3+4+(5+6))+(5+6)".split("")), [
  4,
  14,
]);

const compute = (operation, v2) => {
  operation = operation.split("(").join("( ").split(")").join(" )").split(" ");

  while (true) {
    let ps = getParantheses(operation);
    if (!ps) break;
    operation = [
      ...operation.slice(0, ps[0]),
      compute(
        operation
          .slice(ps[0] + 1, ps[1])
          .join(" ")
          .trim(),
        v2
      ),
      ...operation.slice(ps[1] + 1),
    ];
  }

  if (v2) {
    let pos = 0;
    let pass = 0;
    while (pos <= operation.length) {
      const now = operation[pos];
      if ((now === "+" && pass === 0) || (now === "*" && pass === 1)) {
        let result;
        const ops = [operation[pos - 1], operation[pos + 1]].map((i) =>
          parseInt(i)
        );
        if (now === "+") {
          result = ops[0] + ops[1];
        } else {
          result = ops[0] * ops[1];
        }
        operation = [
          ...operation.slice(0, pos - 1),
          result,
          ...operation.slice(pos + 2),
        ];
        pos--;
      }
      pos++;
      if (pass === 0 && pos === operation.length) {
        pass = 1;
        pos = 0;
      }
    }

    return parseInt(operation[0]);
  } else {
    let pos = 0;
    let result = 0;
    let lastOperation = "+";
    while (pos < operation.length) {
      const now = operation[pos];
      switch (now) {
        case "+":
        case "*":
          lastOperation = now;
          break;
        default:
          switch (lastOperation) {
            case "+":
              result += parseInt(now);
              break;
            case "*":
              result *= parseInt(now);
              break;
          }
          break;
      }
      pos++;
    }

    return result;
  }
};

assert.deepStrictEqual(compute("1 + 2 + 3 + 4"), 10);
assert.deepStrictEqual(compute("1 + 2 + (3 + 4)"), 10);
assert.deepStrictEqual(compute("1 * 2 + (3 + 4)"), 9);
assert.deepStrictEqual(compute("1 + 2 + (3 + 4 + (5 + 6))"), 21);
assert.deepStrictEqual(
  compute("5 * 9 * (7 * 3 * 3 + 9 * 3 + (8 + 6 * 4))"),
  12240
);

assert.deepStrictEqual(compute("1 + 2 * 3 + 4"), 13);
assert.deepStrictEqual(compute("1 + 2 + 3 * 4 + 5", true), 54);
assert.deepStrictEqual(compute("1 + 2 + (3 * 4) + 5", true), 20);

const sumOfLines = (data, v2) => {
  return data.reduce((acc, line) => acc + compute(line, v2), 0);
};

console.log("First Answer", sumOfLines(data));
console.log("Second Answer", sumOfLines(data, true));
