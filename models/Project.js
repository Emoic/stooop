const mongoose = require('mongoose');

const Schema = mongoose.Schema;

/**
 * @typedef {Object} projectSchema
 * @property {string} uid - ID of the project
 * @property {string} name - Name of the project
 * @property {string} description - Description of the project
* @property {string} picture - Picture of the project
 */

/**
 * Creates new projectSchema
 * @class
 */
const projectSchema = new Schema({
  uid: { type: String, unique: true },
  name: String,
  description: String,
  piecture:String
}, { timestamps: true });

const project = mongoose.model('project', projectSchema);

module.exports = project;
