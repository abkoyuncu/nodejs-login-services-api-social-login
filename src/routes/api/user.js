const authenticationService = require('../../controllers/userAuthentication');
const passwordService = require('../../controllers/userPassport');
const passport = require('passport');

const requireLocalSignin = passport.authenticate('local', { session: false });
const requireFbSignin = passport.authenticate('facebook-token', {session: false});
const requireGoogleSignin = passport.authenticate('google-token',{session:false});

module.exports = (app) => {

  app.post('/api/user/signin', requireLocalSignin, authenticationService.signIn);
  app.post('/api/user/signup', authenticationService.signUp);
  app.post('/api/user/checkAuthentication', authenticationService.checkAuthentication);
  app.put('/api/user/verifyUser/:token', authenticationService.verifyUser);
  app.post('/api/user/forgotPassword', authenticationService.forgotPassword);
  app.post('/api/user/resetPassword/:resetPasswordToken', authenticationService.resetPassword);
  app.post('/api/user/facebookAuthentication', requireFbSignin, authenticationService.facebookAuthentication , authenticationService.signIn);
  app.post('/api/user/googleAuthentication', requireGoogleSignin, authenticationService.googleAuthentication , authenticationService.signIn);


};