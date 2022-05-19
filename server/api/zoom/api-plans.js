const express = require("express");
const router = express.Router();
const sql = require("./db.js");
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");

const TOKEN =
  "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOm51bGwsImlzcyI6ImFZMDhQT21mUnNPUG5rd29JWE9Gd3ciLCJleHAiOjE2NzI0ODI2MDAsImlhdCI6MTY1MjI1ODkyM30.R9Kk-25pxtWLTlJ5g0fBz23b-fFz7bu9kNfeHwUjzZA";

const instance = axios.create({
  baseURL: "https://api.zoom.us/v2",
  headers: {
    "content-type": "application/json",
    authorization: "Bearer " + TOKEN,
  },
});

const mapAccountPlan = async (accountId, plan) => {
  try {
    const mapPlan = await Object.assign({ account_id: accountId }, plan);
    //console.log("mapPlan :", mapPlan);
    return await mapPlan;
  } catch (err) {
    console.error(err);
  }
};

const createPlanBase = async (id, accountId, planBase) => {
  try {
    const insertPlans = [
      [
        id,
        accountId,
        await planBase.type,
        await planBase.hosts,
        (await planBase.trial_start_date) ? planBase.trial_start_date : null,
        (await planBase.trial_end_date) ? planBase.trial_end_date : null,
        (await planBase.service_effective_date)
          ? planBase.service_effective_date
          : null,
        (await planBase.next_invoice_date) ? planBase.next_invoice_date : null,
        (await planBase.status) ? planBase.status : null,
      ],
    ];
    //console.log("Data insertPlans " + insertPlans);
    await sql.query(
      "INSERT INTO plans_base (id , account_id, type, hosts,trial_start_date, trial_end_date, service_effective_date , next_invoice_date , status) VALUES ? ",
      [insertPlans],
      (err, doc) => {
        if (err) {
          if (err.code === "ER_DUP_ENTRY" || err.errno == 1062) {
            return {
              message: "ERR_DUP_ENTRY",
              code: "1062",
              accountId: accountId,
            };
          } else {
            return { message: err, code: "ERROR" };
          }
        } else {
          if (doc) {
            console.log("success create plan base");
            return { message: "successful", planBase };
          } else {
            return { message: "unsuccess", planBase };
          }
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
};

const createPlanAudio = async (id, accountId, planAudio) => {};

const createPlanZoomRoom = async (id, accountId, planZoomRoom) => {
  try {
    const insertPlanZoomRoom = [
      [
        id,
        accountId,
        (await planZoomRoom.hosts) ? planZoomRoom.hosts : null,
        (await planZoomRoom.next_invoice_date)
          ? planZoomRoom.next_invoice_date
          : null,
        (await planZoomRoom.service_effective_date)
          ? planZoomRoom.service_effective_date
          : null,
        (await planZoomRoom.status) ? planZoomRoom.status : null,
        (await planZoomRoom.type) ? planZoomRoom.type : null,
      ],
    ];
    await sql.query(
      "INSERT INTO plans_zoom_rooms (`id`, `account_id`, `hosts`, `next_invoice_date`, `service_effective_date`, `status`, `type`) VALUES ? ",
      [insertPlanZoomRoom],
      (err, doc) => {
        if (err) {
          if (err.code === "ER_DUP_ENTRY" || err.errno == 1062) {
            return {
              message: "ERR_DUP_ENTRY",
              code: "1062",
              accountId: accountId,
            };
          } else {
            return { message: err, code: "ERROR" };
          }
        } else {
          if (doc) {
            console.log("success create plan base");
            return { message: "successful", planZoomRoom };
          } else {
            return { message: "unsuccess", planZoomRoom };
          }
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
};

const createPlanWebinar = async (accountId, planWebinar) => {
  try {
    await planWebinar.forEach(async (element) => {
      const insertPlanWebinar = [
        [
          uuidv4(),
          accountId,
          (await element.hosts) ? element.hosts : null,
          (await element.next_invoice_date) ? element.next_invoice_date : null,
          (await element.service_effective_date)
            ? element.service_effective_date
            : null,
          (await element.status) ? element.status : null,
          (await element.type) ? element.type : null,
        ],
      ];
      await sql.query(
        "INSERT INTO plans_webinar (`id`, `account_id`, `hosts`, `next_invoice_date`, `service_effective_date`, `status`, `type`) VALUES ? ",
        [insertPlanWebinar],
        (err, doc) => {
          if (err) {
            if (err.code === "ER_DUP_ENTRY" || err.errno == 1062) {
              return {
                message: "ERR_DUP_ENTRY",
                code: "1062",
                accountId: accountId,
              };
            } else {
              return { message: err, code: "ERROR" };
            }
          } else {
            if (doc) {
              console.log("success create plan webinar");
              return { message: "successful", element };
            } else {
              return { message: "unsuccess", element };
            }
          }
        }
      );
    });
  } catch (error) {
    console.log(error);
  }
};

const createPlanLargeMeeting = async (accountId, planLargeMeeting) => {
  try {
    await planLargeMeeting.forEach(async (element) => {
      const insertPlansLargeMeeting = [
        [
          uuidv4(),
          accountId,
          (await element.hosts) ? element.hosts : null,
          (await element.next_invoice_date) ? element.next_invoice_date : null,
          (await element.service_effective_date)
            ? element.service_effective_date
            : null,
          (await element.status) ? element.status : null,
          (await element.type) ? element.type : null,
        ],
      ];
      await sql.query(
        "INSERT INTO plans_large_meeting (`id`, `account_id`, `hosts`, `next_invoice_date`, `service_effective_date`, `status`, `type`) VALUES ? ",
        [insertPlansLargeMeeting],
        (err, doc) => {
          if (err) {
            if (err.code === "ER_DUP_ENTRY" || err.errno == 1062) {
              return {
                message: "ERR_DUP_ENTRY",
                code: "1062",
                accountId: accountId,
              };
            } else {
              return { message: err, code: "ERROR" };
            }
          } else {
            if (doc) {
              console.log("success create plan large meeting");
              return { message: "successful", element };
            } else {
              return { message: "unsuccess", element };
            }
          }
        }
      );
    });
  } catch (error) {
    console.log(error);
  }
};

const createPlanBaseUsage = async (id, accountId, planBaseUsage) => {
  const insertPlansUsage = [
    [
      id,
      accountId,
      (await planBaseUsage.type) ? planBaseUsage.type : null,
      (await planBaseUsage.hosts) ? planBaseUsage.hosts : 0,
      (await planBaseUsage.usage) ? planBaseUsage.usage : 0,
      (await planBaseUsage.pending) ? planBaseUsage.pending : 0,
    ],
  ];
  //console.log("Data insertPlans " + insertPlans);
  await sql.query(
    "INSERT INTO plans_base_usage (`id`, `account_id`, `type`, `hosts`, `usage`, `pending`) VALUES ?",
    [insertPlansUsage],
    (err, doc) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY" || err.errno == 1062) {
          res.json({
            message: "ERR_DUP_ENTRY",
            code: "1062",
            accountId: accountId,
          });
        } else {
          return { message: err, code: "ERROR" };
        }
      } else {
        if (doc) {
          console.log("success create plan base usage");
          return { message: "successful", planBaseUsage };
        } else {
          return { message: "unsuccess", planBaseUsage };
        }
      }
    }
  );
};

const createPlanRecordingUsage = async (id, accountId, planRecording) => {
  const insertPlansRecordingUsage = [
    [
      id,
      accountId,
      (await planRecording.free_storage) ? planRecording.free_storage : null,
      (await planRecording.free_storage_usage)
        ? planRecording.free_storage_usage
        : null,
      (await planRecording.plan_storage) ? planRecording.plan_storage : null,
      (await planRecording.plan_storage_usage)
        ? planRecording.plan_storage_usage
        : null,
      (await planRecording.plan_storage_exceed)
        ? planRecording.plan_storage_exceed
        : null,
    ],
  ];
  //console.log("Data insertPlans " + insertPlans);
  await sql.query(
    "INSERT INTO plans_recording_usage (`id`, `account_id`, `free_storage`, `free_storage_usage`, `plan_storage`, `plan_storage_usage`,  `plan_storage_exceed`) VALUES ?",
    [insertPlansRecordingUsage],
    (err, doc) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY" || err.errno == 1062) {
          res.json({
            message: "ERR_DUP_ENTRY",
            code: "1062",
            accountId: accountId,
          });
        } else {
          return { message: err, code: "ERROR" };
        }
      } else {
        if (doc) {
          console.log("success create plan reconding usage");
          return { message: "successful", planRecording };
        } else {
          return { message: "unsuccess", planRecording };
        }
      }
    }
  );
};

router.get("/plan/account/:accountId", async (req, res) => {
  try {
    const accountId = req.params.accountId;
    console.log("account ID:", accountId);
    const getPlan = await instance.get(`/accounts/${accountId}/plans`);
    const mapPlan = await mapAccountPlan(accountId, getPlan.data);
    //console.log("plan :", mapPlan);
    res.json(mapPlan);
  } catch (error) {
    console.log(error);
    //res.json({ code: 2001, message: `Account does not exist: ${accountId}` });
  }
});

router.post("/dbPlan", async (req, res) => {
  try {
    const accountId = await req.body.account_id;
    const planBase = await req.body.plan_base;
    const planZoomRoom = await req.body.plan_zoom_rooms;
    const planWebinar = await req.body.plan_webinar;
    const planLargeMeeting = await req.body.plan_large_meeting;
    //const id = uuidv4();

    if (planBase) {
      res.json(createPlanBase(uuidv4(), accountId, planBase));
    }

    if (planZoomRoom) {
      res.json(createPlanZoomRoom(uuidv4(), accountId, planZoomRoom));
    }

    if (planWebinar) {
      res.json(createPlanWebinar(accountId, planWebinar));
    }

    if (planLargeMeeting) {
      res.json(createPlanLargeMeeting(accountId, planLargeMeeting));
    }
  } catch (err) {
    console.log(err);
  }
});

router.put("/plan", (req, res) => {});

router.get("/plansUsage/account/:accountId", async (req, res) => {
  try {
    const accountId = req.params.accountId;
    const getPlanUsage = await instance.get(
      `/accounts/${accountId}/plans/usage`
    );
    const mapPlanUsage = await mapAccountPlan(accountId, getPlanUsage.data);
    //console.log("mapPlanUsage :", mapPlanUsage);
    res.json(mapPlanUsage);
  } catch (error) {
    console.log(error);
  }
});

router.post("/dbPlanUsage", async (req, res) => {
  try {
    const accountId = await req.body.account_id;
    const planBaseUsage = await req.body.plan_base;
    const planRecordingUsage = await req.body.plan_recording;
    //const id = uuidv4();

    if (planBaseUsage) {
      res.json(createPlanBaseUsage(uuidv4(), accountId, planBaseUsage));
    }

    if (planRecordingUsage) {
      res.json(createPlanRecordingUsage(uuidv4(), accountId, planRecordingUsage));
    }
  } catch (err) {
    console.log(err);
  }
});

router.put("/plansUsage", (req, res) => {});

module.exports = router;
