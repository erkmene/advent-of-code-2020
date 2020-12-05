const fs = require('fs');
const assert = require('assert');

const parseData = (str) => {
  return str.
    trim().
    split("\n");
}

const data = parseData(
  fs.readFileSync('5.dat').toString()
);

const ROWS = 128;
const COLS = 8;

const binaryPart = (min, max, dir) => {
  const pos = (max - min) / 2;
  if (dir > 0) {
    min = min + pos;
  } else {
    max = max - pos;
  }
  return [min, max];
}

const navigate = (dir, row, col, ROW_MAX, COL_MAX) => {

}

const findSeatId = (pass) => {
  const dirs = pass.split('');
  let [rowMin, rowMax] = [0, ROWS];
  let [colMin, colMax] = [0, COLS];
  for (dir of dirs) {
    switch (dir) {
      case 'F':
        [rowMin, rowMax] = binaryPart(rowMin, rowMax, -1);
        break;
      case 'B':
        [rowMin, rowMax] = binaryPart(rowMin, rowMax, 1);
        break;
      case 'L':
        [colMin, colMax] = binaryPart(colMin, colMax, -1);
        break;
      case 'R':
        [colMin, colMax] = binaryPart(colMin, colMax, 1);
        break;
    }
  }

  return (rowMin * 8) + colMin;
}

const findMaxSeatId = (data) => {
  let max = 0;
  data.forEach(pass => {
    max = Math.max(max, findSeatId(pass));
  });
  return max;
}

const findAllFilledSeats = (data) => {
  const seats = [];
  data.forEach(pass => {
    seats.push(findSeatId(pass));
  });
  return seats;
}

const maxSeatId = findMaxSeatId(data);

assert(findSeatId('FBFBBFFRLR') === (44 * 8) + 5);
assert(findSeatId('BFFFBBFRRR') === 567);
assert(findSeatId('FFFBBBFRRR') === 119);
assert(findSeatId('BBFFBBFRLL') === 820);

console.log('First Answer:', maxSeatId);

const filledSeats = findAllFilledSeats(data);
const freeSeats = [];
for (let i = 0; i < maxSeatId + 1; i++) {
  if (!filledSeats.includes(i)) {
    freeSeats.push(i);
  }
}

console.log(freeSeats)
