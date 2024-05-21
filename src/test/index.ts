import { test } from 'node:test';
import assert from 'node:assert';

test('Example Test Suite', async (t) => {
  await t.test('should pass this test', () => {
    assert.strictEqual(1 + 1, 2);
  });

  await t.test('should fail this test', () => {
    assert.strictEqual(1 + 1, 3);
  });
});
