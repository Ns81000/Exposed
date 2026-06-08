// ── Demo Data Generator ──────────────────────────────────────────────────
// Produces a massive realistic dataset for video recording demo mode.
// Activated via secret keyboard combo — never touches IndexedDB.

const NOW = Date.now();
const HOUR = 3600 * 1000;
const MINUTE = 60 * 1000;

function hoursAgo(h, jitterMin = 0) {
  return new Date(NOW - h * HOUR - jitterMin * MINUTE).toISOString();
}

function minutesAgo(m) {
  return new Date(NOW - m * MINUTE).toISOString();
}

let _visitCounter = 1000;
function vid() {
  return `demo-visit-${++_visitCounter}`;
}

let _idCounter = 5000;
function eid() {
  return ++_idCounter;
}

// ── SITES ──────────────────────────────────────────────────────────────
const DEMO_SITES = [
  { id: 1, domain: 'youtube.com', firstSeen: hoursAgo(47), lastSeen: minutesAgo(3), totalTrackers: 42 },
  { id: 2, domain: 'amazon.com', firstSeen: hoursAgo(46), lastSeen: minutesAgo(8), totalTrackers: 38 },
  { id: 3, domain: 'reddit.com', firstSeen: hoursAgo(44), lastSeen: minutesAgo(12), totalTrackers: 31 },
  { id: 4, domain: 'twitter.com', firstSeen: hoursAgo(43), lastSeen: minutesAgo(18), totalTrackers: 29 },
  { id: 5, domain: 'nytimes.com', firstSeen: hoursAgo(41), lastSeen: minutesAgo(22), totalTrackers: 35 },
  { id: 6, domain: 'linkedin.com', firstSeen: hoursAgo(39), lastSeen: minutesAgo(30), totalTrackers: 27 },
  { id: 7, domain: 'instagram.com', firstSeen: hoursAgo(38), lastSeen: minutesAgo(35), totalTrackers: 33 },
  { id: 8, domain: 'netflix.com', firstSeen: hoursAgo(36), lastSeen: minutesAgo(45), totalTrackers: 19 },
  { id: 9, domain: 'ebay.com', firstSeen: hoursAgo(34), lastSeen: minutesAgo(55), totalTrackers: 26 },
  { id: 10, domain: 'cnn.com', firstSeen: hoursAgo(30), lastSeen: hoursAgo(1, 10), totalTrackers: 32 },
  { id: 11, domain: 'spotify.com', firstSeen: hoursAgo(28), lastSeen: hoursAgo(2), totalTrackers: 21 },
  { id: 12, domain: 'github.com', firstSeen: hoursAgo(25), lastSeen: hoursAgo(3), totalTrackers: 14 },
  { id: 13, domain: 'medium.com', firstSeen: hoursAgo(22), lastSeen: hoursAgo(4, 20), totalTrackers: 24 },
  { id: 14, domain: 'walmart.com', firstSeen: hoursAgo(18), lastSeen: hoursAgo(5), totalTrackers: 30 },
  { id: 15, domain: 'bbc.com', firstSeen: hoursAgo(14), lastSeen: hoursAgo(6, 30), totalTrackers: 28 },
];

