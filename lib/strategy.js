'use strict'

const passport = require('passport-strategy')
const util = require('util')
const lookup = require('./utils').lookup

/**
 * `Strategy` constructor.
 *
 * The Login with SelfKey authentication strategy authenticates requests based on the
 * credentials submitted through a request from the Login with SelfKey Browser Web Extension.
 *
 * Applications must supply a `verify` callback which accepts `signature` and
 * `pubKey` credentials, and then calls the `done` callback supplying a
 * `user`, which should be set to `false` if the credentials are not valid.
 * If an exception occurred, `err` should be set.
 *
 *
 * Example:
 *
 *     passport.use(new SelfKeyStrategy(
 *       function(signature, pubKey, done) {
 *         authenticateUserFunction({signature: signature, pubKey: pubKey}, function (err, user) {
 *           done(err, user)
 *         })
 *       }
 *     ))
 *
 * @param {Function} verify
 * @api public
 */
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
	if (!req.query.challenge || !req.query.signature || !req.query.pubKey) {
		return this.fail({ message: 'Missing credentials' }, 400)
	}
	function verified(err, user, info) {
		if (err) { return this.error(err) }
		if (!user) { return this.fail(info) }
		this.success(user, info)
	}
	try {
		this._verify(req, req.query.challenge, req.query.signature, req.query.pubKey, verified)
	} catch (ex) {
		return this.error(ex)
	}
}

module.exports = Strategy
