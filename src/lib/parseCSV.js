import {concat,Observable} from 'rxjs';
// import csvParse from 'csv-parse/lib/sync';
import csvParse from 'csv-parse';
import {rxToStream} from 'rxjs-stream';
import {bufferCount,filter,map,mergeMap,scan,tap} from 'rxjs/operators';

// see https://csv.js.org/parse/options/
const defaultOptions = {
  // rowDelimiter: '\n',
  // columnDelimiter: ',',
  bufferInput: true,
  bufferArgs: [20],
  bufferOperator: bufferCount,
  parserOptions: {
    columns: true,
    cast: true,
    cast_date: false,
  },
};

// IDEA: EAsier approach. Convert it to a readable stream.
// Feed it to csvParse
// Then put the output into an RxJS observable.
// const parse = function parse(options = {}) {
//   const config = {...defaultOptions, ...options};
//   return csvStr$ => csvStr$.pipe(
//     // combine string fragments to form complete rows of CSV
//     scan(([, lastChunk], fileChunk) =>
//      `${lastChunk}${fileChunk}`.split(config.rowDelimiter)
//     , ['', '']),
//     tap(console.log),
//     scan(([,index, keys], [row]) => [
//       row,
//       index + 1,
//       (
//         index === -1
//         ? row.split(config.columnDelimiter)
//         : keys
//       )
//     ], [null, -1, null]),
//     filter(([,index]) => index > 0),
//     // tap(console.log),
//     map(([csvRow, index, keys]) => csvParse(
//       csvRow,
//       {columns: keys, ...config.parserOptions}
//     )),
//     mergeMap(rows => concat(...rows.map(r => of(r))))
//  );
// };

const parse = function parse(options = {}) {
  const config = {...defaultOptions, ...options};
  return csvStr$ => {
    const row$ = new Observable(obs => {
      let bufferedCSV$, rs;
      try {
        bufferedCSV$ = (
          config.bufferInput
          ? csvStr$.pipe(
            config.bufferOperator(...config.bufferArgs),
            map(strings => strings.reduce((acc, str) => `${acc}${str}`, ''))
          )
          : csvStr$
        );
        rs = rxToStream(bufferedCSV$);
      } catch (e) {
        return obs.error(e);
      }

      // https://csv.js.org/parse/recipies/stream_pipe/
      const parser = csvParse(config.parserOptions);
      // parser.on('readable', () => {
      //   let record;
      //   while (record = parser.read()) {
      //     obs.next(record)
      //   }
      // });
      // parser.on('error', err => obs.error(err))
      // parser.on('end', () => obs.complete());
      rs.pipe(parser)
        .on('data', row => obs.next(row))
        .on('error', err => obs.error(err))
        .on('end', () => obs.complete());
    });
    return row$;
  };
}

export default parse;
