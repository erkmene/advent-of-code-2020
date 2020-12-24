const assert = require("assert");

class Item {
  next;
  prev;
  value;
  constructor(value) {
    this.value = value;
  }
}

class CircularLinkedList {
  list = new Map();
  keys = [];
  first;

  constructor(array) {
    let prevItem;
    this.first = array[0];
    array.forEach((val) => {
      const item = new Item(val);
      if (prevItem) {
        item.prev = prevItem;
        prevItem.next = item;
      }
      prevItem = item;
      this.list.set(val, item);
      this.keys.push(val);
    });
    this.list.get(array[0]).prev = this.list.get(array[array.length - 1]);
    this.list.get(array[array.length - 1]).next = this.list.get(array[0]);
    this.keys.sort((a, b) => a - b);
  }

  cutAfter(val, count) {
    let i = 0;
    let acc = [];
    let next;
    const start = this.list.get(val);
    val = start.next.value;
    while (i < count) {
      next = this.list.get(val);
      acc.push(next);
      val = next.next.value;
      i++;
    }
    const end = this.list.get(val);
    start.next = end;
    end.prev = start;
    return acc;
  }

  putAfter(item, arr) {
    const oldNext = item.next;
    item.next = arr[0];
    arr[0].prev = item;
    arr[arr.length - 1].next = oldNext;
    oldNext.prev = arr[arr.length - 1];
  }

  get(val) {
    return this.list.get(val);
  }

  getPreviousByValueExcluding(val, array) {
    const valArray = array.map((item) => item.value);
    while (true) {
      val--;
      if (val <= 0) {
        val = this.keys[this.keys.length - 1];
      }
      if (!valArray.includes(val)) {
        return this.list.get(val);
      }
    }
  }

  getValuesFrom(val) {
    const acc = [];
    const start = this.list.get(val);
    let next = start;
    let bailout = 10;
    while ((acc.length === 0 || next != start) && bailout > 0) {
      acc.push(next.value);
      next = next.next;
      bailout--;
    }
    return acc;
  }

  log(first = null, delimiter = ".") {
    if (!first) first = this.first;
    return this.getValuesFrom(first).join(delimiter);
  }
}

class Game {
  arr;
  currentCup;

  constructor(array) {
    this.arr = array;
    this.ring = new CircularLinkedList(this.arr);
    this.currentCup = this.arr[0];
  }

  playRound() {
    const taken = this.ring.cutAfter(this.currentCup, 3);
    const dest = this.ring.getPreviousByValueExcluding(this.currentCup, taken);
    this.ring.putAfter(dest, taken);
    this.currentCup = this.ring.get(this.currentCup).next.value;
  }

  play(count) {
    for (let i = 0; i < count; i++) {
      this.playRound();
    }
  }

  playAndGetOrder(count) {
    this.play(count);
    return this.ring.log(1, "").slice(1);
  }

  playAndGetProductOfTwoCupsAfter(after, count) {
    this.play(count);
    after = this.ring.get(after);
    return BigInt(after.next.value) * BigInt(after.next.next.value);
  }
}

let testData = new Game("389125467".split("").map((i) => parseInt(i)));
let data = new Game("952438716".split("").map((i) => parseInt(i)));

assert.strictEqual(testData.playAndGetOrder(10), "92658374");

console.log("First Answer", testData.playAndGetOrder(100));

const millionTestArray = "389125467".split("").map((i) => parseInt(i));
const millionArray = "952438716".split("").map((i) => parseInt(i));

for (let i = 10; i <= 1000000; i++) {
  millionTestArray.push(i);
  millionArray.push(i);
}

const millionTestData = new Game(millionTestArray);
const millionData = new Game(millionArray);

console.log(
  "Second Answer",
  millionData.playAndGetProductOfTwoCupsAfter(1, 10000000)
);
