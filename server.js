var express = require('express');
var app = express();
var path = __dirname + '/';
var router = express.Router();

var app_port;

app.use(express.static(__dirname + '/'));

router.get("/",function(req,res){
  res.sendFile(path + "index.html");
});

app.use("/",router);

var remoteServer = {
    host: 'localhost',
    port: 4000
};

if (app.get('env') === 'development') {
    // set app defaults for local
    app_port = process.env.PORT || 6000;
 } else {
    //set app defaults for heroku
    app_port = process.env.PORT;
 }

app.use(function(req, res, next){
    if (req.url.indexOf('ui') > -1) {
        if (req.file) {
            console.log('file upload :: ' + req.file);
            var filePath = req.file.path;
            console.dir(req.file);
            var dataObj = {
                fileName: req.file.fileName,
                filePath: req.file.path
            };
            req.body.fileName = req.file.originalname;
            req.body.filePath = req.file.path;
        } 
        if (req.method == 'POST') {
            var ipStr = req.connection.remoteAddress;
            req.body['ipAddress'] = ipStr.substring(ipStr.lastIndexOf(':') + 1, ipStr.length);
            var data = JSON.stringify(req.body);
            console.log('data ::' + data);
            var pOptions = {
                host: remoteServer.host,
                port: remoteServer.port,
                path: req.url,
                method: req.method,
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(data)
                }
            };
            if (req.headers && req.headers.authorization) {
                pOptions.headers.Authorization = req.headers.authorization;
            }

            console.log("POST REQUEST :: \n" + JSON.stringify(req.body, null, 2));
            sendRequest(pOptions, data, function(response) {
                res.json(response);
            });
        } else  if (req.method == 'PUT') {
            var data = JSON.stringify(req.body);
            var pOptions = {
                host: remoteServer.host,
                port: remoteServer.port,
                path: req.url,
                method: req.method,
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(data)
                }
            };

            if (req.headers && req.headers.authorization) {
                pOptions.headers.Authorization = req.headers.authorization;
            }

            console.log("PUT REQUEST :: \n" + JSON.stringify(pOptions, null, 2));
            sendRequest(pOptions, data, function(response) {
                res.json(response);
            });
        } else  if (req.method == 'DELETE') {
            var data = JSON.stringify(req.body);
            var dOptions = {
                host: remoteServer.host,
                port: remoteServer.port,
                path: req.url,
                method: req.method,
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(data)
                }
            };

            if (req.headers && req.headers.authorization) {
                dOptions.headers.Authorization = req.headers.authorization;
            }

            console.log("DELETE REQUEST :: \n" + JSON.stringify(dOptions, null, 2));
            sendRequest(dOptions, data, function(response) {
                res.json(response);
            });
        } else if (req.method == 'GET') {
            var gOptions = {
                host: remoteServer.host,
                port: remoteServer.port,
                path: req.url,
                method: req.method,
                headers: {
                    'Content-Type': 'application/json'
                }
            };

            if (req.headers && req.headers.authorization) {
                gOptions.headers.Authorization = req.headers.authorization;
            }

            console.log("GET REQUEST :: \n" + JSON.stringify(gOptions, null, 2));

            sendGetRequest(gOptions, http, function(response) {
                if (gOptions.path.indexOf('/ui/filedownload') == -1 && gOptions.path.indexOf('/ui/generateReport') == -1 && gOptions.path.indexOf('/ui/downloadTimesheet') == -1) {
                    res.json(response);
                } else {                    
                    if (response.errors) {
                        res.json(response);
                    } else {
                        if (gOptions.path.indexOf('/ui/filedownload') > -1) {
                            var contentDisposition = response.headers['content-disposition'];
                            var file = contentDisposition.substr(21, 43);
                            var fileName = contentDisposition.substr(81);
                            res.setHeader('Content-disposition', contentDisposition);
                            res.setHeader('Content-type', response.headers['content-type']);
                            res.download(file, fileName);
                        } else if (gOptions.path.indexOf('/ui/downloadTimesheet') > -1) {
                            var contentDisposition = response.headers['content-disposition'];
                            console.log('in downloadTimesheet response :::');
                            var file = contentDisposition.substr(21, 43);                            
                            var fileName = contentDisposition.substr(contentDisposition.lastIndexOf('/') + 1);
                            console.log(fileName);                         
                            res.setHeader('Content-disposition', contentDisposition);
                            res.setHeader('Content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                            res.download(file, fileName);
                        } else {
                            var contentDisposition = response.headers['content-disposition'];
                            if (contentDisposition) {
                                var file = contentDisposition.substr(21, 100);
                                var fileName = contentDisposition.substr(81);
                                res.setHeader('Content-disposition', contentDisposition);
                                res.setHeader('Content-type', response.headers['content-type']);
                                res.download(file, fileName);
                            } else {
                                res.send({status: 'Error', result: 'Invalid token'});
                            }                            
                        }                        
                    }
                }
            });
        }
    } else {
        next();
    }
});

function sendRequest(options, data, callback) {
    var req = http.request(options, function(res) {
        res.setEncoding('utf8');
        var response = '';
        res.on('data', function (chunk) {
             response += chunk;
        });
        res.on('error', function (error) {
            callback({status: 'Error', error: error});
        });
        res.on('end', function() {
                try {
                    callback(JSON.parse(response));
                } catch(e) {
                    callback({status: 'Error', error: response});
                }
        });
    });
    req.end(data);
}

function sendGetRequest(options, httpType, callback) {
    var req = httpType.get(options, function(res) {
        if (options.path.indexOf('/ui/filedownload') == -1 && options.path.indexOf('/ui/generateReport') == -1 && options.path.indexOf('/ui/downloadTimesheet') == -1) {
            res.setEncoding('utf8');
            var response = '';
            res.on('data', function (chunk) {
                response += chunk;
            });
            res.on('end', function () {
                if (response.length) {
                    try {
                        callback(JSON.parse(response));
                    } catch (e) {
                        var resObj = {status: 'Failure', errors: [response]}
                        callback(resObj);
                    }
                } else {
                    callback({});
                }
            });
        } else {
            console.log(' file or report :::');
            var response = '';
            callback(res);
        }
    });
    req.on('error', function(e) {
        console.log('problem with request: ' + e.message);
    });
    req.end();
}

var server = app.listen(app_port, function () {
   var host = server.address().address
   var port = server.address().port   
   console.log("Monica bot listening at http://%s:%s", host, port)
});