import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { after, test } from 'node:test';
import {
  DEFAULT_API_CHECK_TIMEOUT,
  DEFAULT_API_REQUEST_TIMEOUT,
  getApiCheckTimeout,
  getApiRequestTimeout,
} from '../src/utils/requestTimeout.ts';

const originalStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
let storedValue = null;
Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: { getItem: () => storedValue },
});
after(() => {
  if (originalStorage) Object.defineProperty(globalThis, 'localStorage', originalStorage);
  else delete globalThis.localStorage;
});

test('API detection defaults to 15 seconds without writing browser settings', () => {
  assert.equal(DEFAULT_API_CHECK_TIMEOUT, 15000);
  for (const value of [null, '']) {
    storedValue = value;
    assert.equal(getApiCheckTimeout(), 15000);
  }
});

test('explicit detection timeouts retain the existing parseInt behavior', () => {
  for (const [value, expected] of [['8000', 8000], ['30000', 30000], ['15000', 15000], ['0', 0], ['-1', -1], ['8000ms', 8000], ['invalid', NaN]]) {
    storedValue = value;
    assert.equal(getApiCheckTimeout(), expected);
  }
});

test('ordinary API request timeout remains unchanged', () => {
  assert.equal(DEFAULT_API_REQUEST_TIMEOUT, 50000);
  for (const value of [null, '', '0', '-1', 'invalid']) {
    storedValue = value;
    assert.equal(getApiRequestTimeout(), 50000);
  }
  storedValue = '60000';
  assert.equal(getApiRequestTimeout(), 60000);
});

test('all five detection timers use the shared default', () => {
  for (const [file, count] of [['src/utils/initApp.ts', 1], ['src/hooks/useHostAPI.ts', 4]]) {
    const source = readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
    assert.equal(source.match(/getApiCheckTimeout\(\)/g)?.length, count, file);
    assert.doesNotMatch(source, /localStorage\.getItem\(['"]timeout['"]\)\s*\?/, file);
  }
});

test('translated default hints agree with the implementation', () => {
  for (const locale of ['en', 'zh', 'ru']) {
    const source = readFileSync(new URL(`../src/locales/${locale}.ts`, import.meta.url), 'utf8');
    assert.match(source, /apiCheckTimeout[^\n]*15000/, locale);
    assert.doesNotMatch(source, /apiCheckTimeout[^\n]*3000/, locale);
  }
});
