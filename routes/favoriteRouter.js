var express = require('express');
var favoriteRouter = express.Router();
const authenticate = require('../authenticate');
const cors = require('./cors');
const Favorite = require('../models/Favorite');

favoriteRouter
    .route('/')
    .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
    .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
        Favorite.find({ user: req.user._id })
//It ended up being important to capitalize these (because they are that way in the schema I am guessing)
            .populate("User")
            .populate("Campsites")
            .then(favorites => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorites);
            })
            .catch(err => next(err));
    })
    // POST to /favorites: When the user does a POST operation on '/favorites' by including a message in the format of [{"_id":"campsite ObjectId"},  . . . , {"_id":"campsite ObjectId"}] in the body of the message (see Testing section for example), you will check if the user has an associated favorite document. Use Favorite.findOne({user: req.user._id }) for this. 
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOne({ user: req.user._id })
            .then(favorite => {
                if (!favorite) {
                    Favorite.create({user: req.user._id, campsites: req.body})
                        .then(favorite => {
                            res.statusCode = 200;
                            res.json(favorite);
                        })
                } 
                req.body.campsites.forEach(favorite => {
                    if (!favorite.campsites.includes(favorite._id)) {
                        favorite.campsites.push(favorite)
                    }
                })
                favorite.save()
                .then((favorite) => {
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(favorite);
                })  
            })
            .catch((err) => next(err));
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /Favorites');
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
        Favorite.deleteMany()
            .then(response => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(response);
            })
            .catch(err => next(err));
    });

favoriteRouter
    .route('/:campsiteId')
    .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
    .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
        Favorite.findById(req.params.campsiteId)
        .then(campsite => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(campsite);
        })
        .catch(err => next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOne({ user: req.user._id })
            .then(favorite => {
                if (favorite) {
                    if (favorite.campsites.includes(req.params.campsiteId)){
                        res.send('Yo, this campsite is already a favorite!')
                    } else {
                        favorite.campsites.push(req.params.campsiteId);
                        favorite.save()
                        .then((favorite) => {
                            res.statusCode = 200;
                            res.setHeader("Content-Type", "application/json");
                            res.json(favorite);
                        })  
                    }
                } else if (!favorite) {
                    Favorite.create({user: req.user._id, campsites: [{_id: req.params.campsiteId}]})
                        .then(favorite => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorite);
                        })
                        
                } else {
                    res.send('I do not know what the crap is going on')
                }
                // req.body.campsites.forEach(favorite => {
                //     if (!favorite.campsites.includes(favorite._id)) {
                //         favorite.campsites.push(favorite)
                //     }
                // })
                // favorite.save() 
            })
            .catch((err) => next(err));
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /Favorites');
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
        Favorite.deleteMany()
            .then(response => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(response);
            })
            .catch(err => next(err));
    });



module.exports = favoriteRouter; 


// SAVING THIS IN CASE I SCREWED SOMETHING UP ABOVE ...
// .then(favorite => {
//     if (!favorite) {
//         Favorite.create({user: req.user._id, campsites: req.body})
//             .then(favorite => {
//                 favorite.user = req.user._id;
//                 req.body.forEach(campsite => {
//                     favorite.campsites.push(campsite);
//                 })
//             })
//         favorite.save()
//             .then((favorite) => {
//                 res.statuscode = 200;
//                 res.setHeader("Content-Type", "application/json");
//                 res.json(favorite);
//             })
//     } else {

//         req.body.forEach(campsite => {
//             if (!favorite.campsites.includes(campsite)) {
//                 favorite.campsites.push(campsite);
//             }
//         })
//     }
// })