// ── VISITS ──────────────────────────────────────────────────────────────
const DEMO_VISITS = [
  // youtube.com
  { id: 101, visitId: vid(), siteDomain: 'youtube.com', timestamp: hoursAgo(47), pageTitle: 'YouTube - Home', pageUrl: 'https://www.youtube.com/', trackerCount: 12, fingerprintCount: 3 },
  { id: 102, visitId: vid(), siteDomain: 'youtube.com', timestamp: hoursAgo(38), pageTitle: 'How to Build a Privacy Extension - YouTube', pageUrl: 'https://www.youtube.com/watch?v=abc123', trackerCount: 14, fingerprintCount: 2 },
  { id: 103, visitId: vid(), siteDomain: 'youtube.com', timestamp: hoursAgo(12), pageTitle: 'YouTube Music - Discover', pageUrl: 'https://music.youtube.com/', trackerCount: 10, fingerprintCount: 4 },
  { id: 104, visitId: vid(), siteDomain: 'youtube.com', timestamp: minutesAgo(45), pageTitle: 'Trending Videos - YouTube', pageUrl: 'https://www.youtube.com/feed/trending', trackerCount: 8, fingerprintCount: 1 },
  // amazon.com
  { id: 105, visitId: vid(), siteDomain: 'amazon.com', timestamp: hoursAgo(46), pageTitle: 'Amazon.com: Online Shopping', pageUrl: 'https://www.amazon.com/', trackerCount: 15, fingerprintCount: 5 },
  { id: 106, visitId: vid(), siteDomain: 'amazon.com', timestamp: hoursAgo(30), pageTitle: 'Your Orders - Amazon.com', pageUrl: 'https://www.amazon.com/gp/your-account/order-history', trackerCount: 11, fingerprintCount: 3 },
  { id: 107, visitId: vid(), siteDomain: 'amazon.com', timestamp: hoursAgo(8), pageTitle: 'Sony WH-1000XM5 Headphones - Amazon.com', pageUrl: 'https://www.amazon.com/dp/B09XS7JWHH', trackerCount: 13, fingerprintCount: 2 },
  { id: 108, visitId: vid(), siteDomain: 'amazon.com', timestamp: minutesAgo(25), pageTitle: 'Shopping Cart - Amazon.com', pageUrl: 'https://www.amazon.com/gp/cart/view.html', trackerCount: 9, fingerprintCount: 1 },
  // reddit.com
  { id: 109, visitId: vid(), siteDomain: 'reddit.com', timestamp: hoursAgo(44), pageTitle: 'Reddit - Dive into anything', pageUrl: 'https://www.reddit.com/', trackerCount: 10, fingerprintCount: 2 },
  { id: 110, visitId: vid(), siteDomain: 'reddit.com', timestamp: hoursAgo(20), pageTitle: 'r/privacy - Online Privacy Discussion', pageUrl: 'https://www.reddit.com/r/privacy/', trackerCount: 12, fingerprintCount: 3 },
  { id: 111, visitId: vid(), siteDomain: 'reddit.com', timestamp: hoursAgo(5), pageTitle: 'r/technology - Tech News', pageUrl: 'https://www.reddit.com/r/technology/', trackerCount: 9, fingerprintCount: 1 },
  // twitter.com
  { id: 112, visitId: vid(), siteDomain: 'twitter.com', timestamp: hoursAgo(43), pageTitle: 'Home / X', pageUrl: 'https://twitter.com/home', trackerCount: 11, fingerprintCount: 3 },
  { id: 113, visitId: vid(), siteDomain: 'twitter.com', timestamp: hoursAgo(18), pageTitle: 'Explore / X', pageUrl: 'https://twitter.com/explore', trackerCount: 9, fingerprintCount: 2 },
  { id: 114, visitId: vid(), siteDomain: 'twitter.com', timestamp: hoursAgo(2), pageTitle: 'Notifications / X', pageUrl: 'https://twitter.com/notifications', trackerCount: 8, fingerprintCount: 1 },
  // nytimes.com
  { id: 115, visitId: vid(), siteDomain: 'nytimes.com', timestamp: hoursAgo(41), pageTitle: 'The New York Times - Breaking News', pageUrl: 'https://www.nytimes.com/', trackerCount: 18, fingerprintCount: 4 },
  { id: 116, visitId: vid(), siteDomain: 'nytimes.com', timestamp: hoursAgo(24), pageTitle: 'Opinion | Digital Privacy in 2026 - NYTimes', pageUrl: 'https://www.nytimes.com/2026/06/07/opinion/digital-privacy.html', trackerCount: 14, fingerprintCount: 3 },
  { id: 117, visitId: vid(), siteDomain: 'nytimes.com', timestamp: hoursAgo(6), pageTitle: 'Technology - The New York Times', pageUrl: 'https://www.nytimes.com/section/technology', trackerCount: 12, fingerprintCount: 2 },
  { id: 118, visitId: vid(), siteDomain: 'nytimes.com', timestamp: minutesAgo(90), pageTitle: 'World News - NYTimes.com', pageUrl: 'https://www.nytimes.com/section/world', trackerCount: 10, fingerprintCount: 1 },
  // linkedin.com
  { id: 119, visitId: vid(), siteDomain: 'linkedin.com', timestamp: hoursAgo(39), pageTitle: 'LinkedIn - Feed', pageUrl: 'https://www.linkedin.com/feed/', trackerCount: 13, fingerprintCount: 3 },
  { id: 120, visitId: vid(), siteDomain: 'linkedin.com', timestamp: hoursAgo(16), pageTitle: 'Jobs | LinkedIn', pageUrl: 'https://www.linkedin.com/jobs/', trackerCount: 10, fingerprintCount: 2 },
  { id: 121, visitId: vid(), siteDomain: 'linkedin.com', timestamp: hoursAgo(3), pageTitle: 'My Network | LinkedIn', pageUrl: 'https://www.linkedin.com/mynetwork/', trackerCount: 8, fingerprintCount: 1 },
  // instagram.com
  { id: 122, visitId: vid(), siteDomain: 'instagram.com', timestamp: hoursAgo(38), pageTitle: 'Instagram', pageUrl: 'https://www.instagram.com/', trackerCount: 14, fingerprintCount: 4 },
  { id: 123, visitId: vid(), siteDomain: 'instagram.com', timestamp: hoursAgo(14), pageTitle: 'Explore | Instagram', pageUrl: 'https://www.instagram.com/explore/', trackerCount: 11, fingerprintCount: 2 },
  { id: 124, visitId: vid(), siteDomain: 'instagram.com', timestamp: hoursAgo(1), pageTitle: 'Reels | Instagram', pageUrl: 'https://www.instagram.com/reels/', trackerCount: 9, fingerprintCount: 3 },
  // netflix.com
  { id: 125, visitId: vid(), siteDomain: 'netflix.com', timestamp: hoursAgo(36), pageTitle: 'Netflix - Home', pageUrl: 'https://www.netflix.com/browse', trackerCount: 8, fingerprintCount: 2 },
  { id: 126, visitId: vid(), siteDomain: 'netflix.com', timestamp: hoursAgo(10), pageTitle: 'New & Popular - Netflix', pageUrl: 'https://www.netflix.com/latest', trackerCount: 7, fingerprintCount: 1 },
  { id: 127, visitId: vid(), siteDomain: 'netflix.com', timestamp: hoursAgo(2, 30), pageTitle: 'My List - Netflix', pageUrl: 'https://www.netflix.com/my-list', trackerCount: 5, fingerprintCount: 1 },
  // ebay.com
  { id: 128, visitId: vid(), siteDomain: 'ebay.com', timestamp: hoursAgo(34), pageTitle: 'Electronics, Cars, Fashion | eBay', pageUrl: 'https://www.ebay.com/', trackerCount: 12, fingerprintCount: 3 },
  { id: 129, visitId: vid(), siteDomain: 'ebay.com', timestamp: hoursAgo(15), pageTitle: 'MacBook Pro M4 - eBay', pageUrl: 'https://www.ebay.com/itm/123456789', trackerCount: 10, fingerprintCount: 2 },
  { id: 130, visitId: vid(), siteDomain: 'ebay.com', timestamp: hoursAgo(4), pageTitle: 'My eBay: Purchase History', pageUrl: 'https://www.ebay.com/myb/PurchHist', trackerCount: 8, fingerprintCount: 1 },
  // cnn.com
  { id: 131, visitId: vid(), siteDomain: 'cnn.com', timestamp: hoursAgo(30), pageTitle: 'CNN - Breaking News, Latest News', pageUrl: 'https://www.cnn.com/', trackerCount: 16, fingerprintCount: 4 },
  { id: 132, visitId: vid(), siteDomain: 'cnn.com', timestamp: hoursAgo(12), pageTitle: 'Politics - CNN', pageUrl: 'https://www.cnn.com/politics', trackerCount: 13, fingerprintCount: 2 },
  { id: 133, visitId: vid(), siteDomain: 'cnn.com', timestamp: hoursAgo(1, 30), pageTitle: 'Tech News - CNN Business', pageUrl: 'https://www.cnn.com/business/tech', trackerCount: 11, fingerprintCount: 2 },
  // spotify.com
  { id: 134, visitId: vid(), siteDomain: 'spotify.com', timestamp: hoursAgo(28), pageTitle: 'Spotify - Web Player', pageUrl: 'https://open.spotify.com/', trackerCount: 9, fingerprintCount: 2 },
  { id: 135, visitId: vid(), siteDomain: 'spotify.com', timestamp: hoursAgo(9), pageTitle: 'Your Library - Spotify', pageUrl: 'https://open.spotify.com/collection/playlists', trackerCount: 7, fingerprintCount: 1 },
  { id: 136, visitId: vid(), siteDomain: 'spotify.com', timestamp: hoursAgo(2, 15), pageTitle: 'Discover Weekly - Spotify', pageUrl: 'https://open.spotify.com/playlist/discover-weekly', trackerCount: 6, fingerprintCount: 1 },
  // github.com
  { id: 137, visitId: vid(), siteDomain: 'github.com', timestamp: hoursAgo(25), pageTitle: 'GitHub', pageUrl: 'https://github.com/', trackerCount: 5, fingerprintCount: 1 },
  { id: 138, visitId: vid(), siteDomain: 'github.com', timestamp: hoursAgo(7), pageTitle: 'Pull Requests · GitHub', pageUrl: 'https://github.com/pulls', trackerCount: 4, fingerprintCount: 0 },
  { id: 139, visitId: vid(), siteDomain: 'github.com', timestamp: hoursAgo(3, 10), pageTitle: 'Explore · GitHub', pageUrl: 'https://github.com/explore', trackerCount: 5, fingerprintCount: 1 },
  // medium.com
  { id: 140, visitId: vid(), siteDomain: 'medium.com', timestamp: hoursAgo(22), pageTitle: 'Medium – Where good ideas find you', pageUrl: 'https://medium.com/', trackerCount: 11, fingerprintCount: 3 },
  { id: 141, visitId: vid(), siteDomain: 'medium.com', timestamp: hoursAgo(11), pageTitle: 'The Future of Browser Privacy - Medium', pageUrl: 'https://medium.com/@author/browser-privacy-2026', trackerCount: 9, fingerprintCount: 2 },
  { id: 142, visitId: vid(), siteDomain: 'medium.com', timestamp: hoursAgo(4, 45), pageTitle: 'Your Reading List - Medium', pageUrl: 'https://medium.com/me/list/reading-list', trackerCount: 7, fingerprintCount: 1 },
  // walmart.com
  { id: 143, visitId: vid(), siteDomain: 'walmart.com', timestamp: hoursAgo(18), pageTitle: 'Walmart.com | Save Money. Live Better.', pageUrl: 'https://www.walmart.com/', trackerCount: 14, fingerprintCount: 4 },
  { id: 144, visitId: vid(), siteDomain: 'walmart.com', timestamp: hoursAgo(8, 30), pageTitle: 'Electronics - Walmart.com', pageUrl: 'https://www.walmart.com/cp/electronics/3944', trackerCount: 12, fingerprintCount: 3 },
  { id: 145, visitId: vid(), siteDomain: 'walmart.com', timestamp: hoursAgo(2, 50), pageTitle: 'Cart - Walmart.com', pageUrl: 'https://www.walmart.com/cart', trackerCount: 10, fingerprintCount: 2 },
  // bbc.com
  { id: 146, visitId: vid(), siteDomain: 'bbc.com', timestamp: hoursAgo(14), pageTitle: 'BBC - Homepage', pageUrl: 'https://www.bbc.com/', trackerCount: 13, fingerprintCount: 3 },
  { id: 147, visitId: vid(), siteDomain: 'bbc.com', timestamp: hoursAgo(6, 40), pageTitle: 'BBC News - World', pageUrl: 'https://www.bbc.com/news/world', trackerCount: 11, fingerprintCount: 2 },
  { id: 148, visitId: vid(), siteDomain: 'bbc.com', timestamp: hoursAgo(1, 50), pageTitle: 'BBC News - Technology', pageUrl: 'https://www.bbc.com/news/technology', trackerCount: 9, fingerprintCount: 1 },
  // Extra visits for density
  { id: 149, visitId: vid(), siteDomain: 'youtube.com', timestamp: hoursAgo(26), pageTitle: 'Subscriptions - YouTube', pageUrl: 'https://www.youtube.com/feed/subscriptions', trackerCount: 11, fingerprintCount: 2 },
  { id: 150, visitId: vid(), siteDomain: 'amazon.com', timestamp: hoursAgo(19), pageTitle: 'Deals of the Day - Amazon.com', pageUrl: 'https://www.amazon.com/deals', trackerCount: 14, fingerprintCount: 3 },
  { id: 151, visitId: vid(), siteDomain: 'reddit.com', timestamp: hoursAgo(32), pageTitle: 'r/programming - Dev Discussion', pageUrl: 'https://www.reddit.com/r/programming/', trackerCount: 8, fingerprintCount: 2 },
  { id: 152, visitId: vid(), siteDomain: 'twitter.com', timestamp: hoursAgo(28), pageTitle: 'Messages / X', pageUrl: 'https://twitter.com/messages', trackerCount: 7, fingerprintCount: 1 },
  { id: 153, visitId: vid(), siteDomain: 'nytimes.com', timestamp: hoursAgo(32), pageTitle: 'Science - NYTimes.com', pageUrl: 'https://www.nytimes.com/section/science', trackerCount: 11, fingerprintCount: 2 },
  { id: 154, visitId: vid(), siteDomain: 'linkedin.com', timestamp: hoursAgo(26), pageTitle: 'Messaging | LinkedIn', pageUrl: 'https://www.linkedin.com/messaging/', trackerCount: 9, fingerprintCount: 2 },
  { id: 155, visitId: vid(), siteDomain: 'instagram.com', timestamp: hoursAgo(26), pageTitle: 'Direct Messages | Instagram', pageUrl: 'https://www.instagram.com/direct/inbox/', trackerCount: 10, fingerprintCount: 2 },
  { id: 156, visitId: vid(), siteDomain: 'cnn.com', timestamp: hoursAgo(20), pageTitle: 'Health - CNN', pageUrl: 'https://www.cnn.com/health', trackerCount: 12, fingerprintCount: 3 },
  { id: 157, visitId: vid(), siteDomain: 'walmart.com', timestamp: hoursAgo(12), pageTitle: 'Grocery - Walmart.com', pageUrl: 'https://www.walmart.com/cp/food/976759', trackerCount: 11, fingerprintCount: 2 },
  { id: 158, visitId: vid(), siteDomain: 'bbc.com', timestamp: hoursAgo(10), pageTitle: 'BBC Sport - Home', pageUrl: 'https://www.bbc.com/sport', trackerCount: 10, fingerprintCount: 2 },
  { id: 159, visitId: vid(), siteDomain: 'ebay.com', timestamp: hoursAgo(22), pageTitle: 'Deals & Promotions - eBay', pageUrl: 'https://www.ebay.com/deals', trackerCount: 9, fingerprintCount: 2 },
  { id: 160, visitId: vid(), siteDomain: 'medium.com', timestamp: hoursAgo(16), pageTitle: 'Programming - Medium', pageUrl: 'https://medium.com/tag/programming', trackerCount: 8, fingerprintCount: 1 },
  { id: 161, visitId: vid(), siteDomain: 'spotify.com', timestamp: hoursAgo(16), pageTitle: 'Browse - Spotify', pageUrl: 'https://open.spotify.com/browse', trackerCount: 6, fingerprintCount: 1 },
  { id: 162, visitId: vid(), siteDomain: 'github.com', timestamp: hoursAgo(14), pageTitle: 'Trending Repositories · GitHub', pageUrl: 'https://github.com/trending', trackerCount: 4, fingerprintCount: 1 },
];

