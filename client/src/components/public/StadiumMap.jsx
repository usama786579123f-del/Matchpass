import { STADIUM_SECTIONS, getSectionById } from '../../utils/stadiumSections';

/**
 * Generic, schematic stadium bowl map - not venue-accurate, but built
 * from many small blocks around a rounded-rectangle "track" so it
 * visually resembles a real seating chart (like StubHub/Viagogo)
 * rather than 6 flat zones. Every block belongs to one of the 6
 * STADIUM_SECTIONS categories; hovering a listing highlights every
 * block in that category around the whole bowl.
 */

const CENTER = { x: 200, y: 200 };

const getRingVertices = (hw, hh, c) => [
  [CENTER.x - hw + c, CENTER.y - hh],
  [CENTER.x + hw - c, CENTER.y - hh],
  [CENTER.x + hw, CENTER.y - hh + c],
  [CENTER.x + hw, CENTER.y + hh - c],
  [CENTER.x + hw - c, CENTER.y + hh],
  [CENTER.x - hw + c, CENTER.y + hh],
  [CENTER.x - hw, CENTER.y + hh - c],
  [CENTER.x - hw, CENTER.y - hh + c],
];

const EDGES = [
  { a: 0, b: 1, type: 'straight', cls: 'shortside' },
  { a: 1, b: 2, type: 'corner', prev: 'shortside', next: 'longside' },
  { a: 2, b: 3, type: 'straight', cls: 'longside' },
  { a: 3, b: 4, type: 'corner', prev: 'longside', next: 'shortside' },
  { a: 4, b: 5, type: 'straight', cls: 'shortside' },
  { a: 5, b: 6, type: 'corner', prev: 'shortside', next: 'longside' },
  { a: 6, b: 7, type: 'straight', cls: 'longside' },
  { a: 7, b: 0, type: 'corner', prev: 'longside', next: 'shortside' },
];

const lerp = (p1, p2, t) => [p1[0] + (p2[0] - p1[0]) * t, p1[1] + (p2[1] - p1[1]) * t];

const subdivide = (p1, p2, n) => {
  const pts = [];
  for (let i = 0; i <= n; i++) pts.push(lerp(p1, p2, i / n));
  return pts;
};

const buildTierBlocks = (innerVerts, outerVerts, tierName) => {
  const blocks = [];
  EDGES.forEach((edge, edgeIndex) => {
    const n = edge.type === 'straight' ? 5 : 2;
    const innerPts = subdivide(innerVerts[edge.a], innerVerts[edge.b], n);
    const outerPts = subdivide(outerVerts[edge.a], outerVerts[edge.b], n);
    for (let k = 0; k < n; k++) {
      const cls = edge.type === 'straight' ? edge.cls : k < n / 2 ? edge.prev : edge.next;
      const category = cls + '-' + tierName;
      blocks.push({
        id: category + '-' + edgeIndex + '-' + k,
        category,
        points: [outerPts[k], outerPts[k + 1], innerPts[k + 1], innerPts[k]],
      });
    }
  });
  return blocks;
};

const buildStadiumBlocks = () => {
  const r1 = getRingVertices(105, 75, 40);
  const r2 = getRingVertices(140, 105, 55);
  const r3 = getRingVertices(170, 135, 65);
  const r4 = getRingVertices(195, 160, 70);
  return [
    ...buildTierBlocks(r1, r2, 'lower'),
    ...buildTierBlocks(r2, r3, 'middle'),
    ...buildTierBlocks(r3, r4, 'upper'),
  ];
};

const STADIUM_BLOCKS = buildStadiumBlocks();

const StadiumMap = ({ highlightedSectionId, onSectionClick, interactive = true }) => {
  return (
    <div className="flex flex-col gap-3">
      <svg viewBox="0 0 400 400" className="w-full rounded-xl bg-white">
        {/* Bowl blocks */}
        {STADIUM_BLOCKS.map((block) => {
          const section = getSectionById(block.category);
          const isHighlighted = highlightedSectionId === block.category;
          const isDimmed = highlightedSectionId && !isHighlighted;
          return (
            <polygon
              key={block.id}
              points={block.points.map((p) => p.join(',')).join(' ')}
              fill={section?.color || '#E2E8F0'}
              opacity={isDimmed ? 0.2 : isHighlighted ? 1 : 0.85}
              stroke={isHighlighted ? '#0B1220' : '#ffffff'}
              strokeWidth={isHighlighted ? 1.5 : 1}
              className={interactive ? 'cursor-pointer transition-opacity duration-150' : ''}
              onClick={interactive ? () => onSectionClick?.(block.category) : undefined}
            />
          );
        })}

        {/* Pitch */}
        <rect x="110" y="140" width="180" height="120" rx="8" fill="#1B7A3D" />
        <rect x="110" y="140" width="180" height="120" rx="8" fill="none" stroke="#ffffff" strokeOpacity="0.5" strokeWidth="1.5" />
        <line x1="200" y1="140" x2="200" y2="260" stroke="#ffffff" strokeOpacity="0.5" strokeWidth="1.5" />
        <circle cx="200" cy="200" r="18" fill="none" stroke="#ffffff" strokeOpacity="0.5" strokeWidth="1.5" />
        <rect x="110" y="180" width="14" height="40" fill="none" stroke="#ffffff" strokeOpacity="0.5" strokeWidth="1.5" />
        <rect x="276" y="180" width="14" height="40" fill="none" stroke="#ffffff" strokeOpacity="0.5" strokeWidth="1.5" />
      </svg>

      <div className="grid grid-cols-3 gap-1.5">
        {STADIUM_SECTIONS.map((section) => (
          <button
            key={section.id}
            type="button"
            onClick={interactive ? () => onSectionClick?.(section.id) : undefined}
            style={{ backgroundColor: section.color }}
            className={`rounded-lg py-2 text-center text-[11px] font-bold text-ink transition-opacity ${
              highlightedSectionId && highlightedSectionId !== section.id ? 'opacity-40' : 'opacity-100'
            } ${interactive ? 'hover:opacity-90' : ''}`}
          >
            {section.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default StadiumMap;