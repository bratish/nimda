
/**
 * Module dependencies.
 */

var express = require('express'),
    connect = require('connect'),
    sys = require("sys"),
    redisclient = require('./deps/redis-client'),
    Buffer = require("buffer").Buffer,
    redis = redisclient.createClient(),
    commands = [
    "append",
    "auth",
    "bgsave",
    "blpop",
    "brpop",
    "dbsize",
    "decr",
    "decrby",
    "del",
    "exists",
    "expire",
    "expireat",
    "flushall",
    "flushdb",
    "get",
    "getset",
    "hdel",
    "hexists",
    "hget",
    "hgetall",
    "hincrby",
    "hkeys",
    "hlen",
    "hmget",
    "hmset",
    "hset",
    "hvals",
    "incr",
    "incrby",
    "info",
    "keys",
    "lastsave",
    "len",
    "lindex",
    "llen",
    "lpop",
    "lpush",
    "lrange",
    "lrem",
    "lset",
    "ltrim",
    "mget",
    "move",
    "mset",
    "msetnx",
    "psubscribe",
    "publish",
    "punsubscribe",
    "randomkey",
    "rename",
    "renamenx",
    "rpop",
    "rpoplpush",
    "rpush",
    "sadd",
    "save",
    "scard",
    "sdiff",
    "sdiffstore",
    "select",
    "set",
    "setex",
    "setnx",
    "shutdown",
    "sinter",
    "sinterstore",
    "sismember",
    "smembers",
    "smove",
    "sort",
    "spop",
    "srandmember",
    "srem",
    "subscribe",
    "sunion",
    "sunionstore",
    "ttl",
    "type",
    "unsubscribe",
    "zadd",
    "zcard",
    "zcount",
    "zincrby",
    "zinter",
    "zrange",
    "zrangebyscore",
    "zrank",
    "zrem",
    "zrembyrank",
    "zremrangebyrank",
    "zremrangebyscore",
    "zrevrange",
    "zrevrank",
    "zscore",
    "zunion",
];

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

//app.post('/run-command', function(req, res){
//  var commands = req.body.cmd.split('|'),
//      cmdHash = {}, i = 0, j = 0,
//      lastOutput = null;
//
//  for(j = 0; j < commands.length; j++){
//    var words = commands[j].split(' '),
//        args = [];
//
//    for(i = 1; i < words.length; i++){
//      if(words[i].length > 0){
//        args.push(words[i]);
//      }
//    }
//    cmdHash[words[0]] = args;
//  }
//
//  for(var key in cmdHash){
//
//  }
//
////    res.send({'keys': cmdHash});
//});

// Only listen on $ node app.js

if (!module.parent) app.listen(3000);
