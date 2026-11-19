import base from './playwright.config.js'
export default { ...base, testDir: "./tests", projects: base.projects.map((p) => ({ ...p, use: { ...p.use, launchOptions: { executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] } } })) }
