const axios = require("axios"),
  consts = require("../consts"),
  errorObj = require("../errorObj"),
  handlers = require("./handlers");

const { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI, SCOPE, STATE } = consts;

module.exports = {
  //This function will redirect the url to Linkedin, in order to get Access code
  linkedinConnect(req, res) {
    console.log(`getting Access code`);
    res.redirect(
      `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&state=${STATE}&scope=${SCOPE}`
    );
  },
  //This function will get the Access code and use it to post request to linkedin in order to get AccessToken
  getAccessToken(req, res, next) {
    const authCode = req.query.code;
    const state = req.query.state;

    if (state !== STATE) {
      //checking for possible CSRF attack
      res.json(res.json(errorObj(404, "atack suspection")));
    }

    const params = new URLSearchParams();
    params.append("grant_type", "authorization_code");
    params.append("code", authCode);
    params.append("redirect_uri", REDIRECT_URI);
    params.append("client_id", CLIENT_ID);
    params.append("client_secret", CLIENT_SECRET);
    params.append("state", STATE);

    axios //request for Access Token
      .post("/oauth/v2/accessToken", params, {
        baseURL: "https://www.linkedin.com",
        headers: {
          Host: "www.linkedin.com",
          "Content-Type": "application/x-www-form-urlencoded"
        }
      })
      .then(response => {
        res.locals.accessToken = response.data.access_token; //passing accessToken as local var in order to use it in the next middlewear
        next();
      })
      .catch(err => {
        console.log(`error occurred- ${err}`);
        res.json(errorObj(404, err));
      });
  },
  //This function will get the Access Token and use it to fetch information from Linkedin
  setAccessToken(req, res, next) {
    const { accessToken } = req.res.locals; //get accessToken as local var in order to use it to fetch information from Linkedin
    handlers
      .getLinkdinInfo(accessToken) //get User Linkedin information
      .then(result => handlers.saveUserToDb(result)) //save information to DB
      .then(id => {
        process.env.ID = id; //set id as env var in order to prevent passing it in URL
        res.redirect(`/questions`);
      })
      .catch(err => {
        console.log(`error occurred- ${err}`);
        res.json(errorObj(404, err));
      });
  }
};
