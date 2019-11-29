const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const passport = require('passport');
const mongoose = require('mongoose');
const config =  require('./config/database');


mongoose.connect(config.database, { useNewUrlParser: true },(err) => {
    if(err) {
        console.log("Error: Could not connect to mongodb \n");
        console.log(err);
    } else {
        console.log("Success: Connected to mongodb");
    }
});


const app = express();


//Port
const port = 3001;

//Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());
app.use(passport.session());

require('./config/passport')(passport);
//Routes
const users = require('./routes/users');
app.use('/user', users);

const jira = require('./routes/jira');
app.use('/jira', jira);

const trs = require('./routes/ticketReportSum');
app.use('/trs', trs);

app.get('/', (req, res) => {
    res.send('Invalid Endpoint');
});

//Start Server
app.listen(port, ()=> {
    console.log('Server Started on port' + port);
});

