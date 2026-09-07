/** Credits granted to a new account on signup — matches the product's free-trial offer. */
export const SIGNUP_BONUS_CREDITS = 8;

/** bcrypt cost factor. 12 is the current OWASP-recommended minimum. */
export const BCRYPT_SALT_ROUNDS = 12;

/** How long an email verification code stays valid. */
export const VERIFICATION_CODE_TTL_MS = 10 * 60 * 1000;

/** Minimum time between resend-code requests for the same email. */
export const RESEND_CODE_COOLDOWN_MS = 60 * 1000;
