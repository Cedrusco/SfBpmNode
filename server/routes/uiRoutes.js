var express = require('express');
var router = express.Router();
var rp = require('request-promise');
var path = require('path');
var sfutil = require('../utils');
var SF_CREATE_ORDER_CLIENT_SECRET = process.env.SF_CREATE_ORDER_CLIENT_SECRET;
var SF_SEARCH_ORDER_CLIENT_SECRET = process.env.SF_SEARCH_ORDER_CLIENT_SECRET;

router.route('/createOrder')
.get(function(req, res, next){
    //get the canvas details from session (if any)
    var canvasDetails = sfutil.getCanvasDetails(req);
    //the page knows if the user is logged into SF
    //res.render('../../public/client/views/createOrder.html',{canvasDetails : canvasDetails});
    res.render('index.html',{canvasDetails : canvasDetails});
    //res.sendFile(path.join(__dirname, '../../public/index.html'),{canvasDetails : canvasDetails});
}).post(function(req, res, next){
    sfutil.canvasCallback(req.body, SF_CREATE_ORDER_CLIENT_SECRET, function(error, canvasRequest){
        if(error){
            res.statusCode = 400;
            return res.render('error',{error: error});
        }
        //saves the token details into session
        sfutil.saveCanvasDetailsInSession(req,canvasRequest);
        return res.redirect('/createOrder');
    });
});

router.route('/searchOrder')
.get(function(req, res, next){
    var canvasDetails = sfutil.getCanvasDetails(req);
    //res.sendFile(path.join(__dirname, '../../public/index.html'));
    res.render('index.html',{canvasDetails:canvasDetails});
}).post(function(req, res, next){
    sfutil.canvasCallback(req.body, SF_SEARCH_ORDER_CLIENT_SECRET, function(error, canvasRequest){
        if(error){
            res.statusCode = 400;
            return res.render('error',{error: error});
        }
        //saves the token details into session
        sfutil.saveCanvasDetailsInSession(req,canvasRequest);
        return res.redirect('/searchOrder');
    });
});

router.route('/openTasks')
.get(function(req, res, next){
    res.render('index.html',{canvasDetails:{}});
});
module.exports = router;