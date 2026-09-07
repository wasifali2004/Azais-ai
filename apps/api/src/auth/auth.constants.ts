/** Credits granted to a new account on signup — matches the product's free-trial offer. */
export const SIGNUP_BONUS_CREDITS = 8;

/** bcrypt cost factor. 12 is the current OWASP-recommended minimum. */
export const BCRYPT_SALT_ROUNDS = 12;

/** How long an email verification token stays valid. */
export const VERIFICATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;
