var fs = require('fs');
var express = require('express');
var router = express.Router();
var multer = require('multer');
var mime = require('mime');
var request = require('request');

// Configure multer library's storage location and generate a file extension
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/img/uploads');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '.' + mime.extension(file.mimetype));
    }
});
var upload = multer({ storage: storage });

/* GET face */
router.get('/', function (req, res) {
    res.render('face', { title: 'Face API' });
});

// POST face
router.post('/', upload.single('userPhoto'), function (req, res, next) {

    // Store image file locations
    var filePath = req.file ? req.file.path : '';
    var publicPath = filePath.substring(7); // Strip out /public for browser

    // Set API url
    var apiUrl = 'https://api.projectoxford.ai/face/v1.0/detect?returnFaceId=true&returnFaceLandmarks=true&faceAttributes=age,gender,headPose,smile,facialHair,glasses';

    // Configure the request library
    var options = {
        uri: apiUrl,
        headers: {
            'Ocp-Apim-Subscription-Key': process.env.CS_FACE_KEY,
            'Content-Type': 'application/octet-stream'
        },
        body: fs.readFileSync(filePath)
    };

    // POST to the Face API
    request.post(options, function (error, response) {

        // Store face information
        var faces = JSON.parse(response.body);

        // Render page with image data
        res.render('face', {
            title: 'Face API',
            image: publicPath,
            faces: faces,
            facesRaw: JSON.stringify(faces, null, '\t')
        });

    });

});

module.exports = router;