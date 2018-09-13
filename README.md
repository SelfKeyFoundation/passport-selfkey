# passport-selfkey

[Passport](http://passportjs.org/) strategy for authenticating using Login with SelfKey.

This is the passport strategy for integrating Login with SelfKey authentication for NodeJS apps.  Reasonably simple to integrate with standard NodeJS middleware including [Connect](http://www.senchalabs.org/connect/) and [Express](http://expressjs.com/).

## Install

```bash
$ npm install passport-selfkey
```

## Usage

#### Configure Strategy

The Login with SelfKey strategy authenticates users using a nonce, signature and ethereum address public key.  You will need to include the [selfkey.js library](https://github.com/SelfKeyFoundation/selfkey.js) to perform the signature verification.  This strategy requires a `verify` callback, which accepts these credentials and calls `done` providing a user.  The request object is passed as the first argument. 

```js
const selfkey = require('selfkey.js')
const SelfKeyStrategy = require('passport-selfkey').Strategy

/**
 * Login with SelfKey Passport Config
 */
passport.use(new SelfKeyStrategy((req, nonce, signature, publicKey, done) => {
  // if the signature verification succeeds
  if (selfkey.verifySignature(nonce, signature, publicKey)) {
    // find user with existing wallet
    User.findOne({wallet: publicKey}, (err, existingUser) => {
      if (err) return done(err) 
      // if a wallet is found then add token to user object
      if (existingUser) {
        const token = generateToken()
        User.update({wallet: publicKey}, {token: token}, (err, user) => {
          if (err) return done(err)
          return done(null, user)
        })
      } else {
        // no user with this address
        return done(null, false)
      }
    })
  } else {
    // verification fails
    return done(null, false)
  }
}))
```

#### Authenticate Requests

Use `passport.authenticate()`, specifying the `'selfkey'` strategy, to authenticate requests.

For example, as route middleware in an [Express](http://expressjs.com/) application:

```js
app.post('/auth/selfkey', passport.authenticate('selfkey', {session: false}), (req, res) => {
  return res.status(200).json({message: 'Is Authenticated', successUrl: 'https://example.com/success.html'})
})
```

## License
SelfKey Passport Library    
Copyright (c) 2018 SelfKey Foundation [https://selfkey.org/](https://selfkey.org/)

[The GPL-3.0 License](http://opensource.org/licenses/GPL-3.0)

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
