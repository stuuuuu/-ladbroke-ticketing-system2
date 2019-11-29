const mongoose = require('mongoose');


let Schema = mongoose.Schema;

const ticketReportSummary = new Schema({
    Name:{
        type: String,
        required: true
    },
    username:{
        type: String,
        required: true
    },
    teambrand:{
        type: String,
        required: true
    },
    New: {
        type: Number,
        required: true    
    },
    Reopened: {
        type: Number,
        required: true     
    },
    datecreated: {
        type: Date, 
        required: false       
    }
});

const TRS = module.exports = mongoose.model('TRS',ticketReportSummary);

module.exports.addTRS = (newTRS, callback) => {
    newTRS.save(callback);
}