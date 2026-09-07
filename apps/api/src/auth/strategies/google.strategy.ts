import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Profile, Strategy } from "passport-google-oauth20";
import { AuthService } from "../auth.service";
import type { GoogleAuthenticatedUser } from "../types/authenticated-user.interface";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
  constructor(private readonly authService: AuthService) {
    const clientID = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const callbackURL = process.env.GOOGLE_CALLBACK_URL;
    if (!clientID || !clientSecret || !callbackURL) {
      throw new Error(
        "GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET and GOOGLE_CALLBACK_URL must all be set",
      );
    }
    super({
      clientID,
      clientSecret,
      callbackURL,
      scope: ["email", "profile"],
    });
  }

  // @nestjs/passport's PassportStrategy wraps this itself: it awaits
  // whatever validate() returns and calls passport's done() with that value
  // (or with a thrown error). validate() must NOT also call a done callback
  // itself — doing so double-calls done(), and the wrapper's own follow-up
  // call (with validate()'s actual return value, i.e. undefined, since
  // nothing was returned) silently wins over the manual one.
  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
  ): Promise<GoogleAuthenticatedUser> {
    const email = profile.emails?.[0]?.value;
    if (!email) {
      throw new UnauthorizedException("Google account has no email");
    }

    return this.authService.loginOrLinkGoogleUser(profile.id, email);
  }
}
