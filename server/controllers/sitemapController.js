const Event = require('../models/Event');

/**
 * @route   GET /api/sitemap.xml
 * @desc    Dynamically generated sitemap listing static pages plus
 *          every active event (so search engines discover new
 *          fixtures without a manual rebuild). Vercel/Railway can
 *          proxy /sitemap.xml on the main domain to this endpoint.
 */
const getSitemap = async (req, res, next) => {
  try {
    const clientUrl = process.env.CLIENT_URL || 'https://matchpass.com';

    const staticPages = [
      '',
      '/events',
      '/about',
      '/terms',
      '/privacy',
      '/faq',
      '/contact',
    ];

    const events = await Event.find({ isActive: true }).select('slug updatedAt');

    let urls = staticPages
      .map((path) => `  <url><loc>${clientUrl}${path}</loc></url>`)
      .join('\n');

    urls +=
      '\n' +
      events
        .map(
          (event) =>
            `  <url><loc>${clientUrl}/events/${event.slug}</loc><lastmod>${event.updatedAt.toISOString()}</lastmod></url>`
        )
        .join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;

    res.header('Content-Type', 'application/xml');
    return res.send(xml);
  } catch (err) {
    next(err);
  }
};

module.exports = { getSitemap };