// Build a visit lookup by siteDomain for event generation
const visitsBySite = {};
DEMO_VISITS.forEach(v => {
  if (!visitsBySite[v.siteDomain]) visitsBySite[v.siteDomain] = [];
  visitsBySite[v.siteDomain].push(v);
});

function pickVisit(domain) {
  const pool = visitsBySite[domain] || DEMO_VISITS;
  return pool[Math.floor(Math.random() * pool.length)];
}

// ── TRACKING COMPANIES ──────────────────────────────────────────────────
const TRACKER_COMPANIES = [
  { company: 'Google', domain: 'google-analytics.com', category: 'Analytics', risk: 'medium', desc: 'Collects browsing behavior, session duration, and page interactions.', url: 'https://marketingplatform.google.com/about/analytics/' },
  { company: 'Google Ads', domain: 'googleads.g.doubleclick.net', category: 'Advertising', risk: 'high', desc: 'Tracks cross-site conversions and builds advertising profiles.', url: 'https://ads.google.com/' },
  { company: 'Google Tag Manager', domain: 'googletagmanager.com', category: 'Tag Manager', risk: 'medium', desc: 'Orchestrates third-party script injection and telemetry routing.', url: 'https://tagmanager.google.com/' },
  { company: 'DoubleClick', domain: 'doubleclick.net', category: 'Advertising', risk: 'high', desc: 'Real-time bidding and programmatic ad auction data exchange.', url: 'https://www.google.com/doubleclick/' },
  { company: 'Meta Pixel', domain: 'connect.facebook.net', category: 'Advertising', risk: 'high', desc: 'Tracks conversions, builds lookalike audiences, and cross-device profiles.', url: 'https://www.facebook.com/business/tools/meta-pixel' },
  { company: 'Meta CAPI', domain: 'graph.facebook.com', category: 'Analytics', risk: 'high', desc: 'Server-side API sending hashed PII for ad attribution matching.', url: 'https://developers.facebook.com/docs/marketing-api/conversions-api/' },
  { company: 'Amazon Ads', domain: 'aax-us-iad.amazon.com', category: 'Advertising', risk: 'medium', desc: 'Demand-side platform for Amazon advertising ecosystem.', url: 'https://advertising.amazon.com/' },
  { company: 'Amazon CloudFront', domain: 'd3js5inwerop5l.cloudfront.net', category: 'Content Delivery', risk: 'low', desc: 'CDN telemetry for content distribution and edge analytics.', url: 'https://aws.amazon.com/cloudfront/' },
  { company: 'Microsoft Clarity', domain: 'clarity.ms', category: 'Analytics', risk: 'high', desc: 'Session replay recording mouse movements, clicks, and scroll behavior.', url: 'https://clarity.microsoft.com/' },
  { company: 'Bing Ads', domain: 'bat.bing.com', category: 'Advertising', risk: 'medium', desc: 'Universal Event Tracking for Microsoft advertising conversions.', url: 'https://about.ads.microsoft.com/' },
  { company: 'TikTok Pixel', domain: 'analytics.tiktok.com', category: 'Advertising', risk: 'high', desc: 'Tracks user actions for TikTok ad targeting and attribution.', url: 'https://ads.tiktok.com/' },
  { company: 'Criteo', domain: 'dis.criteo.com', category: 'Advertising', risk: 'high', desc: 'Retargeting engine that follows users across the web with personalized ads.', url: 'https://www.criteo.com/' },
  { company: 'Oracle BlueKai', domain: 'tags.bluekai.com', category: 'Data Broker', risk: 'high', desc: 'Aggregates browsing data into audience segments sold to advertisers.', url: 'https://www.oracle.com/cx/advertising/' },
  { company: 'The Trade Desk', domain: 'insight.adsrvr.org', category: 'Advertising', risk: 'medium', desc: 'Programmatic RTB platform processing billions of ad impressions daily.', url: 'https://www.thetradedesk.com/' },
  { company: 'Adobe Analytics', domain: 'omtrdc.net', category: 'Analytics', risk: 'medium', desc: 'Enterprise analytics platform tracking detailed visitor interactions.', url: 'https://business.adobe.com/products/analytics.html' },
  { company: 'Hotjar', domain: 'script.hotjar.com', category: 'Analytics', risk: 'high', desc: 'Heatmaps and session recordings capturing every user interaction.', url: 'https://www.hotjar.com/' },
  { company: 'Taboola', domain: 'trc.taboola.com', category: 'Advertising', risk: 'medium', desc: 'Native advertising network with cross-site content recommendation tracking.', url: 'https://www.taboola.com/' },
  { company: 'Outbrain', domain: 'widgets.outbrain.com', category: 'Advertising', risk: 'medium', desc: 'Content discovery platform tracking reading habits for ad targeting.', url: 'https://www.outbrain.com/' },
  { company: 'AppNexus', domain: 'ib.adnxs.com', category: 'Advertising', risk: 'high', desc: 'Xandr programmatic exchange processing real-time ad auctions.', url: 'https://www.xandr.com/' },
  { company: 'Sentry', domain: 'o123456.ingest.sentry.io', category: 'Developer Tools', risk: 'low', desc: 'Error monitoring and performance tracking for web applications.', url: 'https://sentry.io/' },
  { company: 'Cloudflare', domain: 'cloudflareinsights.com', category: 'Utility', risk: 'low', desc: 'Web analytics and bot detection for site performance monitoring.', url: 'https://www.cloudflare.com/' },
  { company: 'Stripe', domain: 'r.stripe.com', category: 'Utility', risk: 'low', desc: 'Payment fraud detection telemetry for transaction security.', url: 'https://stripe.com/' },
  { company: 'Pinterest', domain: 'ct.pinterest.com', category: 'Social', risk: 'medium', desc: 'Conversion tracking for Pinterest advertising campaigns.', url: 'https://ads.pinterest.com/' },
  { company: 'Snapchat', domain: 'tr.snapchat.com', category: 'Advertising', risk: 'high', desc: 'Snap Pixel tracking user events for ad targeting on Snapchat.', url: 'https://forbusiness.snapchat.com/' },
  { company: 'LiveRamp', domain: 'idsync.rlcdn.com', category: 'Data Broker', risk: 'high', desc: 'Identity resolution service linking online/offline data to individuals.', url: 'https://liveramp.com/' },
  { company: 'Segment', domain: 'api.segment.io', category: 'Analytics', risk: 'medium', desc: 'Customer data platform aggregating events from multiple sources.', url: 'https://segment.com/' },
  { company: 'New Relic', domain: 'bam.nr-data.net', category: 'Developer Tools', risk: 'low', desc: 'Application performance monitoring and browser timing data.', url: 'https://newrelic.com/' },
  { company: 'Heap Analytics', domain: 'heapanalytics.com', category: 'Analytics', risk: 'medium', desc: 'Auto-captures every user interaction for retroactive analysis.', url: 'https://heap.io/' },
];

// ── PAYLOADS by threat vector category ───────────────────────────────────
const PII_PAYLOADS = [
  { email: 'user@protonmail.com', userName: 'j.doe_2026', profile_id: 'usr_8f4k2m' },
  { user_email: 'contact@example.org', phone: '+1-555-0199', postal_code: '94103' },
  { name: 'Jane Smith', address_line1: '742 Evergreen Terrace', zip: '90210' },
  { user_id: 'uid_29384756', gender: 'undisclosed', birth_year: '1994' },
  { profile_name: 'techuser42', email_hash: 'sha256:a3f8...b7e2', usr_segment: 'high_value' },
];

const FINGERPRINT_PAYLOADS = [
  { screenWidth: '2560', screenHeight: '1440', colorDepth: '24', devicePixelRatio: '2' },
  { platform: 'Win32', userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', hardwareConcurrency: '16' },
  { webgl_vendor: 'Google Inc. (NVIDIA)', webgl_renderer: 'ANGLE (NVIDIA, RTX 4070)', gpu_hash: 'fp_9a2c3b' },
  { canvas_hash: 'fp_a7b3c9d2e1f4', audio_hash: 'fp_3k2m8n', font_list: 'Arial,Helvetica,Roboto,Segoe UI' },
  { availWidth: '2560', availHeight: '1400', navigator_language: 'en-US', timezone: 'America/Los_Angeles' },
  { rtc_local_ip: '192.168.1.105', webrtc_fingerprint: 'sdp_v2_hash_8f3a', deviceMemory: '32' },
];

const BEHAVIOR_PAYLOADS = [
  { scrollDepth: '78%', scroll_direction: 'down', mouseX: '892', mouseY: '456', hover_element: '#product-cta' },
  { click_target: 'button.add-to-cart', click_timestamp: '1717882456000', keypress_count: '47', drag_event: 'slider' },
  { scroll_velocity: '3.2px/ms', mouse_idle_time: '12400ms', track_session_replay: 'true' },
  { keydown_sequence: 'search_query', focus_element: 'input#search', hover_duration: '2340ms' },
];

const MARKETING_PAYLOADS = [
  { utm_source: 'google', utm_medium: 'cpc', utm_campaign: 'summer_sale_2026', utm_term: 'wireless headphones' },
  { gclid: 'Cj0KCQjw8qmh...', fbclid: 'IwAR3x7z...', clickid: 'aff_92847' },
  { utm_source: 'newsletter', utm_medium: 'email', utm_campaign: 'weekly_digest', affiliate_id: 'partner_482' },
  { campaign_id: 'camp_38291', source: 'social_organic', medium: 'instagram_story', term: 'privacy_tools' },
  { utm_source: 'tiktok', utm_medium: 'paid', utm_campaign: 'brand_awareness_q2', utm_content: 'video_15s' },
];

const GENERIC_PAYLOADS = [
  { event_type: 'page_view', session_id: 'sid_8f3a2b', timestamp: Date.now().toString(), version: '3.2.1' },
  { beacon_type: 'performance', dns_time: '12ms', tcp_time: '8ms', ttfb: '142ms', page_load: '1847ms' },
  { sdk_version: '4.8.2', environment: 'production', release: 'v2.14.0', transaction: '/checkout' },
];

// Per-site tracker assignment (which companies track which sites)
const SITE_TRACKER_MAP = {
  'youtube.com':    ['Google', 'Google Ads', 'Google Tag Manager', 'DoubleClick', 'Meta Pixel', 'Criteo', 'Oracle BlueKai', 'The Trade Desk', 'AppNexus', 'Adobe Analytics', 'Hotjar', 'Sentry', 'Cloudflare', 'Segment', 'New Relic', 'Heap Analytics', 'TikTok Pixel', 'LiveRamp', 'Snapchat', 'Amazon Ads'],
  'amazon.com':     ['Google', 'Google Ads', 'Google Tag Manager', 'Meta Pixel', 'Amazon Ads', 'Amazon CloudFront', 'Criteo', 'Oracle BlueKai', 'Microsoft Clarity', 'Bing Ads', 'The Trade Desk', 'Hotjar', 'Stripe', 'Segment', 'AppNexus', 'LiveRamp', 'Pinterest', 'Taboola', 'TikTok Pixel', 'DoubleClick'],
  'reddit.com':     ['Google', 'Google Ads', 'Google Tag Manager', 'Meta Pixel', 'DoubleClick', 'Amazon Ads', 'Criteo', 'Taboola', 'Outbrain', 'Sentry', 'Cloudflare', 'Segment', 'Hotjar', 'TikTok Pixel', 'Snapchat', 'AppNexus'],
  'twitter.com':    ['Google', 'Google Ads', 'Google Tag Manager', 'Meta Pixel', 'DoubleClick', 'Amazon Ads', 'Criteo', 'The Trade Desk', 'AppNexus', 'Oracle BlueKai', 'Sentry', 'Cloudflare', 'LiveRamp', 'Snapchat', 'Hotjar'],
  'nytimes.com':    ['Google', 'Google Ads', 'Google Tag Manager', 'DoubleClick', 'Meta Pixel', 'Meta CAPI', 'Amazon Ads', 'Criteo', 'Oracle BlueKai', 'The Trade Desk', 'Adobe Analytics', 'Taboola', 'Outbrain', 'AppNexus', 'LiveRamp', 'Microsoft Clarity', 'Hotjar', 'Segment', 'TikTok Pixel', 'Pinterest'],
  'linkedin.com':   ['Google', 'Google Ads', 'Google Tag Manager', 'Meta Pixel', 'Bing Ads', 'Microsoft Clarity', 'Oracle BlueKai', 'The Trade Desk', 'AppNexus', 'Sentry', 'Cloudflare', 'Segment', 'LiveRamp', 'Hotjar', 'Snapchat'],
  'instagram.com':  ['Google', 'Google Ads', 'Google Tag Manager', 'Meta Pixel', 'Meta CAPI', 'DoubleClick', 'Criteo', 'Oracle BlueKai', 'TikTok Pixel', 'Snapchat', 'The Trade Desk', 'AppNexus', 'Sentry', 'LiveRamp', 'Adobe Analytics', 'Hotjar'],
  'netflix.com':    ['Google', 'Google Tag Manager', 'Adobe Analytics', 'Amazon CloudFront', 'Sentry', 'New Relic', 'Cloudflare', 'Segment', 'Hotjar', 'Heap Analytics'],
  'ebay.com':       ['Google', 'Google Ads', 'Google Tag Manager', 'DoubleClick', 'Meta Pixel', 'Criteo', 'Bing Ads', 'The Trade Desk', 'AppNexus', 'Oracle BlueKai', 'Stripe', 'Taboola', 'Hotjar', 'LiveRamp', 'Segment'],
  'cnn.com':        ['Google', 'Google Ads', 'Google Tag Manager', 'DoubleClick', 'Meta Pixel', 'Meta CAPI', 'Amazon Ads', 'Criteo', 'Oracle BlueKai', 'The Trade Desk', 'Adobe Analytics', 'Taboola', 'Outbrain', 'AppNexus', 'Microsoft Clarity', 'Hotjar', 'LiveRamp', 'TikTok Pixel', 'Pinterest'],
  'spotify.com':    ['Google', 'Google Tag Manager', 'Meta Pixel', 'DoubleClick', 'Amazon CloudFront', 'Sentry', 'Cloudflare', 'Segment', 'New Relic', 'Hotjar', 'Heap Analytics'],
  'github.com':     ['Google', 'Google Tag Manager', 'Sentry', 'Cloudflare', 'Segment', 'New Relic', 'Stripe'],
  'medium.com':     ['Google', 'Google Ads', 'Google Tag Manager', 'Meta Pixel', 'DoubleClick', 'Criteo', 'Taboola', 'Outbrain', 'Hotjar', 'Sentry', 'Cloudflare', 'Segment', 'Heap Analytics'],
  'walmart.com':    ['Google', 'Google Ads', 'Google Tag Manager', 'DoubleClick', 'Meta Pixel', 'Meta CAPI', 'Amazon Ads', 'Criteo', 'Oracle BlueKai', 'The Trade Desk', 'Bing Ads', 'Microsoft Clarity', 'Hotjar', 'Stripe', 'AppNexus', 'LiveRamp', 'Pinterest', 'Taboola', 'TikTok Pixel'],
  'bbc.com':        ['Google', 'Google Ads', 'Google Tag Manager', 'DoubleClick', 'Meta Pixel', 'Amazon Ads', 'Criteo', 'Oracle BlueKai', 'The Trade Desk', 'Adobe Analytics', 'Taboola', 'Outbrain', 'AppNexus', 'Microsoft Clarity', 'Hotjar', 'LiveRamp', 'Cloudflare'],
};

// ── GENERATE TRACKER EVENTS ─────────────────────────────────────────────
function generateTrackerEvents() {
  const events = [];
  const companyLookup = {};
  TRACKER_COMPANIES.forEach(c => { companyLookup[c.company] = c; });

  DEMO_SITES.forEach(site => {
    const trackerNames = SITE_TRACKER_MAP[site.domain] || [];
    const siteVisits = visitsBySite[site.domain] || [];

    trackerNames.forEach((companyName, compIdx) => {
      const tracker = companyLookup[companyName];
      if (!tracker) return;

      // Generate 1-3 events per company per site
      const eventCount = 1 + (compIdx % 3);
      for (let i = 0; i < eventCount; i++) {
        const visit = siteVisits[i % siteVisits.length] || siteVisits[0];
        if (!visit) return;

        // Spread timestamps across the visit window
        const baseTime = new Date(visit.timestamp).getTime();
        const jitter = (compIdx * 47 + i * 1300) % (15 * MINUTE);
        const ts = new Date(baseTime + jitter).toISOString();

        // Pick payload based on tracker type
        let payload = null;
        if (tracker.risk === 'high') {
          const payloadSets = [PII_PAYLOADS, FINGERPRINT_PAYLOADS, BEHAVIOR_PAYLOADS, MARKETING_PAYLOADS];
          const setIdx = (compIdx + i) % payloadSets.length;
          payload = payloadSets[setIdx][(compIdx + i) % payloadSets[setIdx].length];
        } else if (tracker.risk === 'medium') {
          const payloadSets = [FINGERPRINT_PAYLOADS, BEHAVIOR_PAYLOADS, MARKETING_PAYLOADS, GENERIC_PAYLOADS];
          const setIdx = (compIdx + i) % payloadSets.length;
          payload = payloadSets[setIdx][(compIdx + i) % payloadSets[setIdx].length];
        } else {
          payload = GENERIC_PAYLOADS[(compIdx + i) % GENERIC_PAYLOADS.length];
        }

        // Determine blocked status: ~35% of events are blocked
        const blocked = ((compIdx * 7 + i * 13) % 20) < 7;

        // Realistic sizes: POST trackers are larger
        const isPost = tracker.category === 'Advertising' || tracker.category === 'Data Broker' || (compIdx % 3 === 0);
        const size = blocked ? 0 : (isPost ? (4096 + ((compIdx * 233 + i * 89) % 28000)) : (512 + ((compIdx * 127 + i * 43) % 8000)));

        events.push({
          id: eid(),
          visitId: visit.visitId,
          visitRowId: visit.id,
          siteDomain: site.domain,
          timestamp: ts,
          trackerDomain: tracker.domain,
          company: tracker.company,
          category: tracker.category,
          risk: tracker.risk,
          description: tracker.desc,
          learnMore: tracker.url,
          requestUrl: `https://${tracker.domain}/${tracker.category === 'Advertising' ? 'collect' : tracker.category === 'Analytics' ? 'g/collect' : 'api/v3'}?tid=${site.domain}&ev=pageview&r=${Math.random().toString(36).substring(7)}`,
          payload,
          method: isPost ? 'POST' : 'GET',
          blocked,
          size,
        });
      }
    });
  });

  return events;
}

// ── GENERATE FINGERPRINT EVENTS ──────────────────────────────────────────
const FP_APIS = [
  'CanvasRenderingContext2D.getImageData',
  'CanvasRenderingContext2D.toDataURL',
  'WebGLRenderingContext.getParameter',
  'WebGLRenderingContext.getExtension',
  'WebGLRenderingContext.getSupportedExtensions',
  'WebGL2RenderingContext.getParameter',
  'AudioContext.createOscillator',
  'AudioContext.createAnalyser',
  'AudioContext.createDynamicsCompressor',
  'navigator.getBattery',
  'navigator.deviceMemory',
  'navigator.hardwareConcurrency',
  'navigator.connection.effectiveType',
  'screen.colorDepth',
  'screen.availWidth',
  'screen.orientation.type',
  'MediaDevices.enumerateDevices',
  'RTCPeerConnection.createDataChannel',
  'Intl.DateTimeFormat.resolvedOptions',
  'performance.memory.usedJSHeapSize',
];

function generateFingerprintEvents() {
  const events = [];

  DEMO_SITES.forEach((site, sIdx) => {
    const siteVisits = visitsBySite[site.domain] || [];
    // Sites with higher tracker counts get more FP events
    const fpCount = Math.max(2, Math.min(8, Math.floor(site.totalTrackers / 5)));

    for (let i = 0; i < fpCount; i++) {
      const visit = siteVisits[i % siteVisits.length] || siteVisits[0];
      if (!visit) continue;

      const baseTime = new Date(visit.timestamp).getTime();
      const jitter = (sIdx * 89 + i * 2300) % (10 * MINUTE);
      const ts = new Date(baseTime + jitter).toISOString();

      const api = FP_APIS[(sIdx * 3 + i) % FP_APIS.length];

      events.push({
        id: eid(),
        visitId: visit.visitId,
        visitRowId: visit.id,
        siteDomain: site.domain,
        timestamp: ts,
        api,
        stack: `at ${api.split('.')[0]}.${api.split('.').pop()} (https://${site.domain}/assets/vendor.js:${1000 + sIdx * 100 + i * 47}:${12 + i * 3})\n    at Object.collect (https://${site.domain}/assets/analytics.js:${200 + i * 30}:8)\n    at HTMLDocument.<anonymous> (https://${site.domain}/:1:1)`,
      });
    }
  });

  return events;
}

// ── EXPORT ───────────────────────────────────────────────────────────────
const DEMO_TRACKER_EVENTS = generateTrackerEvents();
const DEMO_FINGERPRINT_EVENTS = generateFingerprintEvents();

export function getDemoData() {
  return {
    sites: DEMO_SITES,
    visits: DEMO_VISITS,
    trackerEvents: DEMO_TRACKER_EVENTS,
    fingerprintEvents: DEMO_FINGERPRINT_EVENTS,
    archives: [],
  };
}
