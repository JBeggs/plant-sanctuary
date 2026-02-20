/**
 * Vitest setup for Plant Sanctuary
 */
import { beforeEach } from 'vitest';
import '@testing-library/jest-dom';

beforeEach(() => {
  localStorage.clear();
});
