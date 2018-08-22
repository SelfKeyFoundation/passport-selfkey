'use strict'

const passport = require('passport-strategy')
const util = require('util')

/**
 * `Strategy` constructor.
 *
 * The Login with SelfKey authentication strategy authenticates requests based on the
 * credentials submitted through a request from the Login with SelfKey Browser Web Extension.
 *
 * Applications must supply a `verify` callback which accepts `nonce`, `signature` and
 * `pubKey` credentials, and then calls the `done` callback supplying a
 * `user`, which should be set to `false` if the credentials are not valid.
 * If an exception occurred, `err` should be set.
 *
 *
 * Example:
 *
 *     passport.use(new SelfKeyStrategy(
 *       function(req, nonce, signature, pubKey, done) {
 *         verifySignature({nonce: nonce, signature: signature, pubKey: pubKey}, function (err, user) {
 			if (err) return err
 *           done(null, user)
 *         })
 *       }
 *     ))
 *
 * @param {Function} verify
 * @api public
 */

 passport.use(new SelfKeyStrategy((req, nonce, signature, pubKey, done) => {
	// if the signature verification succeeds
	if (selfkey.verifySignature(nonce, signature, pubKey)) {
		// find user with existing wallet
		User.findOne({wallet: pubKey}, (err, existingUser) => {
			if (err) return done(err) 
			// if a wallet is found then add token to user object
			if (existingUser) {
				const token = generateToken()
				User.update({wallet: pubKey}, {token: token}, (err, user) => {
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
function Strategy(verify) {
	if (!verify) throw new TypeError('SelfKey Strategy requires a verify callback')
	passport.Strategy.call(this)
	this.name = 'selfkey'
	this._verify = verify
}

util.inherits(Strategy, passport.Strategy)

/**
 * Authenticate request based on the login with selfkey request
 *
 * @api protected
 */
Strategy.prototype.authenticate = function(req) {
	if (!req.body.nonce || !req.body.signature || !req.body.pubKey) {
		return this.fail({ message: 'Missing credentials' }, 400)
	}
	const self = this
	function verified(err, user, info) {
		if (err) { return self.error(err) }
		if (!user) { return self.fail(info) }
		self.success(user, info)
	}
	try {
		this._verify(req, req.body.nonce, req.body.signature, req.body.pubKey, verified)
	} catch (ex) {
		return self.error(ex)
	}
}

module.exports = Strategy
