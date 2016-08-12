var express = require('express');
var router = express.Router();
var rp = require('request-promise');
var querystring = require('qs');
function generateRPRequest(path, method, userName, pw, postBody, qs) {
    var baseUri = 'https://174.129.47.63:9443'    
    var options = {
        uri: baseUri + path,
        port: 9443,
        method: method,
        rejectUnauthorized: false,
        requestCert: false,
        json: true
    };

        var headers = {
        Authorization: 'Basic ' + new Buffer(userName + ':' + pw).toString('base64'),
        'cache-control': 'no-cache',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
    };
    options.headers = headers;
    // if (postBody) options.body = postBody;
    if (qs) options.qs = qs;
    return options;
}



router.get('/processes', function (req, res, next) {
    var options = generateRPRequest('/rest/bpm/wle/v1/exposed/process','GET','mike.d', 'cedrus');
    rp(options).then(function (body) {
        res.status(200).json(body);
    }).catch(next);
});

router.post('/processes/start', function (req, res, next) {
    var path = "/rest/bpm/wle/v1/process";
    var qs = {
        action: "start",
        bpdId: req.body.itemID,
        branchId : req.body.branchID,
    };
    var options = generateRPRequest(path, 'POST', 'mike.d', 'cedrus', null, qs);
    rp(options).then(function (body) {
        var taskId = body.data.tasks[0].tkiid;
        
        var params = {
              currentOrder : req.body.currentOrder || null,
              currentCustomer: req.body.currentCustomer || null,
            };

        var qs = {
            action:"finish",
            params:JSON.stringify(params)
        };
        // var path2 = "/rest/bpm/wle/v1/task/" + taskId + "?action=finish&params=%7B%22currentOrder%22%3A%7B%22totalCost%22%3A20001%2C+%22shippingAddress%22%3A%7B%22state%22%3A%22NY%22%7D%7D%7D&parts=all"
        path = "/rest/bpm/wle/v1/task/" + taskId;
        console.log(path);

        var options = generateRPRequest(path, 'PUT', 'mike.d', 'cedrus', null, qs);
        return rp(options);
    }).then(function (body) {
        res.status(200).json(body);
    }).catch(next);
});

router.get('/status/:processId', function (req, res, next) {
    var path = "/rest/bpm/wle/v1/process/" + req.params.processId + "?parts=all";
    var options = generateRPRequest(path, 'GET', 'mike.d', 'cedrus');
    rp(options).then(function (body) {
        var tasks = body.data.tasks;
        var orderState = {
            currentStep: "Unable to Determine, please check your Process Number"
        };
        for (var i=0; i < tasks.length; i++){
            if (tasks[i].state == "STATE_READY"){
                orderState.currentTask = tasks[i];
                orderState.currentStep = tasks[i].displayName;
                break;
            }
        }
        res.status(200).json(orderState);
    }).then(null, next);
});

router.post('/attrSearch', function (req, res, next) {
    var path = '/rest/bpm/wle/v1/search/query?';
    var query = '';
    var fields = Object.keys(req.body);
    fields.forEach(function (fieldName) {
        if (req.body[fieldName]) query += ('condition=' + fieldName + '%7C' + req.body[fieldName] + '&');
    });
    query += 'organization=byInstance&run=true&shared=false&filterByCurrentUser=true';
    path += query;
    console.log(path);
    var options = generateRPRequest(path, 'PUT','mike.d', 'cedrus')
    rp(options)
        .then(function (body) {
            /*var responseData = body.data.data;
            for (var i = responseData.length - 1; i >= 0; i--) {
                responseData[i].taskDetails = {};
                var taskDetailsPath = '/rest/bpm/wle/v1/task/' + responseData[i].taskId + "?parts=all";
                var taskDetailsOptions = generateRPRequest(taskDetailsPath, 'GET', 'mike.d', 'cedrus');
                rp(options).then(function(taskDetailsBody){
                    responseData[i].taskDetails = taskDetailsBody.data;
                });
                console.log('+++++++++++++++++++++++++++++++++', responseData[i].taskDetails);
            };*/
            res.status(200).json(body);
        })
});

router.get('/taskDetails/:taskId', function(req, res, next){
    var path='/rest/bpm/wle/v1/task/' + req.params.taskId + "?parts=all";
    var params = {
                'action':'getdetails',
                'taskIDs':req.params.taskId,
                'parts':'all'
                };
    var options = generateRPRequest(path, 'GET', 'mike.d', 'cedrus');
    rp(options).then(function (body) {
        res.status(200).json(body);
    }).then(null, next);
});

router.post('/finishTask/:taskId/:taskState', function(req, res, next){
    var path = '/rest/bpm/wle/v1/task/'+req.params.taskId;
    var params = {
          approval : req.params.taskState
        };

    var qs = {
        action:"finish",
        params:JSON.stringify(params)
    };
    var options = generateRPRequest(path, 'POST', 'mike.d', 'cedrus', null, qs);
    rp(options).then(function (body) {
        res.send(body);
    }).catch(function(err){
        res.send(err);
    });

});



router.get('/getSFSearchClientSecret', function(req, res, next){
    if(process.env.SF_SEARCH_ORDER_CLIENT_SECRET){
        res.status(200).send(process.env.SF_SEARCH_ORDER_CLIENT_SECRET);
    }else{
        res.status(500).send('No Environment Varible Set');
    }
});


module.exports = router;