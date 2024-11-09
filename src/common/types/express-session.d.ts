import "express-session";

declare module "express-session" {
  interface SessionData {
    message?: { type: string; text: string };
  }
}