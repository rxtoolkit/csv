import {expect} from 'chai';
import sinon from 'sinon';
import {marbles} from 'rxjs-marbles/mocha';
import get from 'lodash/get';
import {of} from 'rxjs';

import parseCSV from './parseCSV';

const simpleCsvStrings = [
 '"name","systolicBp","diastolicBp","motto"\n',
 '"Blackbeard",140,91,"Yarr"\n',
 '"Crunch",120,80,"Arr"\n',
 '"Sparrow",110,70,"Savvy"\n',
 '"Charles Vayne",200,100,"Stab first ask questions later"\n',
];

const csvStringFragments = [
 '"name","systolicBp","diastolicBp","motto"\n',
 '"Blackbeard",140,91,"Yarr"\n"Crunch",120',
 ',80,"Arr"\n"Sparrow",110,70,"Savvy"\n"Charles Vayne",200,100,"Stab first ask questions later"\n',
];

const rows = [
  {name: 'Blackbeard', systolicBp: 140, diastolicBp: 91, motto: 'Yarr'},
  {name: 'Crunch', systolicBp: 120, diastolicBp: 80, motto: 'Arr'},
  {name: 'Sparrow', systolicBp: 110, diastolicBp: 70, motto: 'Savvy'},
  {name: 'Charles Vayne', systolicBp: 200, diastolicBp: 100, motto: 'Stab first ask questions later'}
];

describe('operators.parseCSV', () => {
  it('should produce correct row objects when given simple CSV strings', done => {
    expect(rows.length + 2);
    const onData = sinon.spy();
    const onError = sinon.spy();
    const csv$ = of(...simpleCsvStrings);
    const row$ = csv$.pipe(parseCSV({bufferInput:false}));
    row$.subscribe(onData, onData, () => {
      if (onError.calledOnce) console.error(onError.getCall(0).args[0]);
      expect(onError.called).to.be.false;
      expect(onData.callCount).to.equal(rows.length);
      rows.forEach((row, i) => {
        expect(onData.getCall(i).args[0]).to.deep.equal(row);
      });
      done();
    });
  }).timeout(2000);

  it('should produce correct row objects when given simple CSV strings', done => {
    expect(rows.length + 2);
    const onData = sinon.spy();
    const onError = sinon.spy();
    const csv$ = of(...csvStringFragments);
    const row$ = csv$.pipe(parseCSV({bufferInput:false}));
    row$.subscribe(onData, onData, () => {
      if (onError.calledOnce) console.error(onError.getCall(0).args[0]);
      expect(onError.called).to.be.false;
      expect(onData.callCount).to.equal(rows.length);
      rows.forEach((row, i) => {
        expect(onData.getCall(i).args[0]).to.deep.equal(row);
      });
      done();
    });
  }).timeout(2000);

  it('should produce correct row objects when CSV strings are buffered', done => {
    expect(rows.length + 2);
    const onData = sinon.spy();
    const onError = sinon.spy();
    const csv$ = of(...csvStringFragments);
    const row$ = csv$.pipe(parseCSV({bufferInput:true, bufferSize: 3}));
    row$.subscribe(onData, onData, () => {
      if (onError.calledOnce) console.error(onError.getCall(0).args[0]);
      expect(onError.called).to.be.false;
      expect(onData.callCount).to.equal(rows.length);
      rows.forEach((row, i) => {
        expect(onData.getCall(i).args[0]).to.deep.equal(row);
      });
      done();
    });
  }).timeout(2000);


 //  it('should produce correct row objects when given simple CSV strings', marbles(m => {
 //   const csvStr$ = m.cold('--0--1-2-34|)', simpleCsvStrings);
 //   const row$ = csvStr$.pipe(parseCSV({bufferSize: 1}));
 //   const expected$ = m.cold('-----0-1-23|)', [
 //     {name: 'Blackbeard', systolicBp: 140, diastolicBp: 91, motto: 'Yarr'},
 //     {name: 'Crunch', systolicBp: 120, diastolicBp: 80, motto: 'Arr'},
 //     {name: 'Sparrow', systolicBp: 110, diastolicBp: 70, motto: 'Savvy'},
 //     {name: 'Charles Vayne', systolicBp: 200, diastolicBp: 100, motto: 'Stab first ask questions later'}
 //   ]);
 //   m.expect(row$).toBeObservable(expected$)
 // }));

 // it('should produce correct row objects when given fragmented CSV strings', marbles(m => {
 //   const csvStr$ = m.cold('--0--1(23|)', csvStrings);
 //   const row$ = csvStr$.pipe(parseCSV({bufferSize: 1}));
 //   const expected$ = m.cold('-----0(123|)', [
 //     {name: 'Blackbeard', systolicBp: 140, diastolicBp: 91, motto: 'Yarr'},
 //     {name: 'Crunch', systolicBp: 120, diastolicBp: 80, motto: 'Arr'},
 //     {name: 'Sparrow', systolicBp: 110, diastolicBp: 70, motto: 'Savvy'},
 //     {name: 'Charles Vayne', systolicBp: 200, diastolicBp: 100, motto: 'Stab first ask questions later'}
 //   ]);
 //   m.expect(row$).toBeObservable(expected$)
 // }));
});
