const jwt = require('jsonwebtoken');
const User = require('../schemas/User');
const key = require('../../config/secret');
const axios = require('axios');
const urls = require('../../config/urls');
const get = require('lodash/get');


const env = process.env.ENVIRONMENT || 'development';
const baseUrlOfApplication = get(urls.application,env,urls.application.development);

function tokenForUser(user) {
  return jwt.sign({ id: user.id, role: user.role,name:user.name }, key, {expiresIn:'30d'});
}

function tokenForVerifyOrResetPassword(user) {
  return jwt.sign({user}, key , {expiresIn:'12h'})
}

exports.signIn = function(req, res, next) {
  res.send({
    token: tokenForUser(req.user)
  });
}

exports.signUp = function(req, res, next) {
  const email = req.body.email;
  const password = req.body.password;
  const name = req.body.name;
  const surname = req.body.surname;


  if (!email || !password) {
    return res.status(400).send('You must provide email and password');
  }

  User.findOne({ email: email }, function(err, existingUser) {
    if (err) { return next(err); }
    if (existingUser) {
      return res.status(400).send('Looks like you already have account');
    }

    const user = new User({
      email: email,
      password: password,
      name: name,
      surname: surname,
      verified: false
    });

    user.save(function(err) {
      if (err) {
        return next(err);
      }

      let payload = {};
      payload.user = user;

      const token = tokenForVerifyOrResetPassword(user);

      // handle email services here

      const options = {
        smtpPreference: '',
        link: `${baseUrlOfApplication}/verify-user?token=${token}`,
        emailOfUser: email,
        type: 'verifyUser',
      };
  /*
      axios.post(`${urls.emailService}/api/email/send`,{options})
        .then(response=> {
          res.send(response.data)
        })
        .catch(err=>{
          res.send(err.data);
        });*/

    });
  });
}

exports.forgotPassword = function(req,res,next) {
  const email = req.body.email;
  User.findOne({email:email}, function(err,existingUser) {
    if (err) { return next(err); }
    if(!existingUser) {
      return res.status(401).send('No user with this e-mail');
    }
    const token = tokenForVerifyOrResetPassword(existingUser);

    // handle email services here

    const options = {
      smtpPreference: '',
      link: `${baseUrlOfApplication}/forgot-password?token=${token}`,
      emailOfUser: email,
      type: 'forgotPassword',
    };
    /*
        axios.post(`${urls.emailService}/api/email/send`,{options})
          .then(response=> {
            res.send(response.data)
          })
          .catch(err=>{
            res.send(err.data);
          });*/
  })
}

exports.resetPassword = function(req,res,next) {
  const resetPasswordToken = req.params.resetPasswordToken;
  jwt.verify(resetPasswordToken, key, function(err,decoded){
    if(err) {
      return res.status(401).send('Token is invalid or expired');
    }
    else {
      const newPassword = req.body.password;
      const userId = decoded.user._id;
      if(newPassword){
        User.findById({"_id": userId})
          .exec()
          .then((user) => {
              user.verified = true;
              user.password = newPassword;
              user.save()
                .then(() => {
                  return res.send('Password updated')
                })
                .catch((err) => next(err));

          })
          .catch((err) => next(err));
      }
      else {
        return res.send('Reset password token verified. Reset password step.')
      }
    }
  })
}


exports.verifyUser = function(req,res,next) {
  const token = req.params.token;
  jwt.verify(token,key,function(err,decoded){
    if(err){
      if(err) {
        if(err.name === 'TokenExpiredError') {
         return res.status(401).send('Link for verifying account is expired')
        }
        else {
          return res.status(404).send('Invalid token')
        }
      }
    }
    else{
      const userId = decoded.user._id;
      User.findById({"_id": userId})
        .exec()
        .then((user) => {
          if(user.verified) {
            res.status(400).send('User is already verified');
          }
          else {
            user.verified = true;
            user.save()
              .then(() => {
                res.send('Verified')
              })
              .catch((err) => next(err));
          }
        })
        .catch((err) => next(err));
    }
  });
}

exports.checkAuthentication = function(req,res,next) {
  const token = req.body.token;
  jwt.verify(token,key,function(err,decoded){
    if(err) {
      res.status(401);
      res.send('Not authenticated');
    }
    else {
      res.send('Authenticated');
    }
  })
}

exports.facebookAuthentication =   function(req, res, next) {
  if (!req.user) {
    return res.status(401).send('User Not Authenticated');
  }
  req.auth = {
    id: req.user.id
  };

  next();
};




exports.googleAuthentication =   function(req, res, next) {
  if (!req.user) {
    return res.status(401).send('User Not Authenticated');
  }
  req.auth = {
    id: req.user.id
  };

  next();
};
