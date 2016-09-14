var express = require('express');
var router = express.Router();

// Setup the request library with defaults needed for all HTTP calls
var request = require('request').defaults({
    json: true,
    headers: {
        'Ocp-Apim-Subscription-Key': process.env.CS_TEXT_KEY
    }
});

/* GET home page. */
router.get('/', function (req, res) {
    res.render('text-analytics', { title: 'Text Analytics' });
});

/* POST text for analysis */
router.post('/', function (req, res) {

    // Store the input text
    var input = { text: req.body.inputText };

    // Query APIs with the input text
    Promise
        .resolve(input)
        .then(detectLanguage)
        .then(keyPhrases)
        .then(sentiment)
        .then(function (data) {

            // Render page with data
            res.render('text-analytics', {
                title: 'Text Analytics',
                data: data
            });

        });

});

module.exports = router;

function detectLanguage(input) {

    return new Promise(function (resolve, reject) {

        // Set API url
        // TODO: We should consider moving the API Endpoint to configuration. Also seems like 
        // a good opportunity for a discovery type service ala. Office365 if we aren't considering
        // just allowing them to use tenant specific Endpoint
        var apiUrl = 'https://westus.api.cognitive.microsoft.com/text/analytics/v2.0/languages';

        // Configure the request library
        var options = {
            uri: apiUrl,
            body: {
                documents: [
                    {
                        id: '0',
                        text: input.text
                    }
                ]
            }
        };

        // POST to the Detect Language API
        request.post(options, function (error, response, body) {

            // Resolve with languages
            var output = input;
            output.language = body.documents[0].detectedLanguages[0];
            resolve(output);

        });

    });

}

function keyPhrases(input) {

    return new Promise(function (resolve, reject) {

        // Set API url
        var apiUrl = 'https://westus.api.cognitive.microsoft.com/text/analytics/v2.0/keyPhrases';

        // Configure the request library
        var options = {
            uri: apiUrl,
            json: true,
            body: {
                documents: [
                    {
                        id: "0",
                        language: input.language.iso6391Name,
                        text: input.text
                    }
                ]
            }
        };

        // POST to the Key Phrases API
        request.post(options, function (error, response, body) {

            // Resolve with phrases
            var output = input;
            output.keyPhrases = body.documents[0].keyPhrases;
            resolve(output);

        });

    });

}

function sentiment(input) {

    return new Promise(function (resolve, reject) {

        // Set API url
        var apiUrl = 'https://westus.api.cognitive.microsoft.com/text/analytics/v2.0/sentiment';

        // Configure the request library
        var options = {
            uri: apiUrl,
            body: {
                "documents": [
                    {
                        "id": "0",
                        "language": input.language.iso6391Name,
                        "text": input.text
                    }
                ]
            }
        };

        // POST to the Sentiment API
        request.post(options, function (error, response, body) {

            // Render page with analysis
            var output = input;
            output.sentiment = body.documents;
            resolve(output);

        });

    });

}