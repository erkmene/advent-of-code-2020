const fs = require("fs");
const assert = require("assert");

const parseData = (str) => {
  return str
    .trim()
    .split("\n")
    .map((line) => parseInt(line));
};

const testData0 = parseData(fs.readFileSync("10.test0.dat").toString());
const testData1 = parseData(fs.readFileSync("10.test1.dat").toString());
const data = parseData(fs.readFileSync("10.dat").toString());

const diffChain = (data) => {
  const sorted = [...data].sort((a, b) => a - b);
  const diffs = {};
  let now = 0;
  while (sorted.length > 0) {
    const next = sorted.shift();
    const diff = next - now;
    if (!diffs[diff]) {
      diffs[diff] = [];
    }
    diffs[diff].push(next);
    now = next;
  }
  // built in
  diffs[3].push(now + 3);
  return diffs;
};

const productOfDiffs = (data, p0, p1) => {
  const diff = diffChain(data);
  return diff[p0].length * diff[p1].length;
};

assert(productOfDiffs(testData0, 1, 3) === 7 * 5);
assert(productOfDiffs(testData1, 1, 3) === 22 * 10);

const traverseChainRecursive = (data) => {
  let sorted = [...data].sort((a, b) => a - b);
  sorted = [0, ...sorted, sorted[sorted.length - 1] + 3];

  let pathCount = 0;

  const memo = new Map();

  const traverse = (current, adapters) => {
    if (current === sorted[sorted.length - 1]) {
      return 1;
    }

    let count = 0;

    for (let i = 1; i <= 3; i++) {
      const next = current + i;
      if (adapters.includes(next)) {
        if (memo.get(next) === undefined) {
          const remaining = adapters.filter((adapter) => adapter > next);
          memo.set(next, traverse(next, remaining));
        }
        count += memo.get(next);
      }
    }

    return count;
  };

  return traverse(0, sorted);
};

console.log(traverseChainRecursive(testData1));

assert.strictEqual(traverseChainRecursive(testData0), 8);
assert.strictEqual(traverseChainRecursive(testData1), 19208);

console.log("First Answer", productOfDiffs(data, 1, 3));
console.log("Second Answer", traverseChainRecursive(data));
