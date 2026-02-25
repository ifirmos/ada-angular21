import { NegativeValuesPipe } from './negative-values.pipe';

describe('NegativeValuesPipe', () => {
  it('create an instance', () => {
    const pipe = new NegativeValuesPipe();
    expect(pipe).toBeTruthy();
  });
});
