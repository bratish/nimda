
/**
 * Module dependencies.
 */

var express = require('express'),
    connect = require('connect'),
    sys = require("sys"),
    redisclient = require('./deps/redis-client'),
    Buffer = require("buffer").Buffer,
    redis = redisclient.createClient();

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
    app.set('views', __dirname + '/views');
    app.set('view engine', 'ejs');
    app.use(connect.bodyDecoder());
    app.use(connect.methodOverride());
//    app.use(connect.compiler({ src: __dirname + '/public', enable: ['less'] }));
    app.use(app.router);
    app.use(connect.staticProvider(__dirname + '/public'));
});

app.configure('development', function(){
    app.use(connect.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
   app.use(connect.errorHandler()); 
});

// Routes

app.get('/', function(req, res){
    res.render('index');
});

app.get('/get-keys/:sstr', function(req, res){
  var searchStr = req.params.sstr;
  redis.keys('*' + searchStr + '*', function(err, reply){
    redisclient.convertMultiBulkBuffersToUTF8Strings(reply);
    res.send({'searchStr': searchStr, 'keys': reply});
  });
});

//app.get('/list_of/:type', function(req, res){
//     var reqType = req.params.type,
//         arr = new Array(),
//         typeCalled = 0,
//         lasti = 0;
//
//     redis.keys('*', function(err, reply){
//        redisclient.convertMultiBulkBuffersToUTF8Strings(reply);
//        for(var i = 0; i < reply.length; i++){
//              lasti = i;
//              typeCalled++;
//              redis.type(reply[i], function(err, type){
//              if(type == reqType){
//                 arr.push(reply[i]);
//              }
//          });
//       }
//    });
//    sys.p(typeCalled);
//    sys.p(lasti);
//    if(typeCalled == lasti) res.send({'keys': arr});
//
//});
// Only listen on $ node app.js

if (!module.parent) app.listen(3000);
