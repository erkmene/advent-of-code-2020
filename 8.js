const fs = require("fs");
const assert = require("assert");

const parseRule = (rule) => {
  const lineRegex = /(?<op>[a-z]*) (?<sign>[+-])(?<argument>[0-9]*)/gm;
  const { op, sign, argument } = lineRegex.exec(rule).groups;
  let value = parseInt(argument);
  value = sign === "-" ? -value : value;
  return [op, value];
};

const parseData = (str) => {
  return str
    .trim()
    .split("\n")
    .map((rule) => parseRule(rule));
};

const testData = parseData(fs.readFileSync("8.test.dat").toString());
const data = parseData(fs.readFileSync("8.dat").toString());

const executeInstruction = (instruction, state) => {
  state.history.push(state.address);
  switch (instruction[0]) {
    case "acc":
      state.accumulator += instruction[1];
      state.address++;
      break;
    case "jmp":
      state.address += instruction[1];
      break;
    case "nop":
      state.address++;
      break;
  }
  return state;
};

const runProgram = (program) => {
  let state = {
    accumulator: 0,
    address: 0,
    history: [],
    terminates: false,
  };

  let newState;
  while (true) {
    const instruction = program[state.address];
    newState = executeInstruction(instruction, { ...state });
    if (newState.history.length > new Set(newState.history).size) {
      return state;
    } else if (newState.address >= program.length) {
      newState.terminates = true;
      return newState;
    }
    state = newState;
  }
};

const modifyProgramAndCheckIfTerminates = (program) => {
  for (let i = 0; i < program.length; i++) {
    const line = program[i];
    const newProgram = [...program];
    const oldOp = line[0];
    let newOp = line[0];
    if (oldOp === "nop") {
      newOp = "jmp";
    } else if (oldOp === "jmp") {
      newOp = "nop";
    }
    newProgram[i] = [newOp, line[1]];
    const output = runProgram(newProgram);
    if (output.terminates) {
      return output;
    }
  }
};

assert(runProgram(testData).accumulator === 5);
assert(modifyProgramAndCheckIfTerminates(testData).accumulator === 8);

console.log("First answer", runProgram(data).accumulator);
console.log(
  "Second answer",
  modifyProgramAndCheckIfTerminates(data).accumulator
);
