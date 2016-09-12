var express = require('express')
    , morgan = require('morgan')
    , bodyParser = require('body-parser')
    , methodOverride = require('method-override')
    , app = express()
    , port = process.env.PORT || 3000
    , jsdom = require("jsdom")
    , async = require("async")
    , router = express.Router();

app.use(express.static(__dirname + '/views')); // set the static files location for the static html
app.use(express.static(__dirname + '/public')); // set the static files location /public/img will be /img for users
app.use(morgan('dev'));                     // log every request to the console
app.use(bodyParser());                      // pull information from html in POST
app.use(bodyParser.urlencoded({ extended: true })); 

app.use(methodOverride());                  // simulate DELETE and PUT

router.get('/', function(req, res, next) {
    res.render('index.html');
});

router.post('/getPDFLinks', function(req, res, next) { 
    var urls = req.body.urls.split(',');
    var PdfLinkCollection = [];
    var errors = [];
    async.each(urls, function(url, callback) {
        jsdom.env(
            url,
            ["http://code.jquery.com/jquery.js"],
            function (err, window) {
                if(!err) {
                    var pdfUppercase = window.$('a[href*=".PDF"]').attr('href'),
                    pdfLowercase = window.$('a[href*=".pdf"]').attr('href');
                    if(pdfUppercase) {
                        PdfLinkCollection.push(window.location.origin + pdfUppercase);
                    }
                    if(pdfLowercase) {
                        PdfLinkCollection.push(window.location.origin + pdfLowercase);
                    }
                } else {
                    errors.push(err);
                }
                callback(err);
            }
        );
    }, function(err) {
        if(!err) {
            res.send({
                PDF: PdfLinkCollection,
                Error: errors
            });
        } else {
            res.send(500, errors);
        }
    });
    
});

app.use('/', router);

app.listen(port);
console.log('App running on port', port);