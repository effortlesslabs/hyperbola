export enum ErrorCode {
  Unauthorized = "Unauthorized",
  ServerMisconfigured = "ServerMisconfigured",
  InvalidTokenNoSub = "InvalidTokenNoSub",
  TokenExpired = "TokenExpired",
  InvalidOrExpiredToken = "InvalidOrExpiredToken",
  UserNotFound = "UserNotFound",
  MissingRefreshToken = "MissingRefreshToken",
  InvalidRefreshToken = "InvalidRefreshToken",
  RefreshTokenExpired = "RefreshTokenExpired",
  NoLinkedProvider = "NoLinkedProvider",
  UnsupportedProvider = "UnsupportedProvider",
}

export const errorMessages: Record<ErrorCode, string> = {
  [ErrorCode.Unauthorized]: "Authorization header missing or malformed.",
  [ErrorCode.ServerMisconfigured]: "Server misconfiguration: missing JWT secret.",
  [ErrorCode.InvalidTokenNoSub]: "Invalid token: subject (sub) claim missing.",
  [ErrorCode.TokenExpired]: "Your session has expired. Please log in again.",
  [ErrorCode.InvalidOrExpiredToken]: "Invalid or expired token.",
  [ErrorCode.UserNotFound]: "User not found.",
  [ErrorCode.MissingRefreshToken]: "Missing refreshToken.",
  [ErrorCode.InvalidRefreshToken]: "Invalid refresh token.",
  [ErrorCode.RefreshTokenExpired]: "Refresh token expired.",
  [ErrorCode.NoLinkedProvider]: "No linked provider found for user.",
  [ErrorCode.UnsupportedProvider]: "Unsupported provider.",
};

import type { Context } from "hono";

export function errorResponse(c: Context, code: ErrorCode, status: number): Response {
  return c.json({ error: code, message: errorMessages[code] }, status as any);
}
