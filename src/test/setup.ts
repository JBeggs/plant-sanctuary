/**
 * Vitest setup for Plant Sanctuary
 * NODE_ENV=development ensures React loads the dev build (which exports act) for @testing-library/react
 */
process.env.NODE_ENV = 'development';
import { beforeEach } from 'vitest';
import '@testing-library/jest-dom';

beforeEach(() => {
  localStorage.clear();
});
