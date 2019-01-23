const consts = require("../consts.js"),
  User = require("../models/user"),
  Photo = require("../models/photo"),
  axios = require("axios"),
  errorObj = require("../errorObj");

const { UNSPLASH_KEY, UNSPLASH_SECRET } = consts;
let id = "";
const axiosCreat = axios.create({
  baseURL: `https://api.unsplash.com`,
  headers: {
    Authorization: `Client-ID ${UNSPLASH_KEY}`
  }
});

module.exports = {
  async getphotos(req, res) {
    if (Object.entries(req.query).length === 1) {
      return res.json(
        errorObj(404, "Please send Answers as parameters in post request")
      );
    } else {
      let answers = req.query;
      id = req.query.id;
      delete answers.id;
      let numOfParams = Object.keys(answers).length,
        numOfphotos = 4,
        indexOfPhoto = 0;

      let results = new Array();

      for (let i = 0; i < numOfParams; i++) {
        let result = await axiosCreat
          .get("/search/photos", {
            params: {
              query: `${answers[Object.keys(answers)[i]]}`,
              orientation: "landscape",
              per_page: numOfphotos
            }
          })
          .catch(err => res.json(errorObj(404, err)));

        results.push(result.data.results);
      }

      for (let i = 0; i < numOfParams; i++) {
        let photoId = results[i][indexOfPhoto].id,
          photoUrl = results[i][indexOfPhoto].urls.regular;

        Photo.findOne({ id: photoId }, (err, result) => {
          if (err) res.json(errorObj(404, err));
          if (!result) {
            const photo = new Photo({
              id: photoId,
              url: photoUrl
            });

            photo.save(err => {
              if (err) res.json(errorObj(404, err));
              else {
                console.log(`Saved photo ${JSON.stringify(photo)}`);
              }
            });
          }

          User.findOne({ id: id }, (err, result) => {
            if (err) res.json(errorObj(404, err));
            else if (result) {
              result.photos.push(`${photoId}`);
              result.save(err => {
                if (err) res.json(errorObj(404, err));
              });
            }
          });
        });
      }
    }
    res.redirect(`./showProfile?id=${id}`);
  }
};
