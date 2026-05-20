/**
 * Vitest setup for Plant Sanctuary
 * NODE_ENV=development ensures React loads the dev build (which exports act) for @testing-library/react
 */
process.env.NODE_ENV = 'development';
import { beforeEach } from 'vitest';
import '@testing-library/jest-dom';

/** jsdom does not decode images; keep image-related components stable in tests */
Object.defineProperty(HTMLImageElement.prototype, 'complete', {
  get() {
    return true;
  },
  configurable: true,
});
Object.defineProperty(HTMLImageElement.prototype, 'naturalHeight', {
  get() {
    return 1;
  },
  configurable: true,
});

beforeEach(() => {
  localStorage.clear();
});
