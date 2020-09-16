const mongoose = require('mongoose');

const Schema = mongoose.Schema;

/**
 * @typedef {Object} logSchema
 * @property {string} lock_id - ID of the lock
 * @property {string} card_id - ID of the card
 * @property {Number} score - score of  user
 * @property {string} score_type - score of  user jifen
 * @property {string} note - note for score
 * @property {boolean} success - If a request was successful
 * @property {boolean} new_card - If it was a new card
 */

/**
 * Creates new logSchema
 * @class
 */
const logSchema = new Schema({
  lock_id: String,
  card_id: String,
  card_name:String,
  score: Number,
  score_type: String,
  note: String,
  success: Boolean,
  new_card: Boolean
}, { timestamps: true });

const Log = mongoose.model('Log', logSchema);

module.exports = Log;
