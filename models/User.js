const bcrypt = require('bcrypt-nodejs');
const crypto = require('crypto');
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

/**
 * @typedef {Object} userSchema
 * @property {string} email - User email
 * @property {string} password - User password
 * @property {string} passwordResetToken - User password reset token
 * @property {Date} passwordResetExpires - Date when password reset token expires
 * @property {Array} tokens
 * @property {string} type - User type  
 * @property {Object} profile
 * @property {string} profile.name - Profile name
 * @property {string} profile.gender - Profile gender
 * @property {string} profile.location - Profile location
 * @property {string} profile.website - Profile website
 * @property {string} profile.picture - Profile picture
 * @property {string} profile.idcard - Profile idcard
 * @property {string} profile.mobile - Profile mobile
 * @property {string} profile.qq - Profile qq
 * @property {string} profile.description - Profile description
*/

/**
 * Creates new userSchema
 * @class
 */
const userSchema = new Schema({
  email: { type: String, unique: true },
  password: String,
  passwordResetToken: String,
  passwordResetExpires: Date,

  tokens: Array,
  type:String,
  profile: {
    name: String,
    gender: String,
    location: String,
    website: String,
    picture: String,
    level:String,
    idcard:String,
    mobile:String,
    qq:String,
    description: String,
    profield:String
  }
}, { timestamps: true });

/**
 * Password hash middleware.
 */
userSchema.pre('save', function save(next) {
  const user = this;
  if (!user.isModified('password')) { return next(); }
  bcrypt.genSalt(10, (err, salt) => {
    if (err) { return next(err); }
    bcrypt.hash(user.password, salt, null, (err, hash) => {
      if (err) { return next(err); }
      user.password = hash;
      next();
    });
  });
});

/**
 * Helper method for validating user's password.
 * @param   {string} candidatePassword - Candidate password
 * @param   {Function} cb - Callback function
 */
userSchema.methods.comparePassword = function comparePassword(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
    cb(err, isMatch);
  });
};

/**
 * Helper method for getting user's gravatar.
 * @param   {number} size - size of the Gravatar image
 * @returns {string} - URL of Gravatar image
 */
userSchema.methods.gravatar = function gravatar(size) {
  if (!size) {
    size = 200;
  }
  if (!this.email) {
    return `https://gravatar.com/avatar/?s=${size}&d=retro`;
  }
  const md5 = crypto.createHash('md5').update(this.email).digest('hex');
  return `https://gravatar.com/avatar/${md5}?s=${size}&d=retro`;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
