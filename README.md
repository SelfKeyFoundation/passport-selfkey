# passport-selfkey

[Passport](http://passportjs.org/) strategy for authenticating using Login with SelfKey.

This is the passport strategy for integrating Login with SelfKey authentication for NodeJS apps.  Reasonably simple to integrate with standard NodeJS middleware including [Connect](http://www.senchalabs.org/connect/) and [Express](http://expressjs.com/).

## Install

```bash
$ npm i --save passport-selfkey selfkey.js
```

## Usage

#### Configure Strategy

The Login with SelfKey strategy authenticates users using a nonce, signature and public key.  You will need to include the [selfkey.js library](https://github.com/altninja/selfkey.js) to perform the signature verification.  This strategy requires a `verify` callback, which accepts these credentials and calls `done` providing a user.

```js
const selfkey = require('selfkey.js')
const SelfKeyStrategy = require('passport-selfkey').Strategy

/**
 * Login with SelfKey Passport Config
 */
passport.use(new SelfKeyStrategy((nonce, signature, pubKey, done) => {
  User.findOne({nonce: nonce}, (err, user) => {
    if (err) return done(err)
    if (!user) return done(null, false, {msg: 'Nonce not found'})
    var match = selfkey.verifySignature(nonce, signature, pubKey)
    if (match) return done(null, user)
    return done(null, false, {msg: 'Invalid Credentials'})
  })
}))
```

#### Authenticate Requests

Use `passport.authenticate()`, specifying the `'selfkey'` strategy, to authenticate requests.

For example, as route middleware in an [Express](http://expressjs.com/) application:

```js
  router.get('/auth/selfkey', passport.authenticate('selfkey', { failureRedirect: '/signup' }), (req, res) => {
    res.redirect('/success')
  })
```


## License

[The MIT License](http://opensource.org/licenses/MIT)

Copyright (c) 2018 SelfKey Foundation <[https://selfkey.org/](https://selfkey.org/)>
