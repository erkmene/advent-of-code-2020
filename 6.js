const fs = require('fs');
const assert = require('assert');

const parseData = (str) => {
  return str.
    trim().
    split("\n\n").
    map((group) => {
      return group.split("\n").
        map((person) =>
          person.split('')
        )
    });
}

const testData = parseData(
  fs.readFileSync('6.test.dat').toString()
);

const data = parseData(
  fs.readFileSync('6.dat').toString()
);

const getAnswerHistogramForGroup = (group) => {
  const groupAnswers = {};
  group.forEach((person) => {
    person.forEach((answer) => {
      if (!groupAnswers[answer]) {
        groupAnswers[answer] = 0;
      }
      groupAnswers[answer]++;
    });
  });
  return groupAnswers;
}

const getUniqueAnswerCountForGroup = (group) => {
  const histogram = getAnswerHistogramForGroup(group);
  return Object.keys(histogram).length;
}

const countUniqueAnswers = (data) => {
  return data.reduce((prevCount, nextGroup) => {
    return prevCount + getUniqueAnswerCountForGroup(nextGroup);
  }, 0);
}

const getCommonAnswerCountForGroup = (group) => {
  const histogram = getAnswerHistogramForGroup(group);
  let commonCount = 0;
  for (let answer in histogram) {
    if (histogram[answer] === group.length) {
      commonCount++;
    }
  }
  return commonCount;
}

const countCommonAnswers = (data) => {
  return data.reduce((prevCount, nextGroup) => {
    return prevCount + getCommonAnswerCountForGroup(nextGroup);
  }, 0);
}

assert(getUniqueAnswerCountForGroup(testData[0]) === 3);
assert(getUniqueAnswerCountForGroup(testData[1]) === 3);
assert(getUniqueAnswerCountForGroup(testData[2]) === 3);
assert(getUniqueAnswerCountForGroup(testData[3]) === 1);
assert(getUniqueAnswerCountForGroup(testData[4]) === 1);
assert(countUniqueAnswers(testData) === 11)

assert(getCommonAnswerCountForGroup(testData[0]) === 3);
assert(getCommonAnswerCountForGroup(testData[1]) === 0);
assert(getCommonAnswerCountForGroup(testData[2]) === 1);
assert(getCommonAnswerCountForGroup(testData[3]) === 1);
assert(getCommonAnswerCountForGroup(testData[4]) === 1);
assert(countCommonAnswers(testData) === 6)

console.log('First Answer:', countUniqueAnswers(data))
console.log('Second Answer:', countCommonAnswers(data))