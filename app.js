
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
    app.use(connect.errorHandler({dumpExceptions: true, showStack: true})); 
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

app.get('/get-key-value/:key', function(req, res){
  var key = req.params.key;
  redis.type(key, function(err, type){
    if(type == 'string'){
      redis.get(key, function(err, reply){
        res.send({
          'result': reply.toString(),
          'keyType': 'string'
        });
      });
    }else if(type == 'set'){
      redis.smembers(key, function(err, reply){
        redisclient.convertMultiBulkBuffersToUTF8Strings(reply);
        res.send({
          'result': reply,
          'keyType': 'set'
        });
      });
    } else if(type == 'zset'){
      redis.zrange(key, 0, -1, function(err, reply){
        redisclient.convertMultiBulkBuffersToUTF8Strings(reply);
        res.send({
          'result': reply,
          'keyType': 'zset'
        });
      });
    } else if(type == 'hash'){
      redis.hgetall(key, function(err, reply){
        redisclient.convertMultiBulkBuffersToUTF8Strings(reply);
        res.send({
          'result': reply,
          'keyType': 'hash'
        });
      });
    } else if(type == 'list'){
      redis.lrange(key, 0, -1, function(err, reply){
        redisclient.convertMultiBulkBuffersToUTF8Strings(reply);
        res.send({
          'result': reply,
          'keyType': 'list'
        });
      });
    }
  });
});

app.get('/get-key-type/:key', function(req, res){
     var reqKey = req.params.key;

     redis.type(reqKey, function(err, type){
       res.send({
         'keyType': type
        });
     });
});

app.post('/run-command', function(req, res){
  var cmd = req.params.cmd;
  
});

// Only listen on $ node app.js

if (!module.parent) app.listen(3000);
