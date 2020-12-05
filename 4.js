const fs = require('fs');
const assert = require('assert');

const parseDefinition = (def) => {
  const passport = {}
  def.split("\n").join(' ').split(' ').forEach(element => {
    const [key, value] = element.split(':');
    passport[key] = value;
  });
  return passport;
}

const parseData = (str) => {
  return str.
    trim().
    split("\n\n").
    map(definition => parseDefinition(definition));
}

const testData = parseData(
  fs.readFileSync('4.test.dat').toString()
);

const validateField = (key, value, basic) => {
  if (key === 'cid') {
    return true;
  } else if (!value) {
    return false;
  } else if (basic) {
    return true;
  }

  switch (key) {
    case 'byr':
      value = parseInt(value);
      return value >= 1920 && value <= 2002;
    case 'iyr':
      value = parseInt(value);
      return value >= 2010 && value <= 2020;
    case 'eyr':
      value = parseInt(value);
      return value >= 2020 && value <= 2030;
    case 'hgt':
      const match = value.match(/(?<amount>[0-9]*)(?<unit>[a-z]*)/);
      if (!match) return false;
      const {amount, unit} = match.groups;
      if (unit === 'cm') {
        return amount >= 150 && amount <= 193;
      } else if (unit === 'in') {
        return amount >= 59 && amount <= 76;
      } else {
        return false
      }
    case 'hcl':
      return !!value.match(/\#[0-9a-f]{6}/);
    case 'ecl':
      return ['amb','blu','brn','gry','grn','hzl','oth'].includes(value);
    case 'pid':
      return !!value.match(/^[0-9]{9}$/m);
  };
}

const countValidPassports = (passports, basic) => {
  const fields = [
    'byr',
    'iyr',
    'eyr',
    'hgt',
    'hcl',
    'ecl',
    'pid',
    'cid',
  ];
  return passports.reduce((prevCount, nextPassport) => {
    const allValidation = fields.reduce((prevValidation, nextField) => {
      const fieldValidation = validateField(nextField, nextPassport[nextField], basic);
      // console.log(nextField, nextPassport[nextField], basic, fieldValidation)
      return prevValidation && fieldValidation;
    }, true);
    return prevCount + (allValidation ? 1 : 0);
  }, 0);
}

assert(countValidPassports(testData, true) === 2);

const data = parseData(
  fs.readFileSync('4.dat').toString()
);

console.log("First Answer:", countValidPassports(data, true));
assert(countValidPassports(data, true) === 200);

assert(validateField('byr', '2002') === true);
assert(validateField('byr', '2003') === false);

assert(validateField('hgt', '60in') === true);
assert(validateField('hgt', '190cm') === true);
assert(validateField('hgt', '190in') === false);
assert(validateField('hgt', '190') === false);

assert(validateField('hcl', '#123abc') === true);
assert(validateField('hcl' , '#123abz') === false);
assert(validateField('hcl', '123abc') === false);

assert(validateField('ecl', 'brn') === true);
assert(validateField('ecl', 'wat') === false);

assert(validateField('pid', '000000001') === true);
assert(validateField('pid', '0123456789') === false);

console.log("Second Answer:", countValidPassports(data));
