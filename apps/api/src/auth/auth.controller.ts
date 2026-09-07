import { Controller, Get, Body, HttpCode, HttpStatus, Post, Req, Res, UseGuards } from "@nestjs/common";
import { Throttle, seconds } from "@nestjs/throttler";
import type { Request, Response } from "express";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { Public } from "../common/decorators/public.decorator";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { ResendCodeDto } from "./dto/resend-code.dto";
import { SignupDto } from "./dto/signup.dto";
import { VerifyEmailDto } from "./dto/verify-email.dto";
import { GoogleAuthGuard } from "./guards/google-auth.guard";
import type { AuthenticatedUser, GoogleAuthenticatedUser } from "./types/authenticated-user.interface";

const AUTH_THROTTLE = { default: { limit: 5, ttl: seconds(60) } };
const CODE_THROTTLE = { default: { limit: 10, ttl: seconds(60) } };

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Throttle(AUTH_THROTTLE)
  @Post("signup")
  signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto);
  }

  @Public()
  @Throttle(CODE_THROTTLE)
  @HttpCode(HttpStatus.OK)
  @Post("verify-email")
  verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto.email, dto.code);
  }

  @Public()
  @Throttle(CODE_THROTTLE)
  @HttpCode(HttpStatus.OK)
  @Post("resend-code")
  resendCode(@Body() dto: ResendCodeDto) {
    return this.authService.resendCode(dto.email);
  }

  @Public()
  @Throttle(AUTH_THROTTLE)
  @HttpCode(HttpStatus.OK)
  @Post("login")
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get("me")
  me(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.getProfile(user.id);
  }

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get("google")
  googleLogin() {
    // Passport's GoogleStrategy intercepts this request and redirects to
    // Google's consent screen before this handler body ever runs.
  }

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get("google/callback")
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    // GoogleAuthGuard already redirected to /login?error=... on failure.
    if (res.headersSent) return;

    const user = req.user as GoogleAuthenticatedUser;
    const { accessToken } = await this.authService.buildAuthResponse(user);

    const frontendUrl = process.env.FRONTEND_URL ?? "http://localhost:3000";
    res.redirect(`${frontendUrl}/auth/callback?token=${accessToken}`);
  }
}
