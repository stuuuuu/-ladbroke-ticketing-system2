const express = require('express');
const router = express.Router();
const request = require('request');
const passport = require('passport');
const _ = require('lodash');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const JiraApi = require('jira').JiraApi;



var jira = new JiraApi('https', 'jira.egalacoral.com', 443, 'john.bero', 'P"ssw0rd123', '2', true, false);


router.get('/getSingleTicket/:id', (req, res) => {

    
    var id = req.params.id;        

    jira.findIssue(id, function(err, issue) {
        
        if(err) {
            return res.json({ success: false, msg: err });
        } else {
            return res.json({ success: true, msg: issue.fields });
        }

    });
    
});

router.get('/ticketToday/:alldevs', (req, res) => {
    
    var alldevs = req.params.alldevs;    

    
    var today = moment().format('YYYY-MM-DD');
    var tom = moment(today).add(1,'days');
    var jql = "assignee in (" + alldevs +") &duedate="+tom;
    var openText = ' AND status in ("New", Open, "In Progress", Reopened)';
    customSearch(jql += openText, (err, result) => {        

        if(err) {
            return res.json({ success: false, msg: err});            
        } else {
            return res.json({ success: true, msg: result });
        }        
    });    
});


router.get('/getAllTickets/:username', (req, res) => {
    
    var username = req.params.username;    
    var openText = ' AND status in (New, Open, "In Progress", Reopened) ORDER BY duedate ASC';
    var jql = "assignee="+username;        
    customSearch(jql += openText, (err, result) => {        

        if(err) {
            return res.json({ success: false, msg: err});            
        } else {
            return res.json({ success: true, msg: result});
        }        
    });    
    
});

router.get('/search', passport.authenticate('jwt', {session:false}), (req, res) => {    
    
    let jql = "assignee = " + req.query.username;    
    var openText;
        
    switch(req.query.date) {
        //all
        case "0":     
            openText = ' AND status in (New, Open, "In Progress", Reopened) ORDER BY duedate ASC';
            break;
        //this week    
        case "1":
            openText = ' AND duedate <= startOfWeek(5d) AND duedate > startOfWeek() AND status in (New, Open, "In Progress", Reopened) ORDER BY duedate ASC';            
            break;
        //next week    
        case "2":
            openText = ' AND duedate > startOfWeek() AND duedate < endOfWeek("+1") AND status in (New, Open, "In Progress", Reopened) ORDER BY duedate ASC';            
            break;
        //this month    
        case "3":
            openText = ' AND duedate <= startOfMonth(1)  AND status in (New, Open, "In Progress", Reopened) ORDER BY duedate ASC';            
            break; 
        //next month    
        case "4":
            openText = ' AND duedate >= startOfMonth(1)  AND status in (New, Open, "In Progress", Reopened) ORDER BY duedate ASC';            
            break;            
        default:   
            openText = ' AND status in (New, Open, "In Progress", Reopened) ORDER BY duedate ASC';
            break;            
    }          
        //var openText = ' AND status in ("New", Open, "In Progress", Reopened)';
    customSearch(jql += openText, (err, result) => {        
        console.log(jql);
        if(err) {
            return res.json({ success: false, msg: err});            
        } else {
            return res.json({ success: true, msg: result});
        }        
    });  
});

function customSearch(jql, callback) {        
    jira.searchJira(jql, "key,summary,duedate,assignee,status", callback);
}



module.exports = router;