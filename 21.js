const fs = require("fs");
const assert = require("assert");
const inspect = require("util").inspect;
const { count } = require("console");
const { match } = require("assert");

const parseData = (str) => {
  return str.split("\n").map((line) => {
    const regex = /(?<ingredients>[a-z ]*) \(contains (?<allergens>[a-z, ]*)\)/gm;
    const { ingredients, allergens } = regex.exec(line).groups;
    return {
      ingredients: ingredients.split(" "),
      allergens: allergens.split(", "),
    };
  });
};

const testData = parseData(fs.readFileSync("21.test.dat").toString());
const data = parseData(fs.readFileSync("21.dat").toString());

const intersect = (a, b) => a.filter((val) => b.includes(val));
const diff = (a, b) => a.filter((val) => !b.includes(val));

const getIntersections = (data) => {
  const int = {};

  data.forEach((line) => {
    line.allergens.forEach((allergen) => {
      if (!int[allergen]) {
        int[allergen] = [...line.ingredients];
      }
      int[allergen] = intersect(int[allergen], line.ingredients);
    });
  });

  return int;
};

const getInerts = (data) => {
  const intersections = getIntersections(data);
  const ingredients = data.reduce((acc, nextLine) => {
    nextLine.ingredients.forEach((ingredient) => {
      if (!acc.includes(ingredient)) {
        acc.push(ingredient);
      }
    });
    return acc;
  }, []);

  let difference = [...ingredients];

  for (allergen in intersections) {
    difference = diff(difference, intersections[allergen]);
  }

  return difference;
};

const countInertIngredientOccurrences = (data) => {
  const inerts = getInerts(data);
  let sum = 0;

  data.forEach((recipe) => {
    sum += intersect(recipe.ingredients, inerts).length;
  });

  return sum;
};

const removeInerts = (data) => {
  const inerts = getInerts(data);
  return data.map((recipe) => {
    return {
      ingredients: diff(recipe.ingredients, inerts),
      allergens: recipe.allergens,
    };
  });
};

const clearSingles = (candidates) => {
  const keys = Object.keys(candidates);
  keys.forEach((key) => {
    const candidate = candidates[key];
    if (candidate.length === 1) {
      keys.forEach((innerKey) => {
        if (key !== innerKey) {
          candidates[innerKey] = diff(candidates[innerKey], candidate);
        }
      });
    }
  });
  return candidates;
};

assert.deepStrictEqual(clearSingles({ a: ["b", "c"], b: ["b"] }), {
  a: ["c"],
  b: ["b"],
});

const matchAllergens = (data) => {
  let candidates = {};
  data = removeInerts(data);
  data.forEach((recipe) => {
    recipe.allergens.forEach((allergen) => {
      if (!candidates[allergen]) {
        candidates[allergen] = [...recipe.ingredients];
      }
      candidates[allergen] = intersect(
        candidates[allergen],
        recipe.ingredients
      );
      candidates = clearSingles(candidates);
    });
  });
  return candidates;
};

const sortedConcatAllergenIngredients = (data) => {
  const allergens = matchAllergens(data);
  const keys = Object.keys(allergens);
  keys.sort();
  return keys
    .reduce((acc, nextKey) => [...acc, ...allergens[nextKey]], [])
    .join(",");
};

assert.strictEqual(countInertIngredientOccurrences(testData), 5);
assert.strictEqual(
  sortedConcatAllergenIngredients(testData),
  "mxmxvkd,sqjhc,fvjkl"
);
console.log("First Answer:", countInertIngredientOccurrences(data));
console.log("Second Answer:", sortedConcatAllergenIngredients(data));
