const User = require("../models/user"),
  Photo = require("../models/photo"),
  errorObj = require("../errorObj");

module.exports = {
  //this function will display the Users document
  async showProfile(req, res) {
    let id = process.env.ID; //getting User id fron env vars in order to find the loged in User's information in DataBase
    //finding the User in DataBase
    let response = await User.findOne({ id: id }, (err, result) => {
      if (err) {
        console.log(`error occurred- ${err}`);
        res.json(errorObj(404, err));
      }
      if (!result) {
        console.log(
          `error occurred- User does not exist in DB, Please sign in with Linkedin}`
        );
        res.json(
          errorObj(
            404,
            `User does not exist in DB, Please sign in with Linkedin`
          )
        );
      }
    });

    refactorPhotos(response) //refactor information
      .then(response => res.json(response)) //display respones (refactored information) to browser
      .catch(err => {
        console.log(`error occurred- ${err}`);
        res.json(errorObj(404, err));
      });
  },

  //This function will update Summary field recived as a post request parameter in the Users document
  async updateSummary(req, res) {
    const summary = req.body.summary;

    const conditions = { id: process.env.ID };
    const doc = { $set: { "profile.summary": `${summary}` } };

    await User.updateOne(conditions, doc, (err, result) => {
      if (err) res.json(errorObj(404, err));
      else if (result.nModified == 0) {
        console.log(`Did not update`);
        res.json(errorObj(404, `User document Did not update`));
      } else {
        console.log(`Summary was Updated`);
        res.redirect("/showProfile");
      }
    });
  }
};

//This function will refactor photos saved in the User document as an Id, into their actual url saved in the Photo document
async function refactorPhotos(response) {
  let refactoredResponse = response; //creating a new argument to hold the new list of photo Urls, insead of photo id's
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
