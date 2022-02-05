# @buccaneerai/rxjs-csv
> 🚰  RxJS operators for handling CSV data streams

> ☠️ Warning: Be careful about upgrading the version of csv-parse used in this package. csv-parse does not use proper semantic versioning.  For example upgrading it from 4.15 to 4.16 introduces breaking changes that will cause code that previously parsed CSV properly to no longer do so. Any such updates may require a major version change to this package.

## Installation
This is a private package. It requires setting up access in your npm config.

```bash
yarn add @buccaneerai/rxjs-csv
```

## API

### `toCSV`

```js
import {from} from 'rxjs';
import {toCSV} from '@buccaneer/rxjs-csv';

const pirate$ = from([
  {name: 'Blackbeard', systolicBp: 140, diastolicBp: 91, message: 'Yarr'},
  {name: 'Crunch', systolicBp: 120, diastolicBp: 80, message: 'Arr'},
  {name: 'Blackbeard', systolicBp: 110, diastolicBp: 70, message: 'Savvy'},
]);

const csvRow$ = pirate$.pipe(toCSV(options));
csvRow$.subscribe(console.log);
// "name","systolicBp","dialostilicBp","message"
// "Blackbeard",140,91,"Yarr"
// "Crunch",120,180,"Arr"
// "Sparrow",110,70,"Savvy"
```

### `parseCSV`
Given a stream of CSV data, parse it into rows/data:
 ```js
 import { from } from 'rxjs';
 import { map } from 'rxjs/operators';
 import { parseCSV } from '@buccaneerai/rxjs-csv';

 // Create a stream of raw CSV data
 const csvString$ = from([
   '"name","systolicBp","dialostilicBp","message"\n', 
   '"Blackbeard",140,91,"Yarr"\n"Crunch",120,', 
   ',180,"Arr"\n"Sparrow",110,70,"Savvy"\n',
 ]);

 // Stream the CSV data into an RxJS Subject
 const row$ = csvString$.pipe(parseCSV());
 row$.subscribe(console.log);
 // {name: "Blackbeard", systolicBp: 140, diastolicBp: 91, message: 'Yarr'},
 // {name: "Crunch", systolicBp: 120, diastolicBp: 80, message: 'Arr'},
 // {name: "Sparrow", systolicBp: 110, diastolicBp: 70, message: 'Savvy'},
 ```

