import { describe, it, expect } from 'vitest';
import { WEST_BENGAL_DISTRICTS, isValidDistrict } from './districts';

describe('West Bengal Districts Master Data', () => {
  it('contains exactly all 23 districts of West Bengal', () => {
    expect(WEST_BENGAL_DISTRICTS).toHaveLength(23);
  });

  it('contains key districts including Kolkata, Purulia, Bankura, Howrah, North 24 Parganas', () => {
    expect(WEST_BENGAL_DISTRICTS).toContain('Kolkata');
    expect(WEST_BENGAL_DISTRICTS).toContain('Purulia');
    expect(WEST_BENGAL_DISTRICTS).toContain('Bankura');
    expect(WEST_BENGAL_DISTRICTS).toContain('Howrah');
    expect(WEST_BENGAL_DISTRICTS).toContain('North 24 Parganas');
    expect(WEST_BENGAL_DISTRICTS).toContain('South 24 Parganas');
  });

  it('validates genuine districts using isValidDistrict', () => {
    expect(isValidDistrict('Kolkata')).toBe(true);
    expect(isValidDistrict('Purulia')).toBe(true);
    expect(isValidDistrict('Mumbai')).toBe(false);
    expect(isValidDistrict('')).toBe(false);
  });
});
