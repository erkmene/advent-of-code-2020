const assert = require("assert");

const getLoopCount = (publicKey, subjectNumber) => {
  let i = BigInt(0);
  let val = 1;
  while (true) {
    i++;
    val = (val * subjectNumber) % 20201227;
    if (val === publicKey) {
      return i;
    }
    if (i % BigInt(1000000) === 0) console.log("Loop", i);
  }
};

testData = [5764801, 17807724];
data = [3469259, 13170438];

const handshake = (data, subjectNumber) => {
  loopCounts = [];
  data.forEach((publicKey) => {
    loopCounts.push(getLoopCount(publicKey, subjectNumber));
  });
  let val = 1;
  for (let i = 0; i < loopCounts[1]; i++) {
    val = (val * data[0]) % 20201227;
  }
  return val;
};

assert.strictEqual(handshake(testData, 7), 14897079);
console.log("First Answer:", handshake(data, 7));
