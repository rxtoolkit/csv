import get from 'lodash/get';
import {concat,Observable} from 'rxjs';
// import csvParse from 'csv-parse/lib/sync';
import csvParse from 'csv-parse';
// import {rxToStream} from 'rxjs-stream';
import {throwError} from 'rxjs';
import {
  bufferCount,
  catchError,
  filter,
  map,
  mergeMap,
  scan,
  tap
} from 'rxjs/operators';

import {streamFromObservable} from '@rxtk/streams';

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

const parseStream = (bufferedCSV$, parser, obs) => new Promise((resolve, reject) => {
  try {
    const rs = streamFromObservable(bufferedCSV$);
    return rs.pipe(parser)
      .on('data', row => obs.next(row))
      .on('error', err => reject(err))
      .on('end', () => resolve());
  } catch (err) {
    return reject(err);
  }
});

const parse = (options = {}) => csvStr$ => {
  try {
    const config = {...defaultOptions, ...options};
    const row$ = new Observable(obs => {
      const bufferedCSV$ = (
        config.bufferInput
        ? csvStr$.pipe(
          config.bufferOperator(...config.bufferArgs),
          map(strings => strings.reduce((acc, str) => `${acc}${str}`, ''))
        )
        : csvStr$
      );
      const rs = streamFromObservable(bufferedCSV$);
      const parser = csvParse(get(config, 'parserOptions', {}));
      rs.on('error', err => obs.error(err));
      rs.pipe(parser)
        .on('error', err => {
          console.log('EMITTED ERROR');
          console.trace(err);
          obs.error(err);
        })
        .on('data', row => obs.next(row))
        .on('end', () => obs.complete());
    });
    return row$;
  } catch (err) {
    return throwError(err);
  }
};
  // const parser = csvParse(config.parserOptions);
  // const promise = parseStream(bufferedCSV$, parser, obs);
  // promise
  //   .then(() => obs.complete())
  //   .catch(err => obs.error(err));
  // rs.pipe(parser)
  //   .on('data', row => obs.next(row))
  //   .on('error', err => obs.error(err))
  //   .on('end', () => obs.complete());
  // https://csv.js.org/parse/recipies/stream_pipe/
  // parser.on('readable', () => {
  //   let record;
  //   while (record = parser.read()) {
  //     obs.next(record)
  //   }
  // });
  // parser.on('end', () => obs.complete());
  // parser.on('error', err => obs.error(err));
  //   try {
  //     (async function () {
  //       const parser = csvParse(config.parserOptions);
  //       const promise = parseStream(bufferedCSV$, parser, obs);
  //       promise
  //         .then(() => obs.complete())
  //         .catch(error => obs.error(error));
  //       return promise;
  //     })();
  //   } catch (err) {
  //     obs.error(err);
  //   }

export default parse;
