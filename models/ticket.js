const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../config/database');

let Schema = mongoose.Schema;

const TicketSchema = new Schema({
    Name:{
        type: String,
        required: true
    },
    New: {
        type: String,
        required: true    
    },
    Reopen: {
        type: String,    
        required: true    
    },
    InProgress: {
        type: String,
        required: true
    },
    InProgress: {
        type: String,
        required: true
    },
    datecreated: {
        type: Date, 
        required: true       
    }
});

const Ticket = module.exports = mongoose.model('Ticket',TicketSchema);

module.exports.addTicket = (newTicket, callback) => {
    newTicket.save(callback);
}