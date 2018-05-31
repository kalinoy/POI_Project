var express = require('express');
var bodyParser = require('body-parser');
var squel = require("squel");
var app = express();
var moment = require('moment');
var DButilsAzure = require('./DBUtils');
var cors = require('cors');
var path = require('path');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

var router = express.Router();


//return all points - the random and rate will be at the client side
router.get('/getPoints', function (req, res) {
    var query = squel.select().from("PointOfInterest")
        .toString();
    DButilsAzure.execQuery(query).then(function (resParam) {
        if (resParam.length == 0) {
            res.send({ status: "failed", response: "There are no points." });
        }
        //save the permission type to know what action the user can do
        else {
            res.send({ status: "OK", response: resParam });
        }
    }).catch(function (resParam) {
        console.log('Failed to excute');
        res.send({ status: "`failed", response: resParam });
    });
});


//return points by category
router.get('/category/:category', function (req, res) {
    var catNum=req.param('category');

    var query = squel.select().from("PointOfInterest")
    .where("CategoryId='"+catNum+"'")
    .toString();
    DButilsAzure.execQuery(query).then(function (resParam) {
        if (resParam.length == 0) {
            res.send({ status: "failed", response: "There are no points for these category." });
        }
        //save the permission type to know what action the user can do
        else {
            res.send({ status: "OK", response: resParam });
        }
    }).catch(function (resParam) {
        console.log('Failed to excute');
        res.send({ status: "`failed", response: resParam });
    });
});

//return points by pointID
router.get('/getPointbyid/:pointId', function (req, res) {
    var pointNum=req.param('pointId');

    var query = squel.select().from("PointOfInterest")
        .where("PointId='"+pointNum+"'")
        .toString();
    DButilsAzure.execQuery(query).then(function (resParam) {
        if (resParam.length == 0) {
            res.send({ status: "failed", response: "There are no points for this ID" });
        }
        //save the permission type to know what action the user can do
        else {
            res.send({ status: "OK", response: resParam });
        }
    }).catch(function (resParam) {
        console.log('Failed to excute');
        res.send({ status: "`failed", response: resParam });
    });
});
//get point by name
router.get('/getPointbyName/:pointname', function (req, res) {
    var pointnm=req.param('pointname');

    var query = squel.select().from("PointOfInterest")
        .where("PointName='"+pointnm+"'")
        .toString();
    DButilsAzure.execQuery(query).then(function (resParam) {
        if (resParam.length == 0) {
            res.send({ status: "failed", response: "No points found." });
        }
        //save the permission type to know what action the user can do
        else {
            res.send({ status: "OK", response: resParam });
        }
    }).catch(function (resParam) {
        console.log('Failed to execute');
        res.send({ status: "`failed", response: resParam });
    });
});

//delete point by pointId
router.delete('/removePoint', function (req,res) {
    var delPoint = req.body.PointId;
    if(!req.body.PointId){
        res.send("please enter id to delete");
        return;
    }
    console.log(delPoint);
    var query = squel.select().from("PointOfInterest")
        .where("PointId='"+delPoint+"'")
        .toString();
    DButilsAzure.execQuery(query)
        .then(function (result) {
            if(result.length>0) {
                var query = squel.delete().from("PointOfInterest")
                    .where("PointId='"+delPoint+"'")
                    .toString();
                console.log(query);
                DButilsAzure.execQuery(query)
                    .then(function (result) {
                        res.send(result);
                    })
                    .catch(function (err) {
                        res.sendStatus(400)
                    });
            }
            else {
                res.send({ status: "failed", response: "No points found." });

            }
        })

});
 //count views in PointOfInterest
router.post('/viewsInc/:pointId',function (req,res) {
   var pointid=req.param('pointId');
   var query="UPDATE PointOfInterest SET ViewNum = ViewNum + 1 WHERE PointId = '"+pointid+"'";

    console.log(query.toString());
    //"Insert INTO table PointsOfInterest SET ViewNum = ViewNum + 1 WHERE PointId="+pointid;
    DButilsAzure.execQuery(query).then(function (resParam) {
        res.send({ status: "ok", response: resParam });
    }).catch(function (resParam) {
        console.log('Failed to add view');
        res.send({ status: "failed", response: resParam });
    });


});

//calculate percentage of rate
router.post('/rate/:pointId',function (req,res) {
    var pointid=req.param('pointId');
    var query1="SELECT AVG(Cast(Rate as Float)) as avg FROM UserRate WHERE PointId = '"+pointid+"'" ;
     DButilsAzure.execQuery(query1)
         .then(function (resParam) {
         console.log(resParam);
         var ratePer=(resParam[0].avg *100)/5;
         console.log(ratePer);
          var query2="UPDATE PointOfInterest SET RateInPrec = '"+ratePer+"' WHERE PointId = '"+pointid+"'";
          DButilsAzure.execQuery(query2).then(function (resParam) {
              res.send({ status: "ok", response: resParam });
          }).catch(function (resParam) {
              console.log('Failed to add rate');
              res.send({ status: "failed", response: resParam });
         });
        //  console.log("meow");
         res.send({ status: "ok", response: resParam, per: ratePer });
     }).catch(function (resParam) {
         console.log('Failed to calculate');
         res.send({ status: "failed", response: resParam });
     });
});







module.exports = router;
