/**
 * Builds a Mongoose filter object for event search/browse.
 * Kept separate from the controller so both the public search endpoint
 * and admin event management can reuse the same filtering logic.
 */
const buildEventFilter = (query) => {
  const filter = { isActive: true };

  if (query.league) {
    filter.league = query.league;
  }

  if (query.team) {
    filter.$or = [
      { homeTeam: new RegExp(query.team, 'i') },
      { awayTeam: new RegExp(query.team, 'i') },
    ];
  }

  if (query.q) {
    filter.$text = { $search: query.q };
  }

  if (query.dateFrom || query.dateTo) {
    filter.eventDate = {};
    if (query.dateFrom) filter.eventDate.$gte = new Date(query.dateFrom);
    if (query.dateTo) filter.eventDate.$lte = new Date(query.dateTo);
  }

  if (query.priceMin || query.priceMax) {
    filter.lowestPrice = {};
    if (query.priceMin) filter.lowestPrice.$gte = parseFloat(query.priceMin);
    if (query.priceMax) filter.lowestPrice.$lte = parseFloat(query.priceMax);
  }

  if (query.status) {
    filter.status = query.status;
  } else {
    // Default: only show events that haven't happened yet on public pages
    filter.status = { $in: ['upcoming', 'ongoing'] };
  }

  return filter;
};

const buildSortOption = (sortBy) => {
  switch (sortBy) {
    case 'price_asc':
      return { lowestPrice: 1 };
    case 'price_desc':
      return { lowestPrice: -1 };
    case 'date_asc':
      return { eventDate: 1 };
    case 'date_desc':
      return { eventDate: -1 };
    default:
      return { eventDate: 1 };
  }
};

module.exports = { buildEventFilter, buildSortOption };