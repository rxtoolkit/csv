import {expect} from 'chai';
import {marbles} from 'rxjs-marbles/mocha';

import toCsv, {reorderObjectKeys, reduceIndexAndColumnNames} from './toCsv';

const rows = [
 {carModel: 'Audi', price: 10000, color: 'blue'},
 {carModel: 'BMW', price: 15000, color: 'red'},
 {carModel: 'Mercedes', price: 20000, color: 'yellow'},
 {carModel: 'Porsche', price: 30000, color: 'green'},
];

const csvStr = [
 `"carModel","price","color"\n"Audi",10000,"blue"`,
 '"BMW",15000,"red"',
 '"Mercedes",20000,"yellow"',
 '"Porsche",30000,"green"',
];

describe('operators.toCsv', () => {
 it('should properly output csv data', marbles(m => {
   const row$ = m.cold('-0-12---(3|)', rows);
   const csvRow$ = row$.pipe(toCsv());
   const expected$ = m.cold('-0-12---(3|)', csvStr);
   m.expect(csvRow$).toBeObservable(expected$);
 }));

 it('should reorder object keys correctly', () => {
   const params = {foo: 0, bar: 1};
   const result = reorderObjectKeys(['bar', 'foo'], params);
   expect(Object.keys(result)).to.deep.equal(['bar', 'foo']);
   expect(result).to.deep.equal({bar: 1, foo: 0});
 });

 it('should handle case where the input objects mix up the order of their keys', marbles(m => {
  const row$ = m.cold('-0-12---(34|)', [
    {price: 1000000, color: 'white', carModel: 'Maserati'},
    ...rows,
    {color: 'blue', price: 250000, carModel: 'Ferrari'},
  ]);
  const csvRow$ = row$.pipe(toCsv());
  const expected$ = m.cold('-0-12---(34|)', [
    `"price","color","carModel"\n1000000,"white","Maserati"`,
    '10000,"blue","Audi"',
    '15000,"red","BMW"',
    '20000,"yellow","Mercedes"',
    '30000,"green","Porsche"',
    '250000,"blue","Ferrari"',
  ]);
  m.expect(csvRow$).toBeObservable(expected$);
 }));
});
