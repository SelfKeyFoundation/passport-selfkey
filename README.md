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
  console.log(pubKey)
  // check for an existing session
  if (req.user) {
    // query db for matching pubkey
    User.findOne({'selfkey.wallets.pubKey': pubKey}, (err, existingUser) => {
      if (err) { return done(err) }
      // if a pubkey exists verify the signature
      if (existingUser) {
        var match = selfkey.verifySignature(challenge, signature, pubKey)
        if (match) {
          return done(null, existingUser)
        }
        return done(null, false, {msg: 'Invalid Credentials'})
      } else {
        // search by session user id
        User.findById(req.user.id, (err, user) => {
          if (err) { return done(err) }
          User.update({'selfkey.wallets.pubKey': pubKey},{ 
            'selfkey.wallets.$.first_name': req.query.first_name,
            'selfkey.wallets.$.middle_name': req.query.middle_name,
            'selfkey.wallets.$.last_name': req.query.last_name,
            'selfkey.wallets.$.email': req.query.email,
            'selfkey.wallets.$.country_of_residency': req.query.country_of_residency
          }, (err, result) => {
            req.flash('info', { msg: 'SelfKey ID has been linked.' })
            done(err, user)
          })    
        })
      }
    })
  } else {
    // if no session exists
    User.findOne({'selfkey.wallets.pubKey': pubKey}, (err, existingUser) => {
      if (err) { return done(err) }
      // check for matching user and verify signature and update user object
      if (existingUser) {
        var match = selfkey.verifySignature(challenge, signature, pubKey)
        if (match) {
          User.update({'selfkey.wallets.pubKey': pubKey},{ 
            'selfkey.wallets.$.first_name': req.query.first_name,
            'selfkey.wallets.$.middle_name': req.query.middle_name,
            'selfkey.wallets.$.last_name': req.query.last_name,
            'selfkey.wallets.$.email': req.query.email,
            'selfkey.wallets.$.country_of_residency': req.query.country_of_residency
          }, (err, result) => {
            req.flash('info', { msg: 'SelfKey ID has been linked.' })
            return done(null, existingUser)
          })    
        }     
      } else {
        // make a new user
        const 
          challenge = selfkey.newChallenge(256)
          newUser = {
            'selfkey.wallets': 
              {
                challenge: challenge, 
                pubKey: pubKey,
                first_name: req.query.first_name,
                middle_name: req.query.middle_name,
                last_name: req.query.last_name,
                email: req.query.email,
                country_of_residency: req.query.country_of_residency
              } 
            }
        console.log(newUser)
        User.create(newUser, err => {
          done(err, user)
        })
      }
    })
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
