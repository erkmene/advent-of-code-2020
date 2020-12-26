const fs = require("fs");
const assert = require("assert");
const { isatty } = require("tty");

class Space {
  space = new Map();

  constructor(str, isHyper) {
    this.isHyper = isHyper;
    const w = this.isHyper ? 0 : null;
    const z = 0;
    const lines = str.split("\n");
    lines.forEach((line, y) => {
      line.split("").forEach((char, x) => {
        if (char === "#") this.space.set(this.getKey(w, z, y, x), 1);
      });
    });
  }

  getKey(w, z, y, x) {
    if (w === null || w === undefined) {
      return `${z}:${y}:${x}`;
    } else {
      return `${w}:${z}:${y}:${x}`;
    }
  }

  getActiveKeys() {
    return Array.from(this.space.keys());
  }

  getNeighborPositions(w, z, y, x) {
    const neighbors = [];
    for (let zi = z - 1; zi <= z + 1; zi++) {
      for (let yi = y - 1; yi <= y + 1; yi++) {
        for (let xi = x - 1; xi <= x + 1; xi++) {
          if (this.isHyper) {
            for (let wi = w - 1; wi <= w + 1; wi++) {
              const pos = this.getKey(wi, zi, yi, xi);
              if (wi !== w || zi !== z || yi !== y || xi !== x) {
                neighbors.push(pos);
              }
            }
          } else {
            const pos = this.getKey(w, zi, yi, xi);
            if (zi !== z || yi !== y || xi !== x) {
              neighbors.push(pos);
            }
          }
        }
      }
    }
    return neighbors;
  }

  getNextGenerationForCellAtKey(key, neighbors, snapshot) {
    const isActive = !!snapshot.get(key);
    const count = neighbors.reduce((count, nextNeighbor) => {
      const cell = snapshot.get(nextNeighbor);
      return count + (cell ? 1 : 0);
    }, 0);
    const newState =
      (isActive && (count === 2 || count === 3)) || (!isActive && count === 3);
    return newState;
  }

  nextGenerationForKey(key, snapshot) {
    let w, z, y, x;
    if (this.isHyper) {
      [w, z, y, x] = key.split(":").map((i) => parseInt(i));
    } else {
      [z, y, x] = key.split(":").map((i) => parseInt(i));
    }
    const neighbors = this.getNeighborPositions(w, z, y, x);
    const next = this.getNextGenerationForCellAtKey(key, neighbors, snapshot);
    if (next) {
      this.space.set(key, 1);
    } else {
      this.space.delete(key);
    }
    return neighbors;
  }

  nextGeneration(snapshot) {
    if (!snapshot) snapshot = new Map(this.space);
    const keys = this.getActiveKeys();
    let allNeighbors = new Set();
    keys.forEach((key) => {
      const neighbors = this.nextGenerationForKey(key, snapshot);
      allNeighbors = new Set([...allNeighbors, ...neighbors]);
    });
    allNeighbors.forEach((neighbor) => {
      this.nextGenerationForKey(neighbor, snapshot);
    });
  }

  getActiveCountAfterGeneration(count) {
    for (let i = 0; i < count; i++) {
      this.nextGeneration();
    }
    return Array.from(this.space.keys()).length;
  }
}

const testData = new Space(fs.readFileSync("17.test.dat").toString().trim());
const data = new Space(fs.readFileSync("17.dat").toString().trim());

assert.strictEqual(testData.getActiveCountAfterGeneration(6), 112);
console.log("First Answer", data.getActiveCountAfterGeneration(6));

const testDataHyper = new Space(
  fs.readFileSync("17.test.dat").toString().trim(),
  true
);
const dataHyper = new Space(fs.readFileSync("17.dat").toString().trim(), true);

assert.strictEqual(testDataHyper.getActiveCountAfterGeneration(6), 848);

console.log("Second Answer", dataHyper.getActiveCountAfterGeneration(6));
