const express = require("express");
const router = express.Router();
const sql = require("./db.js");
const bcrypt = require("bcryptjs");
const jwt = require("./../../jwt");
const { v4: uuidv4 } = require("uuid");
const axios = require("axios");
var request = require("request");

const CLIENT_ID = "nmMxOM19SbKzO569etJieg";
const CLIENT_SECRET = "ONiSYqUDhUmTnFv56fmmbtO5lnY5A0zC";
const URL = "https://zoom.us/oauth/token";
const GRANT_TYPE = "authorization_code";
const CODE = "T0hRqpjQvH_pMYMaSYaTmeH83cpKFw8RA";
const REDIRECT_URL = "https://sandbox.1-to-all.com/zoomphone/login";
const AUTH =
  "Basic bm1NeE9NMTlTYkt6TzU2OWV0SmllZzpkendkSDFDZk5yQWZtRmo5aDZYa0l0MDZYUzRmck0xeg==";
let USER_TOKEN = "";

router.get("/oauth", (req, res) => {
  axios
    .post("https://zoom.us/oauth/token")
    .then(function (response) {
      console.log(response);
    })
    .catch(function (error) {
      console.log(error);
    });

  //   axios({
  //     method: "POST",
  //     url: "https://zoom.us/oauth/token",
  //     qs: {
  //       grant_type: "authorization_code",
  //       //The code below is a sample authorization code. Replace it with your actual authorization code while making requests.
  //       code: "6ApzmlYnGp_pMYMaSYaTmeH83cpKFw8RA",
  //       //The uri below is a sample redirect_uri. Replace it with your actual redirect_uri while making requests.
  //       redirect_uri: "https://sandbox.1-to-all.com/zoomphone/login",
  //     },
  //     headers: {
  //       "Content-type": "application/json; charset=UTF-8",
  //       Authorization:
  //         "Basic bm1NeE9NMTlTYkt6TzU2OWV0SmllZzpPTmlTWXFVRGhVbVRuRnY1NmZtbWJ0TzVsblk1QTB6Qw==",
  //     },
  //   })
  //     .then((response) => {
  //       console.log(response.data.access_token);
  //       res.status(200).json(response.data);
  //       return;
  //     })
  //     .catch((err) => console.log(err));
});

router.post("/oauthToken", (req, res) => {
  const code = req.body.code;

  const options = {
    method: "POST",
    url: "https://zoom.us/oauth/token",
    qs: {
      grant_type: "authorization_code",
      //The code below is a sample authorization code. Replace it with your actual authorization code while making requests.
      code: code,
      //The uri below is a sample redirect_uri. Replace it with your actual redirect_uri while making requests.
      redirect_uri: "https://sandbox.1-to-all.com/zoomphone/login",
    },
    headers: {
      /**The credential below is a sample base64 encoded credential. Replace it with "Authorization: 'Basic ' + Buffer.from(your_app_client_id + ':' + your_app_client_secret).toString('base64')"
       **/
      Authorization:
        "Basic bm1NeE9NMTlTYkt6TzU2OWV0SmllZzpkendkSDFDZk5yQWZtRmo5aDZYa0l0MDZYUzRmck0xeg==",
    },
  };

  request(options, function (error, response, body) {
    if (error) throw new Error(error);
    console.log(body);

    res.status(200).json(JSON.parse(body));
    return;
  });
});


router.post("/refreshOauthToken", (req, res) => {
    const refreshToken = req.body.refreshToken;
  
    const options = {
      method: "POST",
      url: "https://zoom.us/oauth/token",
      qs: {
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      },
      headers: {
        Authorization:
          "Basic bm1NeE9NMTlTYkt6TzU2OWV0SmllZzpkendkSDFDZk5yQWZtRmo5aDZYa0l0MDZYUzRmck0xeg==",
          
      },
    };
  
    request(options, function (error, response, body) {
      if (error) throw new Error(error);
      console.log(body);
  
      res.status(200).json(JSON.parse(body));
      return;
    });
  });

router.post("/login", (req, res) => {
  const { username, password } = req.body;
  sql.query(
    "SELECT * FROM users WHERE username = ?",
    username,
    (error, doc) => {
      if (error) {
        res.status(500).end("Inernal error.");
        return;
      } else if (!doc[0]) {
        res
          .status(200)
          .json({ auth: false, token: "", msg: "Invalid username." });
      } else {
        const isValidPassword = bcrypt.compareSync(password, doc[0].password);
        if (isValidPassword == false) {
          res
            .status(200)
            .json({ auth: false, token: "", msg: "Invalid password." });
        } else {
          const payload = { id: doc[0].uuid, username: doc[0].username };
          const token = jwt.sign(payload);
          sql.query(
            "SELECT * FROM customers WHERE userId = ?",
            doc[0].uuid,
            (error, docCustomer) => {
              if (error) {
                res.status(500).end("Inernal error.");
                return;
              } else if (!docCustomer[0]) {
                res.json({
                  auth: true,
                  token: token,
                  msg: "Success",
                  customer: "PowerAdmin",
                });
              } else {
                // res.json({test : "ok"});
                res.json({
                  auth: true,
                  token: token,
                  msg: "Success",
                  userId: doc[0].uuid,
                  customer: docCustomer[0].customerName,
                });
                return;
              }
            }
          );
          // res.json({ auth: true, token: token, msg: "Success-9" ,id : doc[0].uuid });
        }
      }
    }
  );
});

router.post("/testRegister", (req, res) => {
  const { username, password, status } = req.body;
  const hashPassword = bcrypt.hashSync(password, 8);
  const id = uuidv4();
  let operation = "Insert into";
  let table = " users SET ?";
  // let dataQuery = " (uuid, username, password, status)"
  // let dataValue = " VALUES (?, '?', '?', ?)";
  // let dataInsert = [id, username, hashPassword, status]
  const dataInsert = {
    uuid: id,
    username: username,
    password: hashPassword,
    status: status,
  };
  let sqlQuery = operation + table;
  //  + dataQuery + dataValue
  sql.query(sqlQuery, dataInsert, (err, result) => {
    if (err) {
      res.status(500).end("Inernal error." + err + "SQL " + sqlQuery);
    } else {
      if (result) {
        res.json({ message: "success" });
        return;
      } else {
        res.json({ message: "error" });
        return;
      }
    }
  });
});

router.post("/register", (req, res) => {
  const { password } = req.body;
  const hashPassword = bcrypt.hashSync(password, 8);
  req.body.password = hashPassword;
  Users.create(req.body, (err, doc) => {
    if (err) {
      res.status(500).json({ result: "nok" });
    } else {
      const token = jwt.sign({ username: req.body.username, id: doc._id });
      res.json({ result: "ok", token: token });
      return;
    }
  });
});

module.exports = router;
