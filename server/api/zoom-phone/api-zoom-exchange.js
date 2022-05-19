const express = require("express");
const router = express.Router();
const sql = require("./db.js");
const jwt = require("./../../jwt");
const axios = require("axios");
var request = require("request");
const qs = require("qs");

router.get("/zoomExchange/userId/:userId", (req, res) => {
  const userId = req.params.userId;
  // SELECT
  // ZPE.uuid As uuid,ZPE.phoneNumberId As phoneNumberId, PNB.phoneNumber As phoneNumber, ZPE.customerId As customerId,CUS.customerName As customerName, CUS.userId As userId
  // FROM `zoomPhoneExchange` AS ZPE
  // INNER JOIN `customers` AS CUS ON  CUS.uuid = ZPE.customerID
  // INNER JOIN `phoneNumber` As PNB On PNB.uuid = ZPE.phoneNumberId
  // WHERE CUS.userId = "2e11f9bb-54d2-4e2b-88ec-46ce71888179"
  const operationSQL = "SELECT ";
  const dataSource =
    "ZPE.uuid As uuid,ZPE.phoneNumberId As phoneNumberId, PNB.phoneNumber As phoneNumber, ZPE.customerId As customerId,CUS.customerName As customerName, CUS.userId As userId ";
  const from = "FROM `zoomPhoneExchange` AS ZPE ";
  const joinTable1 =
    "INNER JOIN `customers` AS CUS ON  CUS.uuid = ZPE.customerID ";
  const joinTable2 =
    "INNER JOIN `phoneNumber` As PNB On PNB.uuid = ZPE.phoneNumberId ";
  const dataCondition = "WHERE  CUS.userId  = ?";
  const querySQL =
    operationSQL + dataSource + from + joinTable1 + joinTable2 + dataCondition;
  sql.query(querySQL, [userId], (error, result) => {
    if (error) {
      res.status(500).end(error);
      return;
    } else {
      if (result) {
        res.json({ data: result });
        return;
      } else {
        res.json({});
        return;
      }
    }
  });
});

router.post("/zoomExchange/peering/number", (req, res) => {
  const accessToken = req.body.accessToken;
  const phoneNumber = req.body.phoneNumber;

  axios({
    method: "POST",
    url: "https://api.zoom.us/v2/phone/peering/numbers",
    headers: {
      "Content-type": "application/json",
      authorization: "Bearer " + accessToken,
    },
    data: {
      phone_numbers: [
        {
          status: 1,
          phone_number: phoneNumber,
          sip_trunk_name: "PEX_1TAL_01_RL",
          service_info: "Port Completed",
          billing_reference_id: "1toall1234",
        },
      ],
      carrier_code: 5015,
    },
  })
    .then((response) => {
      console.log(response.data);
      res.status(200).json(response.data);
      return;
    })
    .catch((err) => {
      console.log(err);
      res.status(401).json(err);
      return;
    });
});

router.delete("/zoomExchange/peering/number", async (req, res) => {
  const accessToken = req.body.accessToken;
  const phoneNumber = req.body.phoneNumber;

  const headers = {
    "content-type": "application/json",
    authorization: "Bearer " + accessToken,
  };
  const data = {
    carrier_code: 5015,
    phone_numbers: [phoneNumber],
  };

  axios
    .delete("https://api.zoom.us/v2/phone/peering/numbers", {
      headers: {
        "Content-Type": "application/json",
        authorization: "Bearer " + accessToken,
      },
      data: {
        carrier_code: 5015,
        phone_numbers: [phoneNumber],
      },
      timeout: 5000,
    })
    .then((response) => {
      console.log(response.data);
      res.status(200).json(response.data);
      return;
    })
    .catch((err) => {
      console.log(err);
      res.status(401).json(err);
      return;
    });

  // axios({
  //   method: "DELETE",
  //   url: "https://api.zoom.us/v2/phone/peering/numbers",
  //   headers: {
  //     "Content-type": "application/json",
  //     authorization: "Bearer " + accessToken,
  //   },
  //   data: {
  //     carrier_code: 5015,
  //     phone_numbers: [phoneNumber],
  //   },
  // });
});

module.exports = router;
