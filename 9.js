const fs = require("fs");
const assert = require("assert");

const parseData = (str) => {
  return str
    .trim()
    .split("\n")
    .map((line) => parseInt(line));
};

const testData0 = Array(25)
  .fill()
  .map((v, i) => i + 1);
const testData = parseData(fs.readFileSync("9.test.dat").toString());
const data = parseData(fs.readFileSync("9.dat").toString());

// From 1st day...
const arraySum = (array) => array.reduce((prev, next) => prev + next, 0);
const getValidTuples = (data, tupleCount, targetSum, tuples = []) => {
  const currentSum = arraySum(tuples);
  for (let i = 0; i < data.length; i++) {
    const num = data[i];
    // With this 1 change to prevent adding numbers to themselves
    if (tuples.includes(num)) return;
    if (currentSum + num > targetSum) {
      continue;
    } else if (currentSum + num < targetSum && tuples.length < tupleCount) {
      const next = getValidTuples(data, tupleCount - 1, targetSum, [
        ...tuples,
        num,
      ]);
      if (next) {
        return next;
      }
    } else if (currentSum + num === targetSum && tupleCount === 1) {
      return [...tuples, num];
    }
  }
};

const checkForFirstIllegalSum = (data, preambleLength) => {
  for (let i = 0; i < data.length - preambleLength; i++) {
    const preamble = data.slice(i, i + preambleLength);
    const currentTarget = data[i + preambleLength];
    const tuples = getValidTuples(preamble, 2, currentTarget);
    if (!tuples) {
      return currentTarget;
    }
  }
};

const sliceSum = (data, start, end) => arraySum(data.slice(start, end + 1));
assert(sliceSum([10, 20, 30, 40], 1, 2) === 50);

const findContiguousSumForTarget = (data, targetNumber) => {
  for (let start = 0; start < data.length - 1; start++) {
    let end = start + 1;
    let numbers = [];
    while (end < data.length) {
      let sum = sliceSum(data, start, end);
      if (sum === targetNumber) {
        return data.slice(start, end + 1);
      }
      end++;
    }
  }
};

const calculateWeakness = (data, targetNumber) => {
  const sum = findContiguousSumForTarget(data, targetNumber);
  sum.sort();
  return sum[0] + sum[sum.length - 1];
};

assert(getValidTuples(testData0, 2, 26).length === 2);
assert(getValidTuples(testData0, 2, 49).length === 2);
assert(!getValidTuples(testData0, 2, 100));
assert(!getValidTuples(testData0, 2, 50));

assert(checkForFirstIllegalSum(testData, 5) === 127);

const testContiguousSum = findContiguousSumForTarget(testData, 127);
assert(testContiguousSum[0] === 15);
assert(testContiguousSum[1] === 25);
assert(testContiguousSum[2] === 47);
assert(testContiguousSum[3] === 40);
assert(calculateWeakness(testData, 127) === 62);

const firstAnswer = checkForFirstIllegalSum(data, 25);
console.log("First Answer ", firstAnswer);

console.log("Second Answer ", calculateWeakness(data, firstAnswer));
