module.exports = {
  facebook : {
    clientID     : 'fb client id',
    clientSecret  : 'client secret',
    callbackURL     : 'http://localhost:4000/api/auth/facebook/callback',
    profileURL: 'https://graph.facebook.com/v2.5/me?fields=first_name,last_name,email'

  },
  google : {
    clientID: 'client id',
    clientSecret     : 'your-client-secret-here',
    callbackURL      : 'http://localhost:4000/auth/google/callback'
  }
};