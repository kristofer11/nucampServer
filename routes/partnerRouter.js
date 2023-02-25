const express = require('express');
const partnerRouter = express.Router();
const Partner = require('../models/partner');

partnerRouter.route('/')
    .get((req, res, next) => {
        Partner.find()
            .then(partners => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(partners);
            })
            .catch(err => next(err));
    })
    .post((req, res) => {
        Partner.create(req.body)
            .then(partner => {
                console.log('Partner Created ', partner);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(partner);
            })
            .catch(err => (err));
    })
    .put((req, res) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /partners');
    })
    .delete((req, res) => {
        Partner.deleteMany()
        .then(response => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(response);
        })
        .catch(err => next(err));
    });

partnerRouter.route('/:partnerId')
    .all((req, res, next) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        next();
    })
    .get((req, res) => {
        res.end(`Will send ${req.params.partnerId} to you`)
    })
    .post((req, res) => {
        res.statusCode = 403;
        res.end(`POST operation not supported individual /partners/${req.params.partnerId}`)
    })
    .put((req, res) => {
        res.write(`Updating the partner: ${req.params.partnerId}`)
        res.end(`Will update the partner: ${req.body.name}
    with description: ${req.body.description}`)
    })
    .delete((req, res) => {
        res.end(`Deleting partner: ${req.params.partnerId}`)
    })

module.exports = partnerRouter; 