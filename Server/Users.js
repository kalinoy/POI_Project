var express = require('express');
var bodyParser = require('body-parser');
var squel = require("squel");
var app = express();
var moment = require('moment');
var DButilsAzure = require('./DBUtils');
var cors = require('cors');
var path = require('path');
var jwt = require('jsonwebtoken');
var fs = require('fs');
var xml2js = require('xml2js');
var date = require('date-and-time');

var parser = new xml2js.Parser();


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

var router = express.Router();
/**************try*****************/
router.get('/', function (req, res) {
    var query = squel.select().from("Users")
        .toString();
    DButilsAzure.execQuery(query).then(function (resParam) {
        if (resParam.length == 0) {
            res.send({ status: "failed", response: "Username dosen't have permission to log in the system." });
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


//Register to the system
//the request body:
// {
// 	"FirstName":"Linoy",
// 	"LastName":"Kalachman",
// 	"City":"Rishon",
// 	"Country":"Israel", 
// 	"Email":"kalinoy1@gmail.com",
// 	"Password":"1111", 
// 	"Username":"linoy"
// }
router.post('/register', function (req, res) {

    var firstName = req.body.FirstName;
    var lastName = req.body.LastName;
    var city = req.body.City;
    var country = req.body.Country;
    var email = req.body.Email;
    var pass = req.body.Password;
    var username = req.body.Username;

    if (!firstName || !lastName || !city || !country || !email || !pass || !username) {
        res.send({ status: "failed", response: "Invalid value." });
        res.end();
    }
    else {
        //check if the username already exist in the system 
        var query = squel.select().from("Users")
            .where("Username='" + username + "'")
            .toString();

        DButilsAzure.execQuery(query).then(function (resParam) {
            if (resParam.length > 0) {
                res.send({ status: "failed", response: "Username already exist in the system." });
            }
            //username doesnt exist in the system
            else {
                if (!(/^[a-zA-Z]+$/.test(username)) || username.length <= 2 || username.length >= 9)
                    res.send("UserName should contain only letters and length should be between 3-8 characters");
                //check password contains letters and numbers only & 5-10 chars
                else if (!(/^[a-zA-Z0-9]+$/.test(pass)) || pass.length <= 4 || pass.length >= 11)
                    res.send("password should contain only letters & numbers  and the length should be between 5-10 characters");
                else {
                    var query1 = (squel.insert().into("Users")
                        .set("FirstName", firstName)
                        .set("LastName", lastName)
                        .set("City", city)
                        .set("Country", country)
                        .set("Email", email)
                        .set("Password", pass)
                        .set("Username", username)
                        .toString());
                    //add question 1
                    DButilsAzure.execQuery(query1).then(function (resParam) {
                        console.log("The user has been added to the system.");
                        res.send({ status: "ok", response: "The user has been added auccesfully." })
                    }).catch(function (resParam) {
                        console.log("Failed to execute.");
                        res.send({ status: "failed", response: resParam });
                    });
                }
            }
        }).catch(function (resParam) {
            console.log("Failed to execute.");
            res.send({ status: "failed", response: resParam });
        });
    }

});

//While register choose categoried
//the request body:
// {
// "Cat1":"yes",
// "Cat2":"no",
// "Cat3":"yes",
// "Cat4":"no",
// }
router.post('/chooseCategories/:username', function (req, res) {
    var username = req.param('username');
    var cat1 = req.body.Cat1;
    var cat2 = req.body.Cat2;
    var cat3 = req.body.Cat3;
    var cat4 = req.body.Cat4;

    var catCount = 0;
    var cat = [cat1, cat2, cat3, cat4];
    for (var i = 0; i < cat.length; i++) {
        if (cat[0] == "yes") {
            catCount++;
        }
    }
    if (!username || !cat1 || !cat2 || !cat3 || !cat4) {
        res.send({ status: "failed", response: "Invalid value." });
        res.end();
    }
    //must be at least 2 category
    else if (catCount < 2) {
        res.send({ status: "failed", response: "It must be at least 2 category." });
        res.end();
    }
    else {
        for (var i = 1; i <= cat.length; i++) {
            if (cat[i - 1] == "yes") {
                var query2 = (squel.insert().into("UserCategories")
                    .set("UserName", username)
                    .set("CategoryId", i)
                    .toString());
                DButilsAzure.execQuery(query2).then(function (resParam) {
                    console.log("The categories have been added succesfuly to the user.");
                    res.send({ status: "ok", response: resParam });
                }).catch(function (resParam) {
                    console.log('Failed to add the user the categoris to the system');
                    res.send({ status: "failed", response: resParam });
                });
            }
        }
    }


});

//While register add questions
//the request body:
// {
// "Ans1":"bla",
// "Ans2":"Negba"
// }
router.post('/answerQues/:username', function (req, res) {
    var username = req.param('username');
    var ans1 = req.body.Ans1;
    var ans2 = req.body.Ans2;
    if (!ans1 || !ans2) {
        res.send({ status: "failed", response: "Invalid value." });
        res.end();
    }

    else {
        var query1 = (squel.insert().into("UserQuestions")
            .set("Username", username)
            .set("QuestionId", 1)
            .set("Answer", ans1)
            .toString());

        DButilsAzure.execQuery(query1).then(function (resParam) {
            console.log("The first answer for the question has been added succesfuly to the user.");

            var query2 = (squel.insert().into("UserQuestions")
                .set("Username", username)
                .set("QuestionId", 2)
                .set("Answer", ans2)
                .toString());
            DButilsAzure.execQuery(query2).then(function (resParam) {
                console.log("The second answer for the question has been added succesfuly to the user.");
                res.send({ status: "ok", response: resParam });
            }).catch(function (resParam) {
                console.log('Failed to add the answer to the system');
                res.send({ status: "failed", response: resParam });

            });
        }).catch(function (resParam) {
            console.log('Failed to add the answer to the system');
            res.send({ status: "failed", response: resParam });
        });
    }
});


//cheking token when require login people
router.use('/log', function (req, res, next) {
    var token = req.body.token || req.query.token || req.header['x-access-token'];

    if (token) {
        jwt.verify(token, 'secret', function (err, decoded) {
            if (err) {
                return res.json({ success: false, message: 'Failed to authenticate token' });
            }
            else {
                var decoded = jwt.decode(token, { complete: true });
                req.decode = decoded;
                next();
            }
        });
    }
});

router.post('/log', function (req, res) {
    var username = req.decoded.payload.userName;
    var query = squel.select()
        .field("Username")
        .from("Users")
        .where("Username = '" + username + "'")
        .toString();
    DButilsAzure.execQuery(query).then(function (resParam) {
        //doesn't exist
        if (resParam.length !== 1) {
            res.send({ status: "failed", response: "Username doesn't exist." });
        }
        else{
            var user={
                userName:username,
                FirstName:resParam[0]['FirstName'],
                LastName:resParam[0]['LastName'],
                City:resParam[0]['City'],
                Country:resParam[0]['Country'],
                Email:resParam[0]['Email']
            }
        }
    }).catch(function (resParam) {
        console.log('login failed');
        res.send({ status: "failed", response: resParam });
    });


});


//login to the system
//the request body:
// {
// "Username":"klinoy",
// "Password":"1111a"
// }
router.post('/login', function (req, res) {

    var username = req.body.Username;
    var password = req.body.Password;
    if (!username || !password) {
        res.send({ status: "failed", response: "Invalid value." });
        res.end();
    }

    else {
        var query = squel.select()
            .field("Username")
            .from("Users")
            .where("Username = '" + username + "'")
            .where("Password = '" + password + "'")
            .toString();

        DButilsAzure.execQuery(query).then(function (resParam) {
            //doesn't exist
            if (resParam.length !== 1) {
                res.send({ status: "failed", response: "failed to signIn- your password or Username are not valid" });
            } else {
                var payload = {
                    userName: username
                }
                var token = jwt.sign(payload, 'secret', {
                    expiresIn: "1d"
                });
                res.json({
                    success: true,
                    message: 'This is your token',
                    token: token
                });
                // res.send({ status: "ok", response: resParam });
            }

        }).catch(function (resParam) {
            console.log('signIn failed');
            res.send({ status: "failed", response: resParam });
        });
    }
});

//restore password
//the request body:
// {
// "Username":"klinoy",
// "Ans1":"bla"
// "Ans2":"Negba"
// }
router.post('/restorePass', function (req, res) {
    var username = req.body.Username;
    var ans1 = req.body.Ans1;
    var ans2 = req.body.Ans2;
    if (!username || !ans1 || !ans2) {
        res.send({ status: "failed", response: "Invalid value." });
        res.end();
    }
    else {
        var query1 = squel.select()
            .from("UserQuestions")
            .where("Username = '" + username + "'")
            .where("Answer = '" + ans1 + "'")
            .where("QuestionId='" + 1 + "'")
            .toString();

        DButilsAzure.execQuery(query1).then(function (resParam) {
            //doesn't exist
            if (resParam.length !== 1) {
                res.send({ status: "failed", response: "Incorrect answer to the question" });
            } else {
                var query2 = squel.select()
                    .from("UserQuestions")
                    .where("Username = '" + username + "'")
                    .where("Answer = '" + ans2 + "'")
                    .where("QuestionId='" + 2 + "'")
                    .toString();
                //doesn't exist
                DButilsAzure.execQuery(query2).then(function (resParam) {

                    if (resParam.length !== 1) {
                        res.send({ status: "failed", response: "Incorrect answer to the question" });
                    }
                    else {
                        res.send({ status: "ok", response: resParam });
                    }
                }).catch(function (resParam) {
                    console.log('signIn failed');
                    res.send({ status: "failed", response: resParam });
                });
            }
        }).catch(function (resParam) {
            console.log('signIn failed');
            res.send({ status: "failed", response: resParam });
        });
    }
});

//after restor- return user paasword- with post because forwarding user deatils 
//also for the token
router.post('/username/:username', function (req, res) {
    var username = req.param('username');

    if (!username) {
        res.send({ status: "failed", response: "Invalid value." });
        res.end();
    }
    else {
        var query = squel.select().from("Users")
            .where("Username='" + username + "'")
            .toString();
        DButilsAzure.execQuery(query).then(function (resParam) {
            if (resParam.length == 0) {
                res.send({ status: "failed", response: "Username dosen't exist in the system." });
            }
            //save the permission type to know what action the user can do
            else {
                res.send({ status: "OK", response: resParam });
            }
        }).catch(function (resParam) {
            console.log('Failed to excute');
            res.send({ status: "`failed", response: resParam });
        });
    }
});

//return user category list
router.get('/log/categories/:username', function (req, res) {
    var username = req.param('username');
    if (!username) {
        res.send({ status: "failed", response: "Invalid value." });
        res.end();
    }
    else {
        var query = squel.select().from("UserCategories")
            .where("UserName = '" + username + "'")
            .toString();
        DButilsAzure.execQuery(query).then(function (resParam) {
            //he must has category
            if (resParam.length == 0) {
                res.send({ status: "failed", response: "There are no catigories for the user." });
            }
            else {
                res.send({ status: "OK", response: resParam });
            }
        }).catch(function (resParam) {
            console.log('Failed to excute');
            res.send({ status: "`failed", response: resParam });
        });
    }

});

//return all the favourite points of the user-- need to check
router.get('/log/getFavourite/:username', function (req, res) {
    var username = req.param('username');

    var query = squel.select().from("Favorites")
    .where("Username = '" + username + "'")
    .toString();
    DButilsAzure.execQuery(query).then(function (resParam) {
        //he must has category
        if (resParam.length == 0) {
            res.send({ status: "failed", response: "There are no catigories for the user." });
        }
        else {
            res.send({ status: "OK", response: resParam });
        }
    }).catch(function (resParam) {
        console.log('Failed to excute');
        res.send({ status: "`failed", response: resParam });
    });
});

//insert to the user favourite--need to countinue check if alrady exist, if not add it
router.post('/log/insertFavourite/:username/point/:pointId', function (req, res) {
    var username = req.param('username');
    var pointId = req.param('pointId');
    if (!username || !pointId) {
        res.send({ status: "failed", response: "Invalid value." });
        res.end();
    }

    else {
        var query = squel.select().from("Favorites")
            .where("Username='" + username + "'")
            .where("PointId='" + pointId + "'")
            .toString();

        DButilsAzure.execQuery(query).then(function (resParam) {
            //point already exist
            if (resParam.length > 0) {
                res.send({ status: "failed", response: "Username already exist in the system." });
            }
            //username doesnt exist in the system
            else {
                var query1 = (squel.insert().into("Favorites")
                    .set("Username", username)
                    .set("PointId", pointId)
                    .toString());
                //add to favourite
                DButilsAzure.execQuery(query1).then(function (resParam) {
                    console.log("The point has been added to the user.");
                    res.send({ status: "ok", response: "The point has been added to the user." })
                }).catch(function (resParam) {
                    console.log("Failed to execute.");
                    res.send({ status: "failed", response: resParam });
                });
            }

        }).catch(function (resParam) {
            console.log("Failed to execute.");
            res.send({ status: "failed", response: resParam });
        });
    }

    function verifyToken(req, res, next) {
        //Get auth header value
        const bearerHeader = req.headers['authorization'];
        //Check if bearer is undifined
        if (typeof bearerHeader != 'undefined') {


        }
        else {
            //Forbidden
            res.send({ status: "failed", response: "forbidden." })
        }
    }

});

router.post('/log/ratePoint/:pointId', function (req, res) {
    var pointId=req.param('pointId');
    var username = req.body.Username;
    var rate = req.body.Rate;
    var review = req.body.Review;
    date.locale('en');  // english

    console.log(date.format(new Date(), 'DD/MM/YYYY'));
    if (!username || !rate || !review) {
        res.send({ status: "failed", response: "Invalid value." });
        res.end();
    }
    else {
        var query1 = squel.select()
            .from("PointOfInterest")
            .where("PointId = '" +pointId+ "'")
            .toString();
        DButilsAzure.execQuery(query1).then(function (resParam) {
                if (resParam.length == 0) {
                    res.send({ status: "failed", response: "No points found." });
            } else {
                    if (parseInt(rate.toString()) > 5 || parseInt(rate.toString()) < 1)
                        res.send({status: "failed", response: "rate should be between 1 to 5"});
                    else {
                        console.log("got in else before quuery2");
                        var query2 = squel.insert().into("UserRate")
                            .set("PointId",pointId)
                            .set("Username", username)
                            .set("Rate",rate)
                            .set("Review",review)
                            .set("Date",date.format(new Date(), 'DD/MM/YYYY'))
                            .toString();
                        console.log(query2.toString());
                        //doesn't exist
                        console.log("got in else after quuery2");
                        DButilsAzure.execQuery(query2).then(function (resParam) {
                            res.send({ status: "OK", response: resParam });
                        }).catch(function (resParam) {
                            res.send({status: "failed", response: resParam});
                        });
                    }
                }
        }).catch(function (resParam) {
            res.send({ status: "failed", response: resParam });
        });
    }
});


//delete pointofinterest from favorites

router.delete('/log/removePoint', function (req,res) {
    var delPoint = req.body.PointId;
    if(!req.body.PointId){
        res.send("please enter id to delete");
        return;
    }
    console.log(delPoint);
    var query = squel.select().from("Favorites")
        .where("PointId='"+delPoint+"'")
        .toString();
    DButilsAzure.execQuery(query)
        .then(function (result) {
            if(result.length>0) {
                var query = squel.delete().from("Favorites")
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


//retun the countries

router.get('/countries', function (req, res) {
    fs.readFile('countries.xml', function (err, data) {
        parser.parseString(data, function (err, result) {
            res.send(result);
            console.log(result);
            console.log('Finish');
        })
    })
});






















module.exports = router;
