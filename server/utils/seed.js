const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Venue = require('../models/Venue');
const Event = require('../models/Event');
const logger = require('./logger');

const slugify = (str) =>
  str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');

const VENUES = [
  { name: 'Emirates Stadium', city: 'London', country: 'United Kingdom', capacity: 60704 },
  { name: 'Anfield', city: 'Liverpool', country: 'United Kingdom', capacity: 61276 },
  { name: 'Old Trafford', city: 'Manchester', country: 'United Kingdom', capacity: 74310 },
  { name: 'Tottenham Hotspur Stadium', city: 'London', country: 'United Kingdom', capacity: 62850 },
  { name: "St James' Park", city: 'Newcastle', country: 'United Kingdom', capacity: 52305 },
  { name: 'London Stadium', city: 'London', country: 'United Kingdom', capacity: 62500 },
  { name: 'Etihad Stadium', city: 'Manchester', country: 'United Kingdom', capacity: 53400 },
  { name: 'Stamford Bridge', city: 'London', country: 'United Kingdom', capacity: 40343 },
];

const FIXTURES = [
  { home: 'Arsenal', away: 'Manchester City', league: 'Premier League', venueIndex: 0, daysFromNow: 6, featured: true, image: 'https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?q=80&w=1200&auto=format&fit=crop' },
  { home: 'Liverpool', away: 'Chelsea', league: 'Premier League', venueIndex: 1, daysFromNow: 9, featured: true, image: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?q=80&w=1200&auto=format&fit=crop' },
  { home: 'Manchester United', away: 'Bayern Munich', league: 'Champions League', venueIndex: 2, daysFromNow: 14, featured: true, image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1200&auto=format&fit=crop' },
  { home: 'Tottenham Hotspur', away: 'Real Madrid', league: 'Champions League', venueIndex: 3, daysFromNow: 18, featured: true, image: 'https://images.unsplash.com/photo-1517927033932-b3d18e61fb3a?q=80&w=1200&auto=format&fit=crop' },
  { home: 'Newcastle United', away: 'Aston Villa', league: 'FA Cup', venueIndex: 4, daysFromNow: 21, featured: false, image: 'https://images.unsplash.com/photo-1459865264687-595d652de67e?q=80&w=1200&auto=format&fit=crop' },
  { home: 'West Ham United', away: 'Everton', league: 'FA Cup', venueIndex: 5, daysFromNow: 23, featured: false, image: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?q=80&w=1200&auto=format&fit=crop' },
  { home: 'Manchester City', away: 'Chelsea', league: 'Premier League', venueIndex: 6, daysFromNow: 12, featured: false, image: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=1200&auto=format&fit=crop' },
  { home: 'Arsenal', away: 'Tottenham Hotspur', league: 'Premier League', venueIndex: 0, daysFromNow: 27, featured: false, image: 'https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?q=80&w=1200&auto=format&fit=crop' },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    logger.info('Connected to MongoDB for seeding.');

    // Clear existing demo data (safe to re-run)
    await Venue.deleteMany({});
    await Event.deleteMany({});
    logger.info('Cleared existing venues and events.');

    const createdVenues = await Venue.insertMany(VENUES);
    logger.info(`Seeded ${createdVenues.length} venues.`);

    const eventDocs = FIXTURES.map((f) => {
      const eventDate = new Date(Date.now() + f.daysFromNow * 24 * 60 * 60 * 1000);
      const baseSlug = slugify(`${f.home}-vs-${f.away}-${eventDate.toISOString().split('T')[0]}`);
      return {
        title: `${f.home} vs ${f.away}`,
        slug: baseSlug,
        league: f.league,
        homeTeam: f.home,
        awayTeam: f.away,
        venue: createdVenues[f.venueIndex]._id,
        eventDate,
        imageUrl: f.image,
        isFeatured: f.featured,
        status: 'upcoming',
        isActive: true,
      };
    });

    const createdEvents = await Event.insertMany(eventDocs);
    logger.info(`Seeded ${createdEvents.length} events.`);

    logger.info('Seeding complete! ✅');
    process.exit(0);
  } catch (error) {
    logger.error(`Seeding failed: ${error.message}`);
    process.exit(1);
  }
};

seed();