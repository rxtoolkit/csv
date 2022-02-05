import {expect} from 'chai';
import sinon from 'sinon';
import {marbles} from 'rxjs-marbles/mocha';
import fs from 'fs';
import path from 'path';
import get from 'lodash/get';
import {from,of,throwError} from 'rxjs';
import {mergeMap} from 'rxjs/operators';

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

const sampleCSVStrings = fs.readFileSync(
  path.resolve(__dirname, '../../data/valid-data.csv')
).toString().split('\n');


describe('operators.parseCSV', () => {
  it('should produce correct row objects when given simple CSV strings', done => {
    expect(rows.length + 2);
    const onData = sinon.spy();
    // const onError = sinon.spy();
    const csv$ = of(...simpleCsvStrings);
    const row$ = csv$.pipe(parseCSV({bufferInput:false}));
    row$.subscribe(onData, console.trace, () => {
      // if (onError.calledOnce) console.error(onError.getCall(0).args[0]);
      // expect(onError.called).to.be.false;
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
    // const onError = sinon.spy();
    const csv$ = of(...csvStringFragments);
    const row$ = csv$.pipe(parseCSV({bufferInput:false}));
    row$.subscribe(onData, console.trace, () => {
      // if (onError.calledOnce) console.error(onError.getCall(0).args[0]);
      // expect(onError.called).to.be.false;
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
    // const onError = sinon.spy();
    const csv$ = of(...csvStringFragments);
    const row$ = csv$.pipe(parseCSV({bufferInput:true, bufferSize: 3}));
    row$.subscribe(onData, console.trace, () => {
      // if (onError.calledOnce) console.error(onError.getCall(0).args[0]);
      // expect(onError.called).to.be.false;
      expect(onData.callCount).to.equal(rows.length);
      rows.forEach((row, i) => {
        expect(onData.getCall(i).args[0]).to.deep.equal(row);
      });
      done();
    });
  }).timeout(2000);

  it('upstream operator should not throw', done => {
    const input$ = of(...simpleCsvStrings);
    const error = new Error('This is a promise rejection');
    const rejectedPromise = () => from(
      new Promise((resolve, reject) => reject(error))
    );
    const runTestWithoutParser = () => {
      const out$ = input$.pipe(
        mergeMap(() => rejectedPromise()),
      );
      out$.subscribe(
        null,
        err => {
          expect(err).to.be.an('error');
          done();
        })
    };
    expect(runTestWithoutParser).to.not.throw();
  }).timeout(2000);

  it('should not throw when upstream operator throws', done => {
    const input$ = of(...simpleCsvStrings);
    const error = new Error('this is an uncaught exception');
    const badThings = () => {throw error;};
    const runTestWithParser = () => {
      const out$ = input$.pipe(
        mergeMap(() => badThings()),
        parseCSV()
      );
      out$.subscribe(
        null,
        err => {
          expect(err).to.be.an('error');
          done();
        })
    };
    expect(runTestWithParser).to.not.throw();
  }).timeout(2000);

  it('should not throw when upstream operator emits an error', done => {
    const input$ = of(...simpleCsvStrings);
    const error = new Error('RxJS caught error!');
    const badThings = () => throwError(error);
    const runTestWithParser = () => {
      const out$ = input$.pipe(
        mergeMap(badThings),
        parseCSV()
      );
      out$.subscribe(
        null,
        err => {
          expect(err).to.be.an('error');
          done();
        }
      );
    };
    expect(runTestWithParser).to.not.throw();
  }).timeout(2000);

  it('should not throw fatal exception when upstream operator has a rejected promise', done => {
    const input$ = of(...simpleCsvStrings);
    const error = new Error('This is a promise rejection!');
    const rejectedPromise = () => from(
      new Promise((resolve, reject) => {
        reject(error);
      })
    );
    const runTestWithParser = () => {
      const out$ = input$.pipe(
        mergeMap(() => rejectedPromise()),
        parseCSV()
      );
      out$.subscribe(null, err => {
        expect(err).to.be.an('error');
        done();
      });
    };
    expect(runTestWithParser).to.not.throw();
  }).timeout(2000);

  it('should properly parse large sample CSV file', done => {
    const onData = sinon.spy();
    const input$ = of(...sampleCSVStrings);
    const row$ = input$.pipe(parseCSV({
      parserOptions: {
        columns: true,
        // quote: '"',
        cast: true,
        cast_date: false,
        // delimiter: ',',
        ltrim: true,
        rtrim: true,
        relax_column_count_more: true,
        skip_empty_lines: true,
      }
    }));
    row$.subscribe(onData, console.trace, () => {
      expect(onData.callCount).to.equal(224);
      expect(onData.getCall(223).args[0]).to.deep.equal({
        _id: '61a7fd3ff3ab3994c246d596l1RyxfhBQYtf',
        text: 'medical',
        start: 76.75,
        end: 77.15,
        confidence: 1,
        timestamp: 1638399407217,
        sttEngine: 'tfEnsembler',
        pipeline: 'stt',
        i: 342,
        speaker: '',
        speakerConfidence: 0,
      });
      done();
    });
  }).timeout(5000);

  // it('should handle error when input is a string but is not valid CSV', () => {
  //   expect(false).to.be.true;
  // });

  // it('should handle error when input is not a String', () => {
  //   expect(false).to.be.true;
  // });


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
