const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../config/database');

let Schema = mongoose.Schema;

const questionaireSchema = new Schema({
    Questions:{
        type: Array
    }
});

const Questionaire = module.exports = mongoose.model('Questionaire',questionaireSchema);

module.exports.addTicket = (newTicket, callback) => {
    newTicket.save(callback);
}