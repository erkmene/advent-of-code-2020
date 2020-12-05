const fs = require('fs');
const assert = require('assert');

const lineRegex = /(?<pos1>[0-9]+)\-(?<pos2>[0-9]+) (?<char>[a-z]): (?<pass>[a-z]+)/;

const parseLine = (line) => {
  return line.match(lineRegex).groups;
}

const testData = [
  '1-3 a: abcde',
  '1-3 b: cdefg',
  '2-9 c: ccccccccc',
].map(line => parseLine(line));

const data = fs.
  readFileSync('2.dat').
  toString().
  trim().
  split("\n").
  map(line => parseLine(line));

const countChar = (char, str) => {
  let count = 0;
  for (let i = 0; i < str.length; i++) {
    if (str.charAt(i) === char) {
      count++
    }
  }
  return count;
}

const checkValidityForMinMax = (lineDef) => {
  const count = countChar(lineDef.char, lineDef.pass);
  return (count >= lineDef.pos1 && count <= lineDef.pos2);
}

const countValidsForMinMax = (lines) => {
  let validCount = 0;
  for (let i = 0; i < lines.length; i++) {
    if (checkValidityForMinMax(lines[i])) {
      validCount++;
    }
  }
  return validCount;
}

const checkValidityForPositions = (lineDef) => {
  return (lineDef.pass.charAt(lineDef.pos1 - 1) === lineDef.char) !==
    (lineDef.pass.charAt(lineDef.pos2 - 1) === lineDef.char);
}

const countValidsForPositions = (lines) => {
  let validCount = 0;
  for (let i = 0; i < lines.length; i++) {
    if (checkValidityForPositions(lines[i])) {
      validCount++;
    }
  }
  return validCount;
}

assert(countValidsForMinMax(testData) === 2);
assert(countValidsForPositions(testData) === 1);

console.log('First answer:', countValidsForMinMax(data));
console.log('Second answer:', countValidsForPositions(data));