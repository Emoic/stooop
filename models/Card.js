const mongoose = require('mongoose');

const Schema = mongoose.Schema;

/**
 * @typedef {Object} cardSchema
 * @property {string} uid - ID of the card
 * @property {string} name - Name of the card
 * @property {string} description - description of the card
 * @property {Object[]} locks - Associated locks
  * @property {string} idcard - Profile about
  * @property {string} mobile - Profile about
  * @property {string} qq - Profile about
  * @property {string} memberid - 邮箱
  * @property {string} profield - 擅长领域
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
  whoupdate:String,
  rank:Number,
  checked:Boolean,
  locks: [{ type: Schema.Types.ObjectId, ref: 'Lock' }]
}, { timestamps: true });

const Card = mongoose.model('Card', cardSchema);

module.exports = Card;
