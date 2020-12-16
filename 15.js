const fs = require("fs");
const assert = require("assert");

const parseData = (data) => data.split(",").map((i) => parseInt(i));
const data = parseData("11,18,0,20,1,7,16");

const countUntilSlowest = (data, limit) => {
  const counted = [...data, 0];

  for (let i = counted.length; i < limit; i++) {
    if (i % 10000 === 0) console.log("", i);
    const lastSpokenIndex = i - 1;
    const lastSpoken = counted[lastSpokenIndex];
    const spokenUntilLastSpoken = counted.slice(0, lastSpokenIndex);
    const lastSpokenBeforeIndex = spokenUntilLastSpoken.lastIndexOf(lastSpoken);

    if (lastSpokenBeforeIndex > -1) {
      counted.push(i - lastSpokenBeforeIndex - 1);
    } else {
      counted.push(0);
    }
  }
  return counted[limit - 1];
};

const countUntilSlow = (data, limit) => {
  const cache = data.reduce((acc, nextSpoken, index) => {
    if (!acc[nextSpoken]) {
      acc[nextSpoken] = [];
    }
    acc[nextSpoken].push(index);
    return acc;
  }, {});

  let lastSpoken = data[data.length - 1];

  for (let i = data.length; i < limit; i++) {
    if (i % 500000 === 0)
      console.log(
        parseInt((i / limit) * 100) + "%",
        "Cache count:",
        Object.keys(cache).length
      );
    const lastCacheHit = cache[lastSpoken];
    if (lastCacheHit) {
      if (lastCacheHit.length > 1) {
        lastSpoken = i - 1 - cache[lastSpoken][cache[lastSpoken].length - 2];
      } else {
        lastSpoken = 0;
      }
    } else {
      cache[lastSpoken] = [i];
      lastSpoken = 0;
    }
    if (!cache[lastSpoken]) {
      cache[lastSpoken] = [i];
    }
    cache[lastSpoken].push(i);
    cache[lastSpoken] = cache[lastSpoken].slice(-2);
  }

  return lastSpoken;
};

const countUntil = (data, limit) => {
  const cache = new Map();
  let turn = 1;
  let lastSpoken;

  data.forEach((num) => {
    cache.set(num, turn);
    lastSpoken = num;
    turn++;
  });

  while (turn <= limit) {
    if (turn % 500000 === 0)
      console.log(
        parseInt((turn / limit) * 100) + "%",
        "Cache count:",
        cache.size
      );
    let newSpoken = 0;
    if (cache.has(lastSpoken)) {
      newSpoken = turn - 1 - cache.get(lastSpoken);
    }
    cache.set(lastSpoken, turn - 1);
    lastSpoken = newSpoken;
    turn++;
  }

  return lastSpoken;
};

assert.strictEqual(countUntilSlow(parseData("0,3,6"), 2020), 436);
assert.strictEqual(countUntilSlow(parseData("1,3,2"), 2020), 1);
assert.strictEqual(countUntilSlow(parseData("1,2,3"), 2020), 27);
assert.strictEqual(countUntilSlow(parseData("2,3,1"), 2020), 78);
assert.strictEqual(countUntilSlow(parseData("3,2,1"), 2020), 438);
assert.strictEqual(countUntilSlow(parseData("3,1,2"), 2020), 1836);

assert.strictEqual(countUntil(parseData("0,3,6"), 2020), 436);
assert.strictEqual(countUntil(parseData("1,3,2"), 2020), 1);
assert.strictEqual(countUntil(parseData("1,2,3"), 2020), 27);
assert.strictEqual(countUntil(parseData("2,3,1"), 2020), 78);
assert.strictEqual(countUntil(parseData("3,2,1"), 2020), 438);
assert.strictEqual(countUntil(parseData("3,1,2"), 2020), 1836);

console.log("First Answer:", countUntil(data, 2020));
console.log("Second Answer:", countUntil(data, 30000000));
