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
passport.use(new SelfKeyStrategy((req, challenge, signature, pubKey, done) => {
  // if the verification succeeds
  if (selfkey.verifySignature(challenge, signature, pubKey)) {
    // check if ession exists
    if (req.user) {
      // find user with existing wallet
      User.findOne({'selfkey.wallets.pubKey': pubKey}, (err, existingUser) => {
        if (err) { return done(err) }
        // if a wallet is found then  
        if (existingUser) {
            // handle UI message
            req.flash('info', { msg: 'Login with SelfKey ID successful' })
            // handle authentication
            return done(null, existingUser)       
        } else {
          // search by session user id
          User.findOne({_id: req.user.id}, (err, user) => {
            if (err) { return done(err) }
              // update existing user
              User.update({_id: req.user.id}, {
                $addToSet: {
                  'selfkey.wallets': {
                    pubKey: pubKey, 
                    first_name: req.query.first_name,
                    middle_name: req.query.middle_name,
                    last_name: req.query.last_name,
                    email: req.query.email || '',
                    country_of_residency: req.query.country_of_residency
                  }
                }
              }, (err, result) => {
                if (err) { return done(err) }
                User.findOne({_id: req.user.id}, (err, user) => {
                  if (err) { return done(err) }
                  req.flash('info', { msg: 'SelfKey ID has successfully been linked to your account' })
                  return done(err, user)
                })
              })  
          })
        }
      })
    // no session exists
    } else {
      // find user with existing wallet
      User.findOne({'selfkey.wallets.pubKey': pubKey}, (err, existingUser) => {
        if (err) { return done(err) }
        // if a wallet is found then verify the signature handle authentication
        if (existingUser) {
          req.flash('info', { msg: 'Login with SelfKey ID successful' })
          return done(null, existingUser)
        } else {
          // make a new user
          const newUser = {
              'selfkey.wallets': 
                {
                  pubKey: pubKey,
                  first_name: req.query.first_name,
                  middle_name: req.query.middle_name,
                  last_name: req.query.last_name,
                  email: req.query.email || '',
                  country_of_residency: req.query.country_of_residency
                } 
              }
          User.create(newUser, (err, user) => {
            if (err) { return done(err) }
            req.flash('info', { msg: 'New account with SelfKey ID has successfully been created' })
            return done(err, user)
          })
        }
      })
    }
  
  } else {
    // return error message if verification fails
    return done(null, false, {msg: 'Invalid Credentials'})
  }
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
