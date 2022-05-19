const express = require("express");
const router = express.Router();
const sql = require("./db.js");
const axios = require("axios");

//Your token will be expired at 08:30 04/30/2022 Do not publish or share your token with anyone.
const TOKEN =
  "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOm51bGwsImlzcyI6ImFZMDhQT21mUnNPUG5rd29JWE9Gd3ciLCJleHAiOjE2NzI0ODI2MDAsImlhdCI6MTY1MjI1ODkyM30.R9Kk-25pxtWLTlJ5g0fBz23b-fFz7bu9kNfeHwUjzZA";

const instance = axios.create({
  baseURL: "https://api.zoom.us/v2",
  headers: {
    "content-type": "application/json",
    authorization: "Bearer " + TOKEN,
  },
});

router.get("/accounts", async (req, res) => {
  try {
    const page_size = await req.body.page_size;
    const next_page_token = await req.body.next_page_token;
    instance
      .get("/accounts", {
        params: { page_size: page_size, next_page_token: next_page_token },
      })
      .then((response) => {
        //console.log("response: ", response.data);
        res.json(response.data);
      })
      .catch((err) => {
        console.error(err);
      });
  } catch (err) {
    console.error(err);
  }
});

router.post("/dbAccount", async (req, res) => {
  try {
    const account = await req.body;
    const insertAccount = [
      [
        await account.id,
        await account.account_name,
        await account.account_number,
        (await account.account_type) ? account.account_type : "",
        (await account.created_at) ? account.created_at : null,
        (await account.owner_email) ? account.owner_email : "",
        (await account.seats) ? account.seats : null,
        (await account.subscription_end_time)
          ? account.subscription_end_time
          : null,
        (await account.subscription_start_time)
          ? account.subscription_start_time
          : null,
      ],
    ];

    await sql.query(
      "INSERT INTO accounts (`id`, `account_name`, `account_number`, `account_type`, `created_at`, `owner_email`, `seats`, `subscription_end_time`, `subscription_start_time`) VALUES ?  ",
      [insertAccount],
      (err, doc) => {
        if (err) {
          if (err.code === "ER_DUP_ENTRY" || err.errno == 1062) {
            res.json({
              message: "ERR_DUP_ENTRY",
              code: "1062",
              accountId: account.id,
            });
            console.log("ER_DUP_ENTRY");
          } else {
            res.json({ message: "ERR", code: "ERROR" });
            console.log(err);
          }
        } else {
          if (doc) {
            res.json({ message: "successful", account: account });
            //console.log("success create account");
          } else {
            res.json({ message: "unsuccess", account: account });
            //console.log("unsuccess create account");
          }
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
});

router.put("/accounts2", (req, res) => {
  const account = req.body;

  sql.query("UPDATE accounts SET ? WHERE id = ?", (account, id), (err, doc) => {
    if (err) {
      res.json({ message: "ERR", code: "ERROR" });
    } else {
      if (doc) {
        res.json({ message: "successful", account: account });
      } else {
        res.json({ message: "unsuccess", account: account });
      }
    }
  });
});

module.exports = router;
