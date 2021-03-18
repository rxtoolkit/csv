# @buccaneerai/rxjs-csv
> 🚰  RxJS operators for handling CSV data streams

> ⚠️ ALPHA: This library seems to work well but has not been widely tested yet.

## Installation
This is a private package. It requires setting up access in your npm config.

```bash
yarn add @buccaneerai/rxjs-csv
```

## API

### `toCSV`

```js
import {from} from 'rxjs';
import {toCsv} from '@bottlenose/rxcsv';

const pirate$ = from([
  {name: 'Blackbeard', systolicBp: 140, diastolicBp: 91, message: 'Yarr'},
  {name: 'Crunch', systolicBp: 120, diastolicBp: 80, message: 'Arr'},
  {name: 'Blackbeard', systolicBp: 110, diastolicBp: 70, message: 'Savvy'},
]);

const csvRow$ = pirate$.pipe(toCsv(options));
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
 import { parse } from '@buccaneerai/rxjs-csv';

 // Create a stream of raw CSV data
 const csvString$ = from([
   '"name","systolicBp","dialostilicBp","message"\n', 
   '"Blackbeard",140,91,"Yarr"\n"Crunch",120,', 
   ',180,"Arr"\n"Sparrow",110,70,"Savvy"\n',
 ]);

 // Stream the CSV data into an RxJS Subject
 const row$ = csvString$.pipe(parse());
 row$.subscribe(console.log);
 // {name: "Blackbeard", systolicBp: 140, diastolicBp: 91, message: 'Yarr'},
 // {name: "Crunch", systolicBp: 120, diastolicBp: 80, message: 'Arr'},
 // {name: "Sparrow", systolicBp: 110, diastolicBp: 70, message: 'Savvy'},
 ```

