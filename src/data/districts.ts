/**
 * Master List of all 23 Administrative Districts of West Bengal, India.
 * Used for Student Onboarding, Registration, Profile, and District-wise Rank & Leaderboard filtering.
 */
export const WEST_BENGAL_DISTRICTS = [
  'Alipurduar',
  'Bankura',
  'Birbhum',
  'Cooch Behar',
  'Dakshin Dinajpur',
  'Darjeeling',
  'Hooghly',
  'Howrah',
  'Jalpaiguri',
  'Jhargram',
  'Kalimpong',
  'Kolkata',
  'Malda',
  'Murshidabad',
  'Nadia',
  'North 24 Parganas',
  'Paschim Bardhaman',
  'Paschim Medinipur',
  'Purba Bardhaman',
  'Purba Medinipur',
  'Purulia',
  'South 24 Parganas',
  'Uttar Dinajpur',
] as const;

export type WestBengalDistrict = (typeof WEST_BENGAL_DISTRICTS)[number];

export const isValidDistrict = (district: string): district is WestBengalDistrict => {
  return WEST_BENGAL_DISTRICTS.includes(district as WestBengalDistrict);
};
