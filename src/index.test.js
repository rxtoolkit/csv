import {expect} from 'chai';
// import sinon from 'sinon';
// import {marbles} from 'rxjs-marbles/mocha';

import * as api from './index';

describe('index', () => {
  it('should export a function', () => {
    expect(api).to.deep.include([
      'myPublicFunction1', // FIXME
    ]);
  });
});
