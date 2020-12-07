const fs = require('fs');
const assert = require('assert');
const { count } = require('console');

const parseRule = (rule) => {
  const lineRegex = /(?<id>[a-z ]*) bag[s]? contain[s]? (?<definitions>.*)./gm;
  const {id, definitions} = lineRegex.exec(rule).groups;
  const definitionsRegex = /(?<count>[0-9]) (?<nextId>[a-z ]*) bag[s]?/gm;
  const list = {}
  definitions.split(', ').forEach(() => {
    let definition = definitionsRegex.exec(definitions);
    if (definition) {
      let {count, nextId} = definition.groups;
      list[nextId] = parseInt(count);
    }
  })
  return {[id]: {
    children: list
  }};
}

const attachParents = (rules) => {
  const nodeIds = Object.keys(rules);
  nodeIds.forEach((nodeId) => {
    rules[nodeId].parents = {};
    nodeIds.forEach((parentNodeId) => {
      if (parentNodeId !== nodeId) {
        const parentNodeChildren = rules[parentNodeId].children;
        if (parentNodeChildren[nodeId]) {
          rules[nodeId].parents[parentNodeId] = parentNodeChildren[nodeId];
        }
      }
    })
  })
  return rules;
}

const parseData = (str) => {
  let rules = {}
  str.
    trim().
    split("\n").
    map((rule) => parseRule(rule))
    .forEach((parsedRule) => {
      rules = Object.assign(rules, parsedRule)
    });
  return attachParents(rules);
}

const getUniqueAncestors = (id, rules, ancestors) => {
  if (!ancestors) {
    ancestors = new Set();
  }
  const node = rules[id];
  const parentIds = Object.keys(node.parents);
  if (parentIds.length > 0) {
    ancestors = new Set([...ancestors, ...parentIds]);
    parentIds.forEach((parentId) => {
      const parentAncestors = getUniqueAncestors(parentId, rules);
      ancestors = new Set([...ancestors, ...parentAncestors]);
    })
  }
  return ancestors;
}

const countUniqueAncestors = (id, rules) => {
  return getUniqueAncestors(id, rules).size;
}

const countChildrenWeight = (id, rules) => {
  let count = 0;
  const children = rules[id].children;
  const childKeys = Object.keys(children);
  childKeys.forEach((childKey) => {
    count += children[childKey]
    count += children[childKey] * countChildrenWeight(childKey, rules);
  })
  return count;
}

const testData = parseData(
  fs.readFileSync('7.test.dat').toString()
);

const data = parseData(
  fs.readFileSync('7.dat').toString()
);

assert(countUniqueAncestors('shiny gold', testData) === 4);
assert(countChildrenWeight('shiny gold', testData) === 32);

console.log('First Answer', countUniqueAncestors('shiny gold', data));
console.log('Second Answer', countChildrenWeight('shiny gold', data));