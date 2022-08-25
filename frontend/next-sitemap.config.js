/** @type {import('next-sitemap').IConfig} */
const config = {
  siteUrl: process.env.SITE_URL || 'https://cutopia.app',
  generateRobotsTxt: true, // (optional)
  outDir: 'build',
  // ...other options
};

module.exports = config;
