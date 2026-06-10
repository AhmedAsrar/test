/**
 * Login credentials for the Pulse Digital Twin application.
 * Values can be overridden via environment variables so secrets do not have to
 * live in source control:
 *   PULSE_USERNAME, PULSE_PASSWORD
 */
export const VALID_USER = {
  username: process.env.PULSE_USERNAME ?? 'aahamed@alectechnologies.com',
  password: process.env.PULSE_PASSWORD ?? 'Adroit@123',
};

export const INVALID_USER = {
  username: 'wrong.user@alectechnologies.com',
  password: 'WrongPassword!1',
};
