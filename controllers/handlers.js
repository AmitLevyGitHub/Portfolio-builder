const axios = require("axios"),
  errorObj = require("../errorObj"),
  User = require("../models/user"),
  Photo = require("../models/photo");

module.exports = {
  getLinkdinInfo(accessToken) {
    return axios.get(
      "/v1/people/~:(id,first-name,last-name,summary,positions,num-connections,picture-url,headline)?format=json",
      {
        baseURL: "https://api.linkedin.com",
        headers: {
          Host: "www.linkedin.com",
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: "Bearer " + accessToken
        }
      }
    );
  },

  async saveUserToDb(response) {
    const id = response.data.id;
    const position = {
      title: undefined,
      company: undefined,
      summary: undefined
    };

    if (response.data.positions._total == 1) {
      position.title = response.data.positions.values[0].title;
      position.company = response.data.positions.values[0].company.name;
      position.summary = response.data.positions.values[0].summary;
    }

    await User.findOne({ id: `${response.data.id}` }, (err, result) => {
      if (err) throw err;
      else {
        if (!result) {
          const user = new User({
            id: `${response.data.id}`,
            firstName: `${response.data.firstName}`,
            lastName: `${response.data.lastName}`,
            profile: {
              headLine: `${response.data.headline}`,
              summary: `${response.data.summary}`,
              numOfConnections: `${response.data.numConnections}`,
              profilePicture: `${response.data.pictureUrl}`,
              currentPosition: {
                title: `${response.data.positions.values[0].title}`,
                company: `${response.data.positions.values[0].company.name}`,
                summary: `${response.data.positions.values[0].summary}`
              }
            }
          });

          user.save(err => {
            if (err) return res.json(errorObj(404, err));
          });
        }
      }
    });
    return id;
  },

  async savePhotoToDb(results, id, numOfParams, indexOfPhoto) {
    for (let i = 0; i < numOfParams; i++) {
      let photoId = results[i][indexOfPhoto].id,
        photoUrl = results[i][indexOfPhoto].urls.regular;

      await Photo.findOne({ id: photoId }, (err, result) => {
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
};
