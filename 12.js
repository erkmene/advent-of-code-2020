const fs = require("fs");
const assert = require("assert");

const parseData = (str) => {
  return str
    .trim()
    .split("\n")
    .map((line) => [line.substr(0, 1), parseInt(line.substr(1))]);
};

const testData = parseData(fs.readFileSync("12.test.dat").toString());
const data = parseData(fs.readFileSync("12.dat").toString());

const turn = (prevDir, degrees) => {
  const dirs = ["E", "S", "W", "N"];
  const quadrants = Math.floor(degrees / 90);
  const prevIndex = dirs.indexOf(prevDir);
  let newIndex = (prevIndex + quadrants) % dirs.length;
  if (newIndex < 0) newIndex = dirs.length + newIndex;
  return dirs[newIndex];
};

assert(turn("N", 180) === "S");
assert(turn("N", -180) === "S");
assert(turn("N", -90) === "W");
assert(turn("W", 90) === "N");

const getVector = (dir, mag = 1) => {
  const vectors = {
    E: [1, 0],
    S: [0, -1],
    W: [-1, 0],
    N: [0, 1],
  };
  return vectors[dir].map((m) => m * mag);
};

assert(getVector("N")[0] === 0 && getVector("N")[1] === 1);
assert(getVector("N", 2)[0] === 0 && getVector("N", 2)[1] === 2);

const move = (oldPos, v, mag) => {
  return [oldPos[0] + v[0] * mag, oldPos[1] + v[1] * mag];
};

assert(move([17, -8], [-1, 0], 1).reduce((a, n) => a * n, 1) === 16 * -8);

const navigate = (data) => {
  let facing = "E";
  let faceVector = getVector(facing);
  let pos = [0, 0];

  for (let i = 0; i < data.length; i++) {
    const [ins, arg] = data[i];
    switch (ins) {
      case "N":
      case "E":
      case "S":
      case "W":
        const insVector = getVector(ins);
        pos = move(pos, insVector, arg);
        break;
      case "L":
      case "R":
        facing = turn(facing, arg * (ins === "L" ? -1 : 1));
        faceVector = getVector(facing);
        break;
      case "F":
        pos = move(pos, faceVector, arg);
        break;
    }
  }

  return { pos, md: Math.abs(pos[0]) + Math.abs(pos[1]) };
};

const rotateVector = (vector, deg) => {
  const rad = (deg * Math.PI) / 180;
  return [
    Math.round(vector[0] * Math.cos(-rad) - vector[1] * Math.sin(-rad)),
    Math.round(vector[0] * Math.sin(-rad) + vector[1] * Math.cos(-rad)),
  ];
};

assert.deepStrictEqual(rotateVector([10, 4], 90), [4, -10]);
assert.deepStrictEqual(rotateVector([4, -10], -90), [10, 4]);
assert.deepStrictEqual(rotateVector([10, 4], 180), [-10, -4]);

const navigateWithWaypoints = (data) => {
  let pos = [0, 0];
  let waypoint = [10, 1];

  for (let i = 0; i < data.length; i++) {
    const [ins, arg] = data[i];
    switch (ins) {
      case "N":
      case "E":
      case "S":
      case "W":
        const insVector = getVector(ins);
        waypoint = move(waypoint, insVector, arg);
        break;
      case "L":
      case "R":
        waypoint = rotateVector(waypoint, arg * (ins === "L" ? -1 : 1));
        break;
      case "F":
        pos = move(pos, waypoint, arg);
        break;
    }
  }

  return { pos, md: Math.abs(pos[0]) + Math.abs(pos[1]) };
};

assert.strictEqual(navigate(testData).md, 25);
assert.strictEqual(navigateWithWaypoints(testData).md, 286);

console.log("First Answer", navigate(data).md);
console.log("Second Answer", navigateWithWaypoints(data).md);
