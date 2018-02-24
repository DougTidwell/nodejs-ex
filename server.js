//  OpenShift sample Node application
var express = require('express'),
    app     = express(),
    morgan  = require('morgan');

Object.assign=require('object-assign')

app.engine('html', require('ejs').renderFile);
app.use(morgan('combined'))

var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
    ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0',
    mongoURL = process.env.OPENSHIFT_MONGODB_DB_URL || process.env.MONGO_URL,
    mongoURLLabel = "";

if (mongoURL == null && process.env.DATABASE_SERVICE_NAME) {
  var mongoServiceName = process.env.DATABASE_SERVICE_NAME.toUpperCase(),
      mongoHost = process.env[mongoServiceName + '_SERVICE_HOST'],
      mongoPort = process.env[mongoServiceName + '_SERVICE_PORT'],
      mongoDatabase = process.env[mongoServiceName + '_DATABASE'],
      mongoPassword = process.env[mongoServiceName + '_PASSWORD']
      mongoUser = process.env[mongoServiceName + '_USER'];

  if (mongoHost && mongoPort && mongoDatabase) {
    mongoURLLabel = mongoURL = 'mongodb://';
    if (mongoUser && mongoPassword) {
      mongoURL += mongoUser + ':' + mongoPassword + '@';
    }
    // Provide UI label that excludes user id and pw
    mongoURLLabel += mongoHost + ':' + mongoPort + '/' + mongoDatabase;
    mongoURL += mongoHost + ':' +  mongoPort + '/' + mongoDatabase;

  }
}
var db = null,
    dbDetails = new Object();

var initDb = function(callback) {
  if (mongoURL == null) return;

  var mongodb = require('mongodb');
  if (mongodb == null) return;

  mongodb.connect(mongoURL, function(err, conn) {
    if (err) {
      callback(err);
      return;
    }

    db = conn;
    dbDetails.databaseName = db.databaseName;
    dbDetails.url = mongoURLLabel;
    dbDetails.type = 'MongoDB';

    console.log('Connected to MongoDB at: %s', mongoURL);
  });
};

app.get('/', function (req, res) {
  // try to initialize the db on every request if it's not already
  // initialized.
  if (!db) {
    initDb(function(err){});
  }
  if (db) {
    var col = db.collection('counts');
    // Create a document with request IP and current time of request
    col.insert({ip: req.ip, date: Date.now()});
    col.count(function(err, count){
      if (err) {
        console.log('Error running count. Message:\n'+err);
      }
      res.render('index.html', { pageCountMessage : count, dbInfo: dbDetails });
    });
  } else {
    res.render('index.html', { pageCountMessage : null});
  }
});

app.get('/horoscope/:sign', function (req, res) {
  if (req.params.sign == 'aries')
  horoscopeText = 'The stars won\'t say exactly what will happen today, \
but they suggest you say goodbye to your friends and loved ones.';
else if (req.params.sign == 'taurus')
  horoscopeText = 'The stars suggest you leave town until \
the whole thing blows over.';
else if (req.params.sign == 'gemini')
  horoscopeText = 'The stars stand corrected: turns out your \
irrational fears are completely justified.';
else if (req.params.sign == 'cancer')
  horoscopeText = 'The stars say something hilarious will happen to you \
today. Keep in mind that the stars have a really mean sense of humor.';
else if (req.params.sign == 'leo')
  horoscopeText = 'The stars say your enemies will forgive you today. \
They\'ll still press charges, but it won\'t be anything personal.';
else if (req.params.sign == 'virgo')
  horoscopeText = 'The stars say a steamroller figures prominently \
in your future. You shouldn\'t worry, as long as you drive a \
steamroller for a living.';
else if (req.params.sign == 'libra')
  horoscopeText = 'The stars say to stand up for yourself - today \
is no time to back down. They recommend standing up to \
someone small and unarmed.';
else if (req.params.sign == 'scorpio')
  horoscopeText = 'The stars say you should be grateful for all the \
wonderful friends in your life. All your friends are imaginary, \
so that\'s probably not a big deal.';
else if (req.params.sign == 'sagittarius')
  horoscopeText = 'The stars say a financial windfall could be yours \
today. The stars also rolled their eyes and said, "Yeah, right."';
else if (req.params.sign == 'capricorn')
  horoscopeText = 'The stars say you should treat yourself to a lavish \
dinner tonight. Their exact words: "As if it were your last meal."';
else if (req.params.sign == 'aquarius')
  horoscopeText = 'The stars say you should make a generous, \
unexpected gift to someone you barely know today. It probably won\'t \
get you out of hot water with Human Resources, but it couldn\'t hurt.';
else if (req.params.sign == 'pisces')
  horoscopeText = 'The stars say to approach a confrontation with \
kid gloves and everything will be fine...for your opponent, who\'s \
wearing brass knuckles. ';

res.set({'Access-Control-Allow-Origin': '*',
         'Access-Control-Allow-Headers':
         'Origin, X-Requested-With, Content-Type, Accept',
         'Cache-Control': 'no-cache, no-store, must-revalidate'})
   .json({'serviceName': serviceName,
          'horoscopeText': horoscopeText,
          'css': css});
});

app.get('/pagecount', function (req, res) {
  // try to initialize the db on every request if it's not already
  // initialized.
  if (!db) {
    initDb(function(err){});
  }
  if (db) {
    db.collection('counts').count(function(err, count ){
      res.send('{ pageCount: ' + count + '}');
    });
  } else {
    res.send('{ pageCount: -1 }');
  }
});

// error handling
app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500).send('Something bad happened!');
});

initDb(function(err){
  console.log('Error connecting to Mongo. Message:\n'+err);
});

app.listen(port, ip);
console.log('Server running on http://%s:%s', ip, port);

module.exports = app ;
