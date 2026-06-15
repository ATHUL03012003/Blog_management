// Max session length from login (e.g. opening the site the next day requires sign-in again).
export const SESSION_MAX_AGE_MS = 24 * 60 * 60 * 1000;

// Log out after this period without visiting or interacting with the site.
export const SESSION_INACTIVITY_MS = 30 * 60 * 1000;

// How often to re-check inactivity while the app is open.
export const SESSION_CHECK_INTERVAL_MS = 60 * 1000;
