const User = require("../models/user"),
  errorObj = require("../errorObj"),
  Photo = require("../models/photo");

module.exports = {
  async showProfile(req, res) {
    let response = await User.findOne({ id: process.env.ID }, (err, result) => {
      if (err) res.json(errorObj(404, err));
    });

    refactorPhotos(response).then(response => res.json(response));
  }
};

//function will replace photos id in their url
async function refactorPhotos(response) {
  for (let i = 0; i < response.__v; i++) {
    await Photo.findOne({ id: response.photos[i] }, (error, result) => {
      if (error) res.json(errorObj(404, error));
      response.photos[i] = result.url;
    });
  }
  return response;
}
