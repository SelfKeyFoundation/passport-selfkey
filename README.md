# passport-selfkey

[Passport](http://passportjs.org/) strategy for authenticating using Login with SelfKey.

This module lets you authenticate using Login with SelfKey in your Node.js
applications.  Connect with Passport using Login with SelfKey authentication can be easily added to middleware like [Connect](http://www.senchalabs.org/connect/) and [Express](http://expressjs.com/).

## Install

```bash
$ npm install passport-selfkey
```

## Usage

#### Configure Strategy

The Login with SelfKey strategy authenticates users using a signature and
public key.  The strategy requires a `verify` callback, which accepts these
credentials and calls `done` providing a user.

```js
passport.use(new SelfKeyStrategy(
  function(signature, pubKey, done) {
    User.findOne({ value: nonce }, function (err, user) {
      if (err) { return done(err); }
      if (!user) { return done(null, false); }
      if (!user.verifySignature(signature)) { return done(null, false); }
      return done(null, user);
    });
  }
));
```

#### Authenticate Requests

Use `passport.authenticate()`, specifying the `'selfkey'` strategy, to
authenticate requests.

For example, as route middleware in an [Express](http://expressjs.com/)
application:

```js
app.post('/login', 
  passport.authenticate('selfkey', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });
```


## License

[The MIT License](http://opensource.org/licenses/MIT)

Copyright (c) 2018 SelfKey Foundation <[https://selfkey.org/](https://selfkey.org/)>
