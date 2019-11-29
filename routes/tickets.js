const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');

const Ticket = require('../models/ticket');

router.post('/addTicket', passport.authenticate('jwt', {session:false}) , (req, res) => {
    let newTicket = new Ticket({
        ticketID: req.body.ticketID,
        title: req.body.title,
        worktime: req.body.worktime,
        status: req.body.status,
        remarks: req.body.remarks,
        jiralink: req.body.jiralink,
        duedate: req.body.duedate,
        datecreated: req.body.datecreated
    });

    Ticket.addTicket(newTicket, (err, ticket) => {
        if(err){
            res.json({success: false, msg: "Failed to add a ticket"});
        } else {
            res.status(200).json({success: true, msg: "Ticket registered"});
        }
    });
});

router.get('/getAllTickets', passport.authenticate('jwt', {session:false}), (req, res) => {
    Ticket.find({})
    .populate('brandID')
    .populate('userID')
    .exec((err, Tickets) => {
        if(err){
            res.json(err);
        }else{
            res.status(200).json(Tickets);
        }
    });
});

router.get('/getAllTickets/:id', passport.authenticate('jwt', {session:false}), (req, res) => {
    Ticket.findOne({
        _id: req.params.id
    })
    .populate('brandID')
    .populate('userID')
    .exec((err, Tickets) => {
        if(err){
            res.json({ success: false, msg: err });
        }else{
            res.status(200).json(Tickets);
        }
    });
});

router.get('/searchTicket/:ticketID', passport.authenticate('jwt', {session:false}), (req, res) => {
    Ticket.find({
        ticketID: req.params.ticketID
    })
    .populate('brandID')
    .populate('userID')
    .exec((err, Tickets) => {
        if(err){
            res.json(err);
        }else{
            res.status(200).json(Tickets);
        }
    });
});

router.put('/updateTicket/:id', passport.authenticate('jwt', {session:false}),(req, res) => {
    Ticket.findOneAndUpdate({
        _id: req.params.id
    },
    {
        $set: {
            userID: req.body.userID,
            brandID: req.body.brandID,
            ticketID: req.body.ticketID,
            title: req.body.title,
            worktime: req.body.worktime,
            status: req.body.status,
            remarks: req.body.remarks,
            jiralink: req.body.jiralink,
            duedate: req.body.duedate,
            datecreated: req.body.datecreated
        }
    },
    {
        new: true
    }, (err, updatedticket) => {
        if(err){
            res.json({success: false, msg: err });
        }else{
            res.status(200).json({success: true, msg: "Updated successfully" });
        }
    });
});

router.delete('/deleteTicket/:id', passport.authenticate('jwt', {session:false}), (req, res) => {
    Ticket.findOneAndRemove({
        _id: req.params.id
    }, (err, deletedticket) => {
        if(err){
            res.json({ success: false, msg: err });
        }else{
            res.status(200).json({success: true, msg: "Ticket successfully removed"});
        }
    });
});




module.exports = router;