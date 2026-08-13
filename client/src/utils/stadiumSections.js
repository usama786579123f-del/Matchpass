/**
 * Six standard zone categories, matching common ticket-marketplace
 * seating conventions: Shortside = behind the goals, Longside = along
 * the touchlines, each split into Lower/Middle/Upper tiers. The visual
 * map (StadiumMap.jsx) renders many small blocks around the bowl, but
 * every block belongs to one of these six categories - keeping the
 * data model simple while the visual looks dense and realistic.
 */
export const STADIUM_SECTIONS = [
  { id: 'shortside-lower', label: 'Shortside Lower', color: '#34D399' },
  { id: 'shortside-middle', label: 'Shortside Middle', color: '#7DD3FC' },
  { id: 'shortside-upper', label: 'Shortside Upper', color: '#A78BFA' },
  { id: 'longside-lower', label: 'Longside Lower', color: '#F9A8D4' },
  { id: 'longside-middle', label: 'Longside Middle', color: '#86EFAC' },
  { id: 'longside-upper', label: 'Longside Upper', color: '#FCA5A5' },
];

export const getSectionById = (id) => STADIUM_SECTIONS.find((s) => s.id === id);

export const getSectionByLabel = (label) =>
  STADIUM_SECTIONS.find((s) => s.label === label);