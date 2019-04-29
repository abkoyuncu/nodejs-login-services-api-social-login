const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  surname: {
    type: String,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
  },
  creationDate: {
    type: Date,
    default: Date.now()
  },
  verified: {
    type: Boolean,
    default: false
  },
  facebookProvider: {
    type: {
      facebookName: String,
      id: String,
      token: String
    },
    select: false
  },
  googleProvider: {
    type: {
      googleName: String,
      id: String,
      token: String
    },
    select: false
  }
});


UserSchema.pre('save', function (next) {
  const user = this;
  if (!user.isModified('password')) return next();

  bcrypt.genSalt(10, (err, salt) => {
    if (err) { return next(err); }

    bcrypt.hash(user.password, salt, null, (err, hash) => {
      if (err) { return next(err); }

      user.password = hash;
      next();
    });
  });
});



UserSchema.methods.comparePassword = function (candidatePassword, callback) {
  bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
    if (err) {
      return callback(err); }

    callback(null, isMatch);
  });
};


UserSchema.statics.upsertGoogleUser = function(accessToken, refreshToken, profile, cb) {
  const that = this;
  return this.findOne({
    'googleProvider.id': profile.id
  }, function(err, user) {
    if (!user) {
      const names = splitNameSurnameForSocialLogin(profile.displayName);

      const newUser = new that({
        name: names[0],
        surname: names[1],
        email: profile.emails[0].value,
        googleProvider: {
          googleName: profile.displayName,
          id: profile.id,
          token: accessToken
        },
        role: roles.user,
        verified: true
      });

      newUser.save(function(error, savedUser) {
        if (error) {
          console.log(error);
        }
        return cb(error, savedUser);
      });
    } else {
      return cb(err, user);
    }
  });
};




UserSchema.statics.upsertFbUser = function(accessToken, refreshToken, profile, cb) {
  const that = this;
  return this.findOne({
    'facebookProvider.id': profile.id
  }, function(err, user) {
    if (!user) {
      const names = splitNameSurnameForSocialLogin(profile.displayName);
      const newUser = new that({
        name: names[0],
        surname: names[1],
        email: profile.emails[0].value,
        facebookProvider: {
          facebookName: profile.displayName,
          id: profile.id,
          token: accessToken
        },
        role: roles.user,
        verified: true
      });

      newUser.save(function(error, savedUser) {
        if (error) {
          console.log(error);
        }
        return cb(error, savedUser);
      });
    } else {
      return cb(err, user);
    }
  });
};


const splitNameSurnameForSocialLogin = function(fullName) {
  return fullName.split(/ (.*)/);
}

module.exports = mongoose.model('User', UserSchema);

