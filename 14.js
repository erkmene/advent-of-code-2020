const fs = require("fs");
const assert = require("assert");

const parseData = (str) => {
  return str.split("\n").map((line) => {
    const regex = /mem\[(?<addr>[0-9]*)\]/gm;
    let [ins, val] = line.split(" = ");
    if (ins !== "mask") {
      const addr = regex.exec(ins).groups.addr;
      ins = "mov";
      val = { addr, val };
    }
    return { ins, val };
  });
};

const testData = parseData(fs.readFileSync("14.test.dat").toString());
const testData1 = parseData(fs.readFileSync("14.test1.dat").toString());
const data = parseData(fs.readFileSync("14.dat").toString());

const setBit = (val, i, bit) => {
  val = BigInt(val);
  i = BigInt(i);
  bit = BigInt(bit);
  let m = ~(BigInt(1) << BigInt(i)); // create the mask to set that bit to zero
  val &= m; // set ith bit to zero
  val |= bit << i;
  return val;
};

assert.strictEqual(setBit(8, 0, 1), BigInt(9));
assert.strictEqual(setBit(8, 3, 0), BigInt(0));
assert.strictEqual(setBit(8, 3, 1), BigInt(8));
assert.strictEqual(setBit(8, 4, 1), BigInt(24));
assert.strictEqual(setBit(8, 4, 0), BigInt(8));

const getBit = (val, i) => {
  val = BigInt(val);
  i = BigInt(i);
  return (val >> i) % BigInt(2);
};

const applyMaskV1 = (val, maskStr) => {
  const mask = maskStr.split("");
  mask.forEach((bit, i) => {
    if (bit !== "X") {
      val = setBit(BigInt(val), mask.length - i - 1, BigInt(bit));
    }
  });
  return val;
};

assert.strictEqual(
  applyMaskV1(11, "XXXXXXXXXXXXXXXXXXXXXXXXXXXXX1XXXX0X"),
  BigInt(73)
);

const runProgramV1 = (data) => {
  let mask = "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";
  let mem = {};
  let i = 0;

  while (i < data.length) {
    const op = data[i];
    switch (op.ins) {
      case "mask":
        mask = op.val;
        break;
      case "mov":
        mem[op.val.addr] = applyMaskV1(BigInt(op.val.val), mask);
        break;
    }
    i++;
  }

  return Object.keys(mem).reduce((sum, nextAddress) => {
    return sum + mem[nextAddress];
  }, BigInt(0));
};

const padIntStr = (val, bitCount) => {
  for (let i = 0, l = bitCount - val.length; i < l; i++) {
    val = "0" + val;
  }
  return val;
};

const applyMaskV2 = (val, maskStr) => {
  const valBin = padIntStr(BigInt(val).toString(2), 36);
  const mask = padIntStr(maskStr, 36);
  const newAddress = [];

  for (let index = 0; index < mask.length; index++) {
    const bit = mask[index];

    switch (bit) {
      case "0":
        newAddress[index] = parseInt(valBin.charAt(index));
        break;
      case "1":
        newAddress[index] = 1;
        break;
      case "X":
        newAddress[index] = bit;
        break;
    }
  }

  const addresses = [newAddress];

  let remaining;
  while (true) {
    // if (addresses.length % 1000 === 0) console.log(addresses.length);
    remaining = addresses.filter((address) => address.indexOf("X") > -1);
    if (remaining.length === 0) break;
    const next = addresses.shift();
    const bitIndex = next.indexOf("X");
    for (let i = 0; i < 2; i++) {
      const copy = [...next];
      copy[bitIndex] = i;
      addresses.push(copy);
    }
  }

  return addresses.map((address) => {
    return address.reduce((acc, bit, i) => {
      return acc + (BigInt(bit) << BigInt(address.length - i - 1));
    }, BigInt(0));
  });
};

assert.deepStrictEqual(
  applyMaskV2(
    0b000000000000000000000000000000101010,
    "000000000000000000000000000000X1001X"
  ),
  [26, 27, 58, 59].map((i) => BigInt(i))
);
assert.deepStrictEqual(
  applyMaskV2(0b000100, "000XXX"),
  [0, 1, 2, 3, 4, 5, 6, 7].map((i) => BigInt(i))
);
assert.deepStrictEqual(
  applyMaskV2(0b100, "000XXX"),
  [0, 1, 2, 3, 4, 5, 6, 7].map((i) => BigInt(i))
);
assert.deepStrictEqual(
  applyMaskV2(0b100, "000XX1"),
  [1, 3, 5, 7].map((i) => BigInt(i))
);
assert.deepStrictEqual(
  applyMaskV2(0b100, "0000X1"),
  [5, 7].map((i) => BigInt(i))
);
assert.deepStrictEqual(
  applyMaskV2(0b000, "0000X1"),
  [1, 3].map((i) => BigInt(i))
);

const runProgramV2 = (data) => {
  let mask = "000000000000000000000000000000000000";
  let mem = {};
  let i = 0;

  while (i < data.length) {
    const op = data[i];
    switch (op.ins) {
      case "mask":
        mask = op.val;
        // console.log("mask", mask);
        break;
      case "mov":
        // console.log("mov", op, op.val.addr.toString(2));
        const addresses = applyMaskV2(op.val.addr, mask);
        // console.log(addresses);
        addresses.forEach((addr) => {
          mem[addr] = op.val.val;
        });
        break;
    }
    i++;
    // console.log("mem", mem);
  }

  return Object.keys(mem).reduce((sum, nextAddress) => {
    return sum + BigInt(mem[nextAddress]);
  }, BigInt(0));
};

assert.strictEqual(runProgramV1(testData), BigInt(165));
assert.strictEqual(runProgramV2(testData1), BigInt(208));

console.log("First Answer:", runProgramV1(data).toString());
console.log("Second Answer:", runProgramV2(data).toString());
