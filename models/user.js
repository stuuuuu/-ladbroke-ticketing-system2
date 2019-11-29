const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../config/database');
const validate = require('mongoose-validator');

//user schema
let Schema = mongoose.Schema;

//VALIDATION OF email
var emailValidator = [
    validate({
        validator: 'isEmail',
        message: 'Please enter a valid email address' 
    })
];

const UserSchema = new Schema({
   
    position: {
        type: Number,
        required: true    
    },
    name: {
        type: String,    
        required: true    
    },
    email: {
        type: String,
        required: true,
        validate: emailValidator  
    },
    password: {
        type: String,
        required: true
    },    
    role: {
        type: Number, 
        required: true,
        enum: ['Admin', 'User']       
    },
    datecreated: {
        type: Date,
        default: Date.now
    }
});

const User = module.exports = mongoose.model('User', UserSchema);



module.exports.getUserById = (id, callback) => {
    User.findById(id, callback);
}

module.exports.getUserByEmail = (email, callback) => {
    const query = {email: email}
    User.findOne(query, callback);
}

module.exports.addUser = (newUser, callback) => {    
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
            if(err) { 
                throw err;
                console.log("Error saving user: " + newUser)
            } else {
                newUser.password = hash;
                newUser.save(callback);
            }
        });
    });    
}

module.exports.isUserExist = function(userEmail, callback) {    
    User.find({email: userEmail}, callback);    
}

module.exports.comparePassword = function(candidatePassword, hash, callback) {
    bcrypt.compare(candidatePassword, hash, (err, isMatch) => {
        if(err) throw err;
        callback(null, isMatch);
    });
}

module.exports.updateUserById = (id, newResult, callback) => {    
    User.findByIdAndUpdate(
        { 
            "_id": id 
        }, 
        {
            $set: {
                position: newResult.position,
                name: newResult.name,
                email: newResult.email,
                username: newResult.username,
                password: newResult.password,
                role: newResult.role
            },            
        }, 
        {
            new: true //return the updated data 
        }, callback);
}

module.exports.deleteUserById = (id, callback) => {
    User.findByIdAndRemove({"_id": id}, callback);
}

module.exports.getAll = (callback) => {
    User.find({}, callback);
}