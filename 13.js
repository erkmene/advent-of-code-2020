const fs = require("fs");
const assert = require("assert");

const parseData = (str) => {
  let [after, ids] = str.split("\n");
  ids = ids.split(",").map((id) => parseInt(id));
  return { after, ids };
};

const testData = parseData(fs.readFileSync("13.test.dat").toString());
const data = parseData(fs.readFileSync("13.dat").toString());

const findEarliestDeparture = ({ after, ids }) => {
  let now = after;
  const filteredIds = ids.filter((id) => !isNaN(id));
  while (true) {
    for (let i = 0; i < filteredIds.length; i++) {
      const id = filteredIds[i];
      if (now % id === 0) {
        return { id, now };
      }
    }
    now++;
  }
};

assert.deepStrictEqual(findEarliestDeparture(testData), { id: 59, now: 944 });

const productOfDepartureAndId = (data) => {
  const dep = findEarliestDeparture(data);
  return (dep.now - data.after) * dep.id;
};

assert.strictEqual(productOfDepartureAndId(testData), 295);

const checkDepartureOnOffset = (timestamp, id, offset) => {
  const rem = (timestamp + offset) % id;
  return !rem;
};

assert.strictEqual(checkDepartureOnOffset(1068781, 7, 0), true);
assert.strictEqual(checkDepartureOnOffset(1068781, 13, 1), true);
assert.strictEqual(checkDepartureOnOffset(1068782, 13, 1), false);
assert.strictEqual(checkDepartureOnOffset(1068781, 59, 4), true);

// (p * x) % m = 1
const invModNaive = (p, m) => {
  p = BigInt(p);
  m = BigInt(m);
  p = p % m;
  for (let x = BigInt(1); x < m; x++) {
    if ((p * x) % m == 1) {
      return x;
    }
  }
};

assert.strictEqual(invModNaive(20, 3), BigInt(2));
assert.strictEqual(invModNaive(15, 4), BigInt(3));
assert.strictEqual(invModNaive(12, 5), BigInt(3));

const findEarliestTimestampForSubsequentDepartures = ({ ids }) => {
  const converted = [];
  ids.forEach((id, index) => {
    if (!isNaN(id)) {
      converted.push({
        prime: BigInt(id),
        remainder: BigInt(id) - BigInt(index),
      });
    }
  });

  // Chinese remainder theorem
  // https://www.youtube.com/watch?v=ru7mWZJlRQg
  // https://www.geeksforgeeks.org/chinese-remainder-theorem-set-2-implementation/
  let sum = BigInt(0);

  for (let i = 0; i < converted.length; i++) {
    const prime = converted[i].prime;
    const remainder = converted[i].remainder;
    const product = converted.reduce((acc, next, index) => {
      return index !== i ? acc * next.prime : acc;
    }, BigInt(1));
    const invMod = invModNaive(product, prime);

    sum += product * invMod * remainder;
  }

  const allProducts = converted.reduce(
    (acc, next) => acc * next.prime,
    BigInt(1)
  );

  return sum % allProducts;
};

assert.strictEqual(
  findEarliestTimestampForSubsequentDepartures(testData),
  BigInt(1068781)
);
assert.strictEqual(
  findEarliestTimestampForSubsequentDepartures({ ids: [67, 7, 59, 61] }),
  BigInt(754018)
);
assert.strictEqual(
  findEarliestTimestampForSubsequentDepartures({ ids: [17, NaN, 13, 19] }),
  BigInt(3417)
);
assert.strictEqual(
  findEarliestTimestampForSubsequentDepartures({ ids: [67, NaN, 7, 59, 61] }),
  BigInt(779210)
);
assert.strictEqual(
  findEarliestTimestampForSubsequentDepartures({ ids: [1789, 37, 47, 1889] }),
  BigInt(1202161486)
);

console.log("First Answer", productOfDepartureAndId(data));
console.log(
  "Second Answer",
  findEarliestTimestampForSubsequentDepartures(data).toString()
);

// Still don't know where exactly it happens but not using BigInt calculates the
// result as 905694340256579
