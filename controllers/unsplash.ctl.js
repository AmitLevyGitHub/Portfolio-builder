const consts = require("../consts.js"),
  axios = require("axios"),
  errorObj = require("../errorObj"),
  handlers = require("./handlers");

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
    if (Object.entries(req.query).length === 0) {
      return res.json(
        errorObj(404, "Please send Answers as parameters in post request")
      );
    } else {
      let answers = req.query,
        id = process.env.ID;
      console.log(id);
      //delete answers.id;
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

      handlers.savePhotoToDb(results, id, numOfParams, indexOfPhoto);
      res.redirect(`./showProfile`);
    }
  }
};
