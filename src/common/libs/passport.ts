// import passport from "passport";
// import { Strategy as GoogleStrategy, Profile } from "passport-google-oauth20";
// import dotenv from "dotenv";
// import AuthService from "../../modules/auth/auth.service"; // Adjust the path to where your AuthService is located

// dotenv.config();

// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: process.env.GOOGLE_CLIENT_ID as string,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
//       callbackURL: "http://localhost:3000/auth/google/callback",
//     },
//     async (accessToken: string, refreshToken: string, profile: Profile, done: Function) => {
//       try {
//         const { token, user } = await AuthService.loginGoogle(profile);
//         done(null, { token, user });
//       } catch (error) {
//         done(error, null);
//       }
//     }
//   )
// );

// passport.serializeUser((user, done) => {
//   done(null, user);
// });

// passport.deserializeUser((obj: any, done) => {
//   done(null, obj);
// });

// export default passport;
