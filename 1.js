const fs = require('fs');
const assert = require('assert');

const testData = [1721,979,366,299,675,1456];
const data = fs.readFileSync('1.dat').toString().trim().split("\n").map(line => parseInt(line));

const arraySum = array => array.reduce((prev,next) => prev+next, 0);

const getValidTuples = (data, tupleCount, targetSum = 2020, tuples = []) => {
  const currentSum = arraySum(tuples);
  for (let i = 0; i < data.length; i++) {
    const num = data[i];
    if (currentSum + num > targetSum) {
      continue;
    } else if (
      currentSum + num < targetSum &&
      tuples.length < tupleCount
    ) {
      const next = getValidTuples(
        data,
        tupleCount - 1,
        targetSum,
        [...tuples, num]
      );
      if (next) {
        return next;
      }
    } else if (
      currentSum + num === targetSum &&
      tupleCount === 1
    ) {
      return [...tuples, num];
    }
  }
}

const calculateProductOfValidSums = (data, tupleCount) => {
  const tuples = getValidTuples(data, tupleCount);
  return tuples.reduce((prev, current) => prev * current, 1);
}

assert(
  calculateProductOfValidSums(testData, 2) === 514579
);

assert(
  calculateProductOfValidSums(testData, 3) === 241861950
);

assert(
  calculateProductOfValidSums(data, 2) === 1010299
);

console.log("First Answer:", calculateProductOfValidSums(data, 2));
console.log("Second Answer:", calculateProductOfValidSums(data, 3));
