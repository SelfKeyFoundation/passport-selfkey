/**
 * Module dependencies.
 */
var passport = require('passport-strategy');
var util = require('util');
var lookup = require('./utils').lookup;

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
 * Options:
 *   - `passReqToCallback`  when `true`, `req` is the first argument to the verify callback (default: `false`)
 *
 * Example:
 *
 *     passport.use(new SelfKeyStrategy(
 *       function(signature, pubKey, done) {
 *         authenticateUserFunction({signature: signature, pubKey: pubKey}, function (err, user) {
 *           done(err, user);
 *         });
 *       }
 *     ));
 *
 * @param {Function} verify
 * @api public
 */
function Strategy(verify) {
  
  if (!verify) { throw new TypeError('SelfKey Strategy requires a verify callback'); }

  passport.Strategy.call(this);
  this.name = 'selfkey';
  this._verify = verify;
}

/**
 * Inherit from `passport.Strategy`.
 */
util.inherits(Strategy, passport.Strategy);

/**
 * Authenticate request based on the login with selfkey request
 *
 * @api protected
 */
Strategy.prototype.authenticate = function() {
  
  var signature = lookup(req.body, signature) || lookup(req.query, this._signature);
  var pubKey = lookup(req.body, pubKey) || lookup(req.query, this._pubKey);
  
  if (!signature || !pubKey) {
    return this.fail({ message: 'Missing credentials' }, 400);
  }
  
  var self = this;
  
  function verified(err, user, info) {
    if (err) { return self.error(err); }
    if (!user) { return self.fail(info); }
    self.success(user, info);
  }
  
  try {
    this._verify(signature, pubKey, verified);
  } catch (e) {
    return self.error(e);
  }
};


/**
 * Expose `Strategy`.
 */
module.exports = Strategy;
