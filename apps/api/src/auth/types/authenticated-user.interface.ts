import type { PlanTier } from "../../generated/prisma/enums";

export interface AuthenticatedUser {
  id: string;
  email: string;
  plan: PlanTier;
}

export interface JwtPayload {
  sub: string;
  email: string;
}

/** The shape passed through by GoogleStrategy.validate() as req.user. */
export interface GoogleAuthenticatedUser {
  id: string;
  email: string;
  plan: PlanTier;
  creditBalance: number;
  isVerified: boolean;
}
