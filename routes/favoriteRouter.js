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
            .populate("user")
            .populate("campsites")
            .then(favorites => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorites);
            })
            .catch(err => next(err));
    })
    // POST to /favorites: When the user does a POST operation on '/favorites' by including a message in the format of [{"_id":"campsite ObjectId"},  . . . , {"_id":"campsite ObjectId"}] in the body of the message (see Testing section for example), you will check if the user has an associated favorite document. Use Favorite.findOne({user: req.user._id }) for this. 
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
        Favorite.findOne({ user: req.user._id })
            .then(favorite => {
                if (favorite) {
                    req.body.forEach(campsite => {
                        if (!favorite.campsites.includes(campsite)) {
                            favorite.campsites.push(campsite);
                        }
                    })
                } else {
                    Favorite.create()
                        .then(favorite => {
                            favorite.user = req.user._id;
                            req.body.forEach(campsite => {
                                favorite.campsites.push(campsite);
                            })
                        })
                    favorite.save()
                        .then((favorite) => {
                            res.statuscode = 200;
                            res.setHeader("Content-Type", "application/json");
                            res.json(favorite);
                        })
                }
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

// favoriteRouter
//     .route('/:campsiteId')
//     .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
//     .get(cors.cors, authenticate.verifyUeser, (req, res, next) => {
//         Favorite.find({ user: req.user._id })
//             .then(favorites => {
//                 res.statusCode = 200;
//                 res.setHeader('Content-Type', 'application/json');
//                 res.json(favorites);
//             })
//             .catch(err => next(err));
//     })
//     .post(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
//         Favorite.create(req.body)
//             .then(favorite => {
//                 console.log('Favorite Created ', favorite);
//                 res.statusCode = 200;
//                 res.setHeader('Content-Type', 'application/json');
//                 res.json(favorite);
//             })
//             .catch(err => (err));
//     })
//     .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
//         res.statusCode = 403;
//         res.end('PUT operation not supported on /Favorites');
//     })
//     .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
//         Favorite.deleteMany()
//             .then(response => {
//                 res.statusCode = 200;
//                 res.setHeader('Content-Type', 'application/json');
//                 res.json(response);
//             })
//             .catch(err => next(err));
//     });



module.exports = favoriteRouter; 