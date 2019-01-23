const axios = require("axios"),
  consts = require("../consts"),
  errorObj = require("../errorObj"),
  handlers = require("./handlers");

const { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI, SCOPE, STATE } = consts;

module.exports = {
  linkedinConnect(req, res) {
    res.redirect(
      `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&state=${STATE}&scope=${SCOPE}`
    );
  },
  getAccessToken(req, res, next) {
    console.log("Get Auth Code");
    const authCode = req.query.code;
    const state = req.query.state;

    if (state !== STATE) {
      res.json(res.json(errorObj(404, "atack suspection")));
    }

    const params = new URLSearchParams();
    params.append("grant_type", "authorization_code");
    params.append("code", authCode);
    params.append("redirect_uri", REDIRECT_URI);
    params.append("client_id", CLIENT_ID);
    params.append("client_secret", CLIENT_SECRET);
    params.append("state", STATE);

    axios
      .post("/oauth/v2/accessToken", params, {
        baseURL: "https://www.linkedin.com",
        headers: {
          Host: "www.linkedin.com",
          "Content-Type": "application/x-www-form-urlencoded"
        }
      })
      .then(response => {
        res.locals.accessToken = response.data.access_token;
        next();
      })
      .catch(err => {
        res.send(`${err}`);
        console.log(`ERROR 1: ${err}`);
      });
  },
  setAccessToken(req, res, next) {
    const { accessToken } = req.res.locals;
    handlers
      .getLinkdinInfo(accessToken)
      .then(result => handlers.saveUserToDb(result))
      .then(id => {
        process.env.ID = id;
        res.redirect(`/questions`);
      })
      .catch(err => {
        res.send(`ERROR 2: ${err}`);
      });
  }
};
