const User = require("../models/user"),
  errorObj = require("../errorObj"),
  Photo = require("../models/photo");

module.exports = {
  async showProfile(req, res) {
    let id = process.env.ID;
    let response = await User.findOne({ id: id }, (err, result) => {
      if (err) res.json(errorObj(404, err));
    });

    refactorPhotos(response)
      .then(response => res.json(response))
      .catch(err => errorObj(404, err));
  },

  async updateSummary(req, res) {
    let summary = req.body.summary;
    console.log(summary);

    const conditions = { id: process.env.ID };
    const doc = { $set: { "profile.summary": `${summary}` } };

    await User.updateOne(conditions, doc, (err, result) => {
      if (err) res.json(errorObj(404, err));
      else if (result.nModified == 0) res.json(errorObj(404, "did not update"));
      else res.redirect("/showProfile");
    });
  }
};

//function will replace photos id in photo url
async function refactorPhotos(response) {
  let refactoredResponse = response;
  for (let i = 0; i < refactoredResponse.__v; i++) {
    let result = await Photo.findOne(
      { id: refactoredResponse.photos[i] },
      (error, result) => {
        if (error) res.json(errorObj(404, error));
      }
    );
    refactoredResponse.photos[i] = result.url;
  }
  return refactoredResponse;
}
