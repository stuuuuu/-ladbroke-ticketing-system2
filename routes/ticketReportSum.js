const express = require('express');
const router = express.Router();
const passport = require('passport');
const moment = require('moment');
const TRS = require('../models/ticketReportSummary');
//const JiraApi = require('jira').JiraApi;
const async = require('async');
const JiraApi2 = require('jira-client');


//var jira = new JiraApi('https', 'jira.egalacoral.com', 443, 'john.bero', 'P"ssw0rd123', '2', true,false);

var jira2 = new JiraApi2({
  protocol: 'https',
  host: 'jira.egalacoral.com',
  username: 'john.bero',
  password: 'P"ssw0rd123',
  apiVersion: '2',
  strictSSL: true
});



router.get('/addTRS/:searchdate?', (req, res) => {
  var devNames = [
     
    {
      username: "don.melendez",
      name: "Don Melendez",
      teambrand: "Coral"
    },
    {
      username: "lester.duldulao",
      name: "Lester Duldulao",
      teambrand: "Ladbrokes"
    },
    {
      username: "lunar.cuenca",
      name: "Lunar Cuenca",
      teambrand: "Gala"
    },
    {
      username: "remo.lalata",
      name: "Remo Antonio Lalata",
      teambrand: "Ladbrokes"
    },
    {
      username: "jessica.gunay",
      name: "Jessica Gunay",
      teambrand: "Coral"
    },
    {
      username: "kevin.chavez",
      name: "Kevin Chavez",
      teambrand: "Cashcade"
    },
    {
      username: "francheska.rivano",
      name: "Francheska Rivano",
      teambrand: "Coral"
    },
    {
      username: "emma.bulos",
      name: "Emma Joy Bulos",
      teambrand: "Ladbrokes"
    },
    {
      username: "john.bero",
      name: "John Michael Bero",
      teambrand: "Ladbrokes"
    },
    {
      username: "julie.cabria",
      name: "Julie Cabria",
      teambrand: "Gala"
    },
    {
      username: "arjimson.santiano",
      name: "Arjimson Santiano",
      teambrand: "Gala"
    },
    {
      username: "lloyd.montero",
      name: "Lloyd Montero",
      teambrand: "Cashcade"
    },
    {
      username: "daryl.laraya",
      name: "Daryl Laraya",
      teambrand: "Gala"
    },
    {
      username: "kristine.molina",
      name: "Kristine Molina",
      teambrand: "Cashcade"
    },
    {
      username: "charles.maneja",
      name: "Charles Maneja",
      teambrand: "Ladbrokes"
    }
  ];
  

  var alldevs = devNames.map(e => e.username).join("','");
  alldevs = "'" + alldevs + "'";

    var searchdate = req.params.searchdate;
    var query = (searchdate === undefined) ? moment().format('YYYY-MM-DD') : searchdate;
  
    var datetoday = moment().format('YYYY-MM-DD');
    var new_date = moment(datetoday, 'YYYY-MM-DD').add(7, 'days');
    var completedata = [];
    var sepdata = [];

    var devprocessed = 0;

    if(query > datetoday){
          var jql = "assignee in (" + alldevs +") &duedate="+query+ ' AND status in ("New", Open, "In Progress", Reopened)';

          jira2.searchJira(jql,{
            fields: ['customfield_21600','issuetype','duedate','status','assignee','worklog','labels','summary','timetracking'],
            maxResults: 200
          })
          .then(issue => {

            //return res.json({success: true, msg: issue });
            
            devNames.map((devname,index,arraydev) => {

              var neww = 0;
              var reopenedd = 0;
               issue.issues.map((alltickets,index,arrayissue) => {
                if(alltickets.fields.assignee.name === devname.username){
                  if(alltickets.fields.duedate === query){
                    neww++;
                  }else{
                    if(alltickets.fields.status.name === 'Reopened' || alltickets.fields.status.name === 'New'){
                      reopenedd++;
                    }
                  }
                }
              }) // ISSUES LOOP

              //console.log(neww);
              let newTRS = new TRS({
                Name: devname.name,
                username: devname.username,
                teambrand: devname.teambrand,
                New: neww,
                Reopened: reopenedd,
                datecreated:  datetoday
              });

              var sepname = {
                Name: devname.name,
                teambrand: devname.teambrand,
                New: neww,
                Reopened: reopenedd
              };
              
              //return res.json({success: true, msg: alltickets });
              completedata.push(newTRS);
              sepdata.push(sepname);
              
              // if(arraydev.length === devprocessed){
                
              // }
           
          });
          return res.json({success: true, msg: completedata, sepdata });
          })
          .catch(err => {
            res.json({success: true, msg: err });
          })

    }else if(query < datetoday){
      console.log('wew');
      TRS.find({
        datecreated: query   
      }).select('Name teambrand New Reopened InProgress -_id')
      .exec((err, TRSS) => {
        if(!err){
            

          return res.status(200).json({success: true, msg: TRSS });
        }
      });

    }else{
      console.log('lol');
   // console.log(devNames);
      
      

    var jql = "cf[21600]['key'] in (" + alldevs +") AND status NOT IN ('Cancelled') AND duedate<="+datetoday+ " AND duedate>= -1w ORDER BY duedate DESC";
    //var jql = "cf[21600]['key'] in (" + alldevs +") &duedate<= -1w OR assignee in (" + alldevs +") AND duedate<= -1w AND status in ('New', Open, 'In Progress', Reopened) ORDER BY duedate DESC";
   // var jql2 = "assignee in (" + alldevs +") &duedate<"+new_date+' AND status in ("New", Open, "In Progress", Reopened, "Resolved")';
   // var openText = ' AND project = CRE';
  


    jira2.searchJira(jql,{
      fields: ['customfield_21600','issuetype','duedate','status','assignee','worklog','labels','summary','timetracking'],
      maxResults: 200
    })
    .then(issue => {
     // return res.json({success: true, msg: issue })
      devNames.map((devname,index,arraydev) => {
        var neww = 0;
        var reopenedd = 0;
        issue.issues.map((alltickets,index,arrayissue) => {
          if(alltickets.fields.customfield_21600.name === devname.username){
            if(alltickets.fields.duedate === datetoday){
              neww++;
            }else{
              if(alltickets.fields.status.name === 'Reopened' || alltickets.fields.status.name === 'New'){
                reopenedd++;
              }
            }
          }
        }) // ISSUES LOOP

        let newTRS = new TRS({
          Name: devname.name,
          username: devname.username,
          teambrand: devname.teambrand,
          New: neww,
          Reopened: reopenedd,
          datecreated:  datetoday
        });

        var sepname = {
          Name: devname.name,
          teambrand: devname.teambrand,
          New: neww,
          Reopened: reopenedd
        };

        

        TRS.find({
          username: devname.username,
          datecreated: datetoday
        })
        .exec ((err, TRSdata) => {
          
          if(err){
            return res.json(err);
          }else if(!TRSdata.length){ // add 
            TRS.addTRS(newTRS, (err, TRSd) => {
              if(!err){
                devprocessed++;
                completedata.push(TRSd);  
                sepdata.push(sepname);
                if(arraydev.length === devprocessed){
                  return res.json({success: true, msg: completedata, sepdata })
                }
              } 
            });
          }else{ 
            TRS.findOneAndUpdate({
              username: devname.username,
              datecreated: datetoday
            },
            {
              $set: {
                New: neww,
                Reopened: reopenedd

              }
            },
            {
                new: true
            }, (err, updatedticket) => {
                if(err){
                  return res.json({success: false, msg: err });
                }else{
                  devprocessed++;
                  completedata.push(updatedticket);  
                  sepdata.push(sepname);
                  if(arraydev.length === devprocessed){
                    return res.json({success: true, msg: completedata, sepdata })
                  }
                }
            });
          }
        });

      }) // DEVNAMES LOOP
      
    })
    .catch(err => {
      return res.json({success: false, msg: err })
    })

  }
});


