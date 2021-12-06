import get from 'lodash/get';
import { parse } from 'json2csv';
import { of } from 'rxjs';
import { map, mergeMap, scan } from 'rxjs/operators';

const defaultOptions = {
  parserOptions: {},
};

export const reorderObjectKeys = (keys, row) => keys.reduce((acc, key) => ({
  ...acc,
  [key]: get(row, `[${key}]`, null)
}), {});

export const reduceIndexAndColumnNames = () => (acc, row) => [
  acc[0] + 1,
  row,
  // get the column headings from the first object
  acc[0] === -1 ? Object.keys(row) : acc[2],
];

const toCSV = function toCSV(options = {}) {
  const config = {...defaultOptions, ...options};
  return object$ => object$.pipe(
    scan(reduceIndexAndColumnNames(), [-1, null, null]),
    map(([index, row, columnNames]) => [
      index,
      reorderObjectKeys(columnNames, row)
    ]),
    mergeMap(([index, row]) => (
      index === 0
      ? of(parse(row, config.parserOptions))
      : of(parse(row, {...config.parserOptions, header: false}))
    ))
  );
};

export default toCSV;
