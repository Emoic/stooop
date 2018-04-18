const mongoose = require('mongoose');

const Schema = mongoose.Schema;

/**
 * @typedef {Object} cardSchema
 * @property {string} uid - ID of the card
 * @property {string} name - Name of the card
 * @property {string} description - description of the card
 * @property {Object[]} locks - Associated locks
  * @property {string} profile.idcard - Profile about
  * @property {string} profile.mobile - Profile about
  * @property {string} profile.qq - Profile about
  * @property {string} profile.memberid - Profile about
  * @property {string} profile.profield - Profile about

 */

/**
 * Creates new cardSchema
 * @class
 */
const cardSchema = new Schema({
  uid: { type: String, unique: true },
  name: String,
  idcard:String,
  mobile:String,
  qq:String,
  memberid:String,
  description: String,
  profield:String,
  locks: [{ type: Schema.Types.ObjectId, ref: 'Lock' }]
}, { timestamps: true });

const Card = mongoose.model('Card', cardSchema);

module.exports = Card;
