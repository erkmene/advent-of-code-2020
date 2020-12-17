const fs = require("fs");
const assert = require("assert");

const parseData = (str) => {
  const sections = str.split("\n\n");
  const rules = sections[0].split("\n").reduce((acc, line) => {
    const regex = /(?<name>[a-z ]*): (?<min1>[0-9]*)-(?<max1>[0-9]*) or (?<min2>[0-9]*)-(?<max2>[0-9]*)/gm;
    const groups = regex.exec(line).groups;
    acc.set(groups.name, {
      ...groups,
      rules: [
        [groups.min1, groups.max1].map((i) => parseInt(i)),
        [groups.min2, groups.max2].map((i) => parseInt(i)),
      ],
    });
    return acc;
  }, new Map());
  const mine = sections[1]
    .split("\n")[1]
    .split(",")
    .map((i) => parseInt(i));
  const others = sections[2]
    .split("\n")
    .slice(1)
    .map((ticket) => ticket.split(",").map((i) => parseInt(i)));

  return {
    rules,
    mine,
    others,
  };
};

const testData = parseData(fs.readFileSync("16.test.dat").toString());
const testData1 = parseData(fs.readFileSync("16.test1.dat").toString());
const data = parseData(fs.readFileSync("16.dat").toString());

const generateSieve = (data) => {
  const sieve = new Map();
  data.rules.forEach((rule) => {
    rule.rules.forEach((r) => {
      for (let i = r[0]; i <= r[1]; i++) {
        if (!sieve.get(i)) {
          sieve.set(i, []);
        }
        sieve.set(i, [rule.name, ...sieve.get(i)]);
      }
    });
  });

  return sieve;
};

const sumInvalids = (data) => {
  const invalids = [];
  const sieve = generateSieve(data);
  data.others.forEach((ticket) => {
    ticket.forEach((field) => {
      if (!sieve.get(field)) {
        invalids.push(field);
      }
    });
  });
  return invalids.reduce((acc, inv) => acc + inv, 0);
};

assert.strictEqual(sumInvalids(testData), 71);

const filterInvalids = (data) => {
  const valids = [];
  const sieve = generateSieve(data);
  data.others.forEach((ticket) => {
    let invalid = false;
    ticket.forEach((field) => {
      if (!sieve.get(field)) {
        invalid = true;
      }
    });
    if (!invalid) valids.push(ticket);
  });
  return valids;
};

const intersect = (a, b) => a.filter((val) => b.includes(val));

const clearSingles = (candidates) => {
  candidates.forEach((c, i) => {
    if (c.length === 1) {
      candidates.forEach((c1, i1) => {
        if (i1 !== i) {
          if (candidates[i1].indexOf(c[0]) > -1) {
            candidates[i1].splice(candidates[i1].indexOf(c[0]), 1);
          }
        }
      });
    }
  });
  return candidates;
};

const identifyFields = (data) => {
  const sieve = generateSieve(data);
  let candidates = [];
  const names = [];
  data.rules.forEach((val, key) => {
    names.push(key);
  });
  const numFields = data.mine.length;
  for (let i = 0; i < numFields; i++) {
    candidates[i] = [...names];
  }

  const tickets = filterInvalids(data);

  tickets.forEach((ticket, ticketIndex) => {
    ticket.forEach((field, fieldIndex) => {
      const possible = sieve.get(field);
      candidates[fieldIndex] = intersect(candidates[fieldIndex], possible);
      candidates = clearSingles(candidates);
    });
  });

  return candidates;
};

assert.deepStrictEqual(
  identifyFields(testData1).reduce((acc, next) => [...acc, ...next], []),
  ["row", "class", "seat"]
);

console.log("First Answer:", sumInvalids(data));

console.log(
  "Second Answer:",
  identifyFields(data).reduce((acc, next, index) => {
    if (next[0].startsWith("departure")) {
      return acc * data.mine[index];
    } else {
      return acc;
    }
  }, 1)
);
