import assert from 'node:assert';

describe('Example Test Suite', () => {
  it('should pass this test', () => {
    assert.strictEqual(1 + 1, 2);
  });

  it('should fail this test', () => {
    assert.strictEqual(1 + 1, 3);
  });
});
