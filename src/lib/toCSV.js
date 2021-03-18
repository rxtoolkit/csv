import { parse } from 'json2csv';
import { of } from 'rxjs';
import { mergeMap, scan } from 'rxjs/operators';

const defaultOptions = {
  parserOptions: {},
};

const toCSV = function toCSV(options = {}) {
  const config = {...defaultOptions, ...options};
  return object$ => object$.pipe(
     scan(([index], row) => [index + 1, row], [-1, null]),
     mergeMap(([index, row]) => (
       index === 0
       ? of(parse(row, config.parserOptions))
       : of(parse(row, {...config.parserOptions, header: false}))
     ))
  );
};

export default toCSV;