router.get('/getTRS/:searchdate?', (req, res) => {    
    var searchdate = req.params.searchdate;
    
    var query = (searchdate === undefined) ? moment().format('YYYY-MM-DD') : searchdate;
   
 
    TRS.find({
        datecreated: query   
    })
    .exec((err, TRSS) => {
        if(err){
            res.json(err);
        }else if (!TRSdata.length){
          var jql = "assignee in (" + alldevs +") &duedate="+query+ ' AND status in ("New", Open, "In Progress", Reopened)';

          jira2.searchJira(jql,{
            fields: ['customfield_21600','issuetype','duedate','status','assignee','worklog','labels','summary','timetracking'],
            maxResults: 200
          })
          .then(issue => {
            return res.json({success: true, msg: issue });
          })
          .catch(err => {
            res.json({success: true, msg: err });
          })
          
        }else{
            
            TRS.find({
                datecreated: query   
            }).select('Name teambrand New Reopened InProgress -_id')
            .exec((err, exportt) => {
                return res.status(200).json({success: true, msg: TRSS, exportt });
            // })
            });
        }
    });
});


router.get('/ticketRecord/:devname/:datestart/:dateend',(req,res) => {

  var devname = req.params.devname;
  var datestart = req.params.datestart;
  var dateend = req.params.dateend;

  var datetoday = moment().format('YYYY-MM-DD');
  var new_date = moment(datetoday, 'YYYY-MM-DD').add(1, 'days');

  //var jql = "cf[21600]['key'] in (" + alldevs +") AND status NOT IN ('Cancelled') AND duedate<="+datetoday+ " AND duedate>= 2019-03-25 ORDER BY duedate DESC";
  var jql = "cf[21600]['key'] = "+ devname +" AND duedate<="+dateend+ " AND duedate>= "+ datestart +" OR issuetype IN ('Creative Amendment Form','Publish Form Subtask') AND duedate<="+dateend+ " AND duedate>= "+ datestart +" AND worklogAuthor = "+ devname +" OR assignee = "+ devname +" AND duedate<="+dateend+ " AND duedate>= "+ datestart + " ORDER BY duedate DESC";
  
  // jira2.getIssueWorklogs('CRE-79651')
  // .then(asdasd => {
  //   return res.json({success: true, msg: asdasd })
  // })
  jira2.searchJira(jql,{
    fields: ['customfield_21600','issuetype','duedate','status','assignee','worklog','labels','summary','timetracking'],
    maxResults: 1000
  })
  .then(issue => {
    return res.json({success: true, msg: issue })
  })
  .catch(err => {
    return res.json({success: false, msg: err })
  })








});



// function merge_array(array1, array2) {
//   var result_array = [];
//   var arr = array1.concat(array2);
//   var len = arr.length;
//   var assoc = {};

//   while(len--) {
//       var item = arr[len];

//       if(!assoc[item]) 
//       { 
//           result_array.unshift(item);
//           assoc[item] = true;
//       }
//   }

//   return result_array;
// }


module.exports = router;