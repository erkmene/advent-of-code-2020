const fs = require('fs');
const assert = require('assert');

const testInput = `..##.......
#...#...#..
.#....#..#.
..#.#...#.#
.#...##..#.
..#.##.....
.#.#.#....#
.#........#
#.##...#...
#...##....#
.#..#...#.#`;

const parseLine = (line) => {
  return line.split('').map(char => char === '.' ? 0 : 1);
}

const parseData = (str) => {
  return str.
    trim().
    split("\n").
    map(line => parseLine(line));
}

const testData = parseData(testInput);

const data = parseData(
  fs.readFileSync('3.dat').toString()
);

const traverseAndCountTrees = (map, vx, vy) => {
  let x = 0, y = 0;
  let treeCount = 0;
  const width = map[0].length;
  while (y < map.length) {
    if (map[y][x % width]) {
      treeCount++;
    }
    x += vx;
    y += vy;
  }
  return treeCount;
}

const productOfSlopes = (data, slopes) => {
  return slopes.reduce((prev, next) => {
    return prev * traverseAndCountTrees(data, next[0], next[1])
  }, 1);
}

const slopes = [
  [1,1],
  [3,1],
  [5,1],
  [7,1],
  [1,2],
]

assert(traverseAndCountTrees(testData, 1, 1) === 2);
assert(traverseAndCountTrees(testData, 3, 1) === 7);
assert(traverseAndCountTrees(testData, 5, 1) === 3);
assert(traverseAndCountTrees(testData, 7, 1) === 4);
assert(traverseAndCountTrees(testData, 1, 2) === 2);
assert(productOfSlopes(testData, slopes) === 336);

console.log('First Answer:', traverseAndCountTrees(data, 3, 1));
console.log('Second Answer:', productOfSlopes(data, slopes));