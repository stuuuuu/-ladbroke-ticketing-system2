const express = require('express');
const router = express.Router();
const User = require('../models/user');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config/database');
const {ObjectID} = require('mongodb');

//register
router.post('/register', (req, res, next) => {

    let newUser = new User({        
        position: req.body.position,
        name: req.body.name,
        email: req.body.email,        
        password: req.body.password,
        role: req.body.role,
        datecreated: req.body.datecreated
    });        

   

    User.find({email: newUser.email}, (err, docs) => {        
        if(docs.length > 0){                                         
            return res.json({success:false, message: 'Email already exists'});             
        } else {
            User.addUser(newUser, (err, newUser) => {
                if(err)
                {
                    if(err.errors.email)
                    {
                        res.json({success: false, message: err.errors.email.message});
                    }
                    else
                    {
                        res.json({success: false, message: 'Failed to register the user. ' + err.message});
                    }
                }
                else
                {
                    res.json({success: true, message: 'New user had been registered'});
                }
            });
        } 
    });      

});

router.patch('/:id', passport.authenticate('jwt', {session:false}), (req, res) => {
    var id = req.params.id;

    let newResult = {
        position: req.body.position,
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        role: req.body.role,
        datecreated: req.body.datecreated
    };

    if(!ObjectID.isValid(id)) {
        return res.status(404).send('invalid id');
    }

    User.updateUserById(id, newResult, (err, user) => {
        if(err) throw err;
        if(!user) {
            return res.json({success:false, message: 'User not found'});
        }

        res.json({
            success: true,
            user: user
        });
    });
});

router.delete('/:id', passport.authenticate('jwt', {session:false}), (req, res) => {
    var id = req.params.id;

    if(!ObjectID(id)) {
        return res.status(404).send('invalid id');
    }

    User.deleteUserById(id, (err, user) => {
        if(err) throw err;
        if(!user) {
            return res.json({success:false, message: 'User not found'});
        }

        res.json({
            success: true,
            user: user
        });
    })
});



router.post('/authenticate', (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    User.getUserByEmail(email, (err, user) => {
        if(err) throw err;
        if(!user){
            return res.json({success: false, message: 'User not found'});
        }

        User.comparePassword(password, user.password, (err, isMatch) => {
            if(err) throw err;
            if(isMatch){
                const token = jwt.sign(user.toJSON(), config.secret, {
                    expiresIn: 604800 // 1 week
                });

                res.json({
                    success: true, 
                    token: 'JWT ' + token, 
                    user: {                    
                        position: user.position,
                        name: user.name,  
                        role: user.role,
                        datecreated: user.datecreated
                    }
                });
            } else {
                return res.json({success: false, message: 'Wrong password'});
            }
        });
    });
});

router.get('/profile', passport.authenticate('jwt', {session:false}), (req, res, next) => {
    res.json({user: req.user});
});

router.get('/isAdmin', passport.authenticate('jwt', {session:false}), (req, res, next) => {
    res.json({role: req.user.role});
});

module.exports = router;