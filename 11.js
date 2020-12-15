const fs = require("fs");
const assert = require("assert");

const parseData = (str) => {
  return str
    .trim()
    .split("\n")
    .map((line) => line.split(""));
};

const testData = parseData(fs.readFileSync("11.test.dat").toString());
const data = parseData(fs.readFileSync("11.dat").toString());

const serialize = (data) => {
  return data.reduce((acc, next) => {
    return acc + next.join("");
  }, "");
};

const adjacent = (data, row, col) => {
  const maxRows = data.length;
  const maxCols = data[0].length;
  const adjacents = [];
  for (let r = Math.max(row - 1, 0); r < Math.min(row + 2, maxRows); r++) {
    for (let c = Math.max(col - 1, 0); c < Math.min(col + 2, maxCols); c++) {
      if (r !== row || c !== col) {
        adjacents.push(data[r][c]);
      }
    }
  }
  return adjacents;
};

const countOccupied = (data) => {
  return serialize(data)
    .split("")
    .filter((char) => char === "#").length;
};

const countOccupiedInAdjacents = (data, row, col) => {
  const adjacents = adjacent(data, row, col);
  return adjacents.filter((s) => s === "#").length;
};

const cloneArray = (arr) => JSON.parse(JSON.stringify(arr));

const nextGeneration = (data) => {
  const nextGen = cloneArray(data);
  for (let row = 0; row < data.length; row++) {
    for (let col = 0; col < data[row].length; col++) {
      if (data[row][col] !== ".") {
        const oCount = countOccupiedInAdjacents(data, row, col);
        if (oCount === 0) {
          nextGen[row][col] = "#";
        } else if (oCount > 3) {
          nextGen[row][col] = "L";
        }
      }
    }
  }
  return nextGen;
};

const generateUntilStable = (data, raycast = false) => {
  let prevGen = [];
  let nextGen = data;
  while (serialize(prevGen) !== serialize(nextGen)) {
    prevGen = nextGen;
    if (raycast) {
      nextGen = nextGenerationWithRaycast(prevGen);
    } else {
      nextGen = nextGeneration(prevGen);
    }
  }
  return countOccupied(nextGen);
};

const raycast = (data, row, col, vy, vx) => {
  while (true) {
    row += vy;
    col += vx;
    if (row < 0 || col < 0 || row >= data.length || col >= data[0].length) {
      return ".";
    }
    const pos = data[row][col];
    if (pos !== ".") {
      return pos;
    }
  }
};

const raycastNeighbors = (data, row, col) => {
  const maxRows = data.length;
  const maxCols = data[0].length;
  const neighbors = [];
  for (let r = Math.max(row - 1, 0); r < Math.min(row + 2, maxRows); r++) {
    for (let c = Math.max(col - 1, 0); c < Math.min(col + 2, maxCols); c++) {
      if (r !== row || c !== col) {
        const result = raycast(data, row, col, r - row, c - col);
        neighbors.push(result);
      }
    }
  }
  return neighbors;
};

const countRaycastedOccupiedNeighbors = (data, row, col) => {
  const result = raycastNeighbors(data, row, col);
  return result.filter((char) => char === "#").length;
};

const nextGenerationWithRaycast = (data) => {
  const nextGen = cloneArray(data);
  for (let row = 0; row < data.length; row++) {
    for (let col = 0; col < data[row].length; col++) {
      if (data[row][col] !== ".") {
        const oCount = countRaycastedOccupiedNeighbors(data, row, col);
        if (oCount === 0) {
          nextGen[row][col] = "#";
        } else if (oCount > 4) {
          nextGen[row][col] = "L";
        }
      }
    }
  }
  return nextGen;
};

assert(
  serialize(testData) ===
    "L.LL.LL.LLLLLLLLL.LLL.L.L..L..LLLL.LL.LLL.LL.LL.LLL.LLLLL.LL..L.L.....LLLLLLLLLLL.LLLLLL.LL.LLLLL.LL"
);
assert(adjacent(testData, 0, 0).join("") === ".LL");
assert(adjacent(testData, 1, 1).join("") === "L.LLLL.L");

const testDataRayCast = `.............
.L.L.#.#.#.#.
.............`
  .split("\n")
  .map((line) => line.split(""));
assert(countRaycastedOccupiedNeighbors(testDataRayCast, 1, 1) === 0);
assert(countRaycastedOccupiedNeighbors(testDataRayCast, 1, 3) === 1);

console.log("First Answer", generateUntilStable(data));
console.log("Second Answer", generateUntilStable(data, true));
