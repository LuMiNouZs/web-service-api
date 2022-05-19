const express = require("express");
const router = express.Router();
const sql = require("./db.js");
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");
const qs = require("qs");
const { json } = require("body-parser");

const instanceAPI = axios.create({
  baseURL: "http://192.168.20.240:8081/zoom/api/v1",
  headers: {
    "content-type": "application/json",
  },
});

const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const getAccounts = async (page_size, next_page_token) => {
  try {
    await sleep(1500);
    const response = await instanceAPI.get("/accounts", {
      data: { page_size, next_page_token },
    });
    //console.log(response.data);
    return await response.data;
  } catch (err) {
    console.error(err);
  }
};

const getPlans = async (accountId) => {
  try {
    await sleep(1500);
    const response = await instanceAPI.get(`/plan/account/${accountId}`);
    //console.log(response.data);
    return await response.data;
  } catch (error) {
    console.error(error);
  }
};

const getPlansUsage = async (accountId) => {
  try {
    await sleep(1500);
    const response = await instanceAPI.get(`/plansUsage/account/${accountId}`);
    //console.log(response.data);
    return await response.data;
  } catch (error) {
    console.error(error);
  }
};

router.get("/syncAccounts", async (req, res) => {
  let total_records = 0;
  let page_size = 5;
  let next_page_token = "";
  do {
    await getAccounts(page_size, next_page_token)
      .then(async (allAccounts) => {
        total_records = await allAccounts.total_records;
        next_page_token = await allAccounts.next_page_token;
        page_size = await allAccounts.page_size;
        const resAcounts = await allAccounts.accounts;

        await resAcounts.forEach(async (account) => {
          //getPlans
          getPlans(account.id).then(async (plan) => {
            //Insert plan in local db
            await instanceAPI
              .post("/dbPlan", plan)
              .then(async (resCreatePlan) => {
                //response request insert db plans_base
                if (resCreatePlan.data.message === "successful") {
                  const plan = await resCreatePlan.data;
                  console.log("insert Plan");
                } else {
                  console.log("error :", resCreatePlan.data);
                }
              });
          });

          //get useage plan
          getPlansUsage(account.id).then(async (planUsage) => {
            await instanceAPI
              .post("/dbPlanUsage", planUsage)
              .then(async (resCreatePlanUsage) => {
                //response request insert db plans_base_usage
                if (resCreatePlanUsage.data.message === "successful") {
                  const plan = await resCreatePlanUsage.data;
                  console.log("insert Plan Usage");
                } else {
                  console.log("error :", resCreatePlanUsage.data);
                }
              });
          });

          //Insert account in local db
          await instanceAPI
            .post("/dbAccount", account)
            .then(async (resCreateAccount) => {
              //response request insert db accounts
              if ((await resCreateAccount.data.message) === "successful") {
                const accountId = await resCreateAccount.data.account.id;
                console.log("insert ID:", accountId);
                //res.json(accountId);
              } else if (
                (await resCreateAccount.data.message) === "ERR_DUP_ENTRY"
              ) {
                console.log(
                  "err record duplicate:",
                  resCreateAccount.data.account.id
                );
                //res.json({ ERR: "ERR_DUP_ENTRY" });
              } else {
                console.log("error :", resCreateAccount.data.account.id);
                //res.json({ ERR: "ERR Insert" });
              }
            });
        });
      })
      .catch((err) => {
        console.log(err);
      });
    await sleep(2000);
  } while (next_page_token);
  res.json({
    message: "sync data completed",
    total_records,
    page_size,
    next_page_token,
  });
});

module.exports = router;
