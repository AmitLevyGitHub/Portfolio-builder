const User = require("../models/user"),
  errorObj = require("../errorObj"),
  Photo = require("../models/photo");

let response;

module.exports = {
  showProfile(req, res) {
    User.findOne({ id: req.query.id }, (err, result) => {
      if (err) res.json(errorObj(404, err));
      else if (result) {
        response = result;
      }

      for (let i = 0; i < response.__v; i++) {
        Photo.findOne({ id: response.photos[i] }, (error, result) => {
          if (error) res.json(errorObj(404, error));
          response.photos[i] = result.url;
        });
      }
    });

    res.json(response);
  }
};
