const passport = require('passport');
const User = require('../schemas/User');
const key = require('../../config/secret');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const LocalStrategy = require('passport-local');
const FacebookTokenStrategy = require('passport-facebook-token');
const GoogleTokenStrategy = require('passport-google-token').Strategy;
const socialLoginConfig = require('../../config/socialLogin');

const localOptions = {
  usernameField: 'email'
};
const localLogin = new LocalStrategy(localOptions, (email, password, done) => {
  User.findOne({
    email: email
  }, (err, user) => {
    if (err) {
      return done(err);
    }
    if (!user) {
      return done(null, false);
    }

    user.comparePassword(password, (err, isMatch) => {
      if (err) {
        return done(err);
      }
      if (!isMatch) {
        return done(null, false);
      }
      else {
        if(user.verified!=true) {
          return done(null,false)
        }
      }
        return done(null, user);
    });
  });
});

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromHeader('authorization'),
  secretOrKey: key
};

const jwtLogin = new JwtStrategy(jwtOptions, (payload, done) => {
  User.find({ id: payload.sub }, (err, user) => {
    if (err) {
      return done(err, false);
    }

    if (user) {
      done(null, user);
    } else {
      done(null, false);
    }
  });
});

const facebookLogin = new FacebookTokenStrategy({
    clientID: socialLoginConfig.facebook.clientID,
    clientSecret: socialLoginConfig.facebook.clientSecret
  },
  function (accessToken, refreshToken, profile, done) {
    User.upsertFbUser(accessToken, refreshToken, profile, function(err, user) {
      return done(err, user);
    });
});

const googleLogin = new GoogleTokenStrategy({
    clientID: socialLoginConfig.google.clientID,
    clientSecret: socialLoginConfig.google.clientSecret
  },
  function (accessToken, refreshToken, profile, done) {
    User.upsertGoogleUser(accessToken, refreshToken, profile, function(err, user) {
      return done(err, user);
    });
});

passport.use(jwtLogin);
passport.use(facebookLogin);
passport.use(googleLogin);
passport.use(localLogin);
