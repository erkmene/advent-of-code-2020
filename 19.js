const fs = require("fs");
const assert = require("assert");

const parseData = (str) => {
  const [ruleStrings, messages] = str.trim().split("\n\n");

  const rules = [];

  ruleStrings.split("\n").forEach((element) => {
    let [id, ruleStr] = element.split(": ");

    rules[parseInt(id)] = ruleStr.split(" | ").map((r) =>
      r.split(" ").map((i) => {
        switch (i) {
          case '"a"':
            return "a";
          case '"b"':
            return "b";
          default:
            return parseInt(i);
        }
      })
    );
  });

  rules.forEach((rule, key) => {
    while (Array.isArray(rule) && rule.length === 1) {
      rules[key] = rule[0];
      rule = rules[key];
    }
  });

  return { rules, messages: messages.split("\n") };
};

const testData = parseData(fs.readFileSync("19.test.dat").toString());
const testData1 = parseData(fs.readFileSync("19.test1.dat").toString());
const data = parseData(fs.readFileSync("19.dat").toString());

const hasArrayInside = (rule) =>
  rule.reduce((acc, innerRule) => {
    return acc || Array.isArray(innerRule);
  }, false);

const compileRegexString = (
  rules,
  current = rules[0],
  depth = 0,
  maxDepth = 100
) => {
  let out = "";
  if (depth >= maxDepth) return out;
  if (Array.isArray(current)) {
    const series = [];
    for (let i = 0; i < current.length; i++) {
      series.push(compileRegexString(rules, current[i], depth + 1, maxDepth));
    }
    if (hasArrayInside(current)) {
      out += "(" + series.join("|") + ")";
    } else {
      out += series.join("");
    }
  } else {
    switch (current) {
      case "a":
      case "b":
        out += current;
        break;
      default:
        out += compileRegexString(rules, rules[current], depth + 1, maxDepth);
        break;
    }
  }
  return out;
};

const getValidMessages = ({ rules, messages }) => {
  const regexString = compileRegexString(rules);
  const regex = new RegExp(regexString, "gi");
  return messages.filter((message) => {
    return message.replace(regex, "") === "";
  });
};

assert.deepStrictEqual(getValidMessages(testData), ["ababbb", "abbbab"]);
assert.deepStrictEqual(getValidMessages(testData1), [
  "bbabbbbaabaabba",
  "ababaaaaaabaaab",
  "ababaaaaabbbaba",
]);
console.log("First Answer", getValidMessages(data).length);

testData1.rules[8] = [42, [42, 8]];
testData1.rules[11] = [
  [42, 31],
  [42, 11, 31],
];

data.rules[8] = [42, [42, 8]];
data.rules[11] = [
  [42, 31],
  [42, 11, 31],
];

assert.deepStrictEqual(getValidMessages(testData), ["ababbb", "abbbab"]);
assert.deepStrictEqual(getValidMessages(testData1), [
  "bbabbbbaabaabba",
  "babbbbaabbbbbabbbbbbaabaaabaaa",
  "aaabbbbbbaaaabaababaabababbabaaabbababababaaa",
  "bbbbbbbaaaabbbbaaabbabaaa",
  "bbbababbbbaaaaaaaabbababaaababaabab",
  "ababaaaaaabaaab",
  "ababaaaaabbbaba",
  "baabbaaaabbaaaababbaababb",
  "abbbbabbbbaaaababbbbbbaaaababb",
  "aaaaabbaabaaaaababaa",
  "aaaabbaabbaaaaaaabbbabbbaaabbaabaaa",
  "aabbbbbaabbbaaaaaabbbbbababaaaaabbaaabba",
]);

console.log("Second Answer", getValidMessages(data).length);
