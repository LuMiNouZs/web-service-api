const express = require("express");
const router = express.Router();
const sql = require("./db.js");
const jwt = require("./../../jwt");
const { v4: uuidv4 } = require("uuid");
var async = require("async");
const axios = require("axios");
var request = require("request");

router.get("/zoomPhone", jwt.verify, (req, res) => {
  const operationSQL = "SELECT * FROM phoneNumber WHERE status = 1";
  sql.query(operationSQL, (error, result) => {
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

router.put("/zoomPhone/addPeeringDB", jwt.verify, (req, res) => {
  const userIdProfile = req.body.userId;
  const phoneNumberId = req.body.phoneNumberId;
  const uuidinsert = uuidv4();
  let findUserId = "";
  let findCustomerId = "";
  let findPhoneumberId = "";
  console.log(userIdProfile);
  console.log(phoneNumberId);

  let operationSQL =
    "SELECT  USR.uuid As userId, CUS.uuid As customerId FROM `users` AS USR INNER JOIN `customers` AS CUS ON CUS.userId = USR.uuid WHERE USR.uuid = ? ";
  sql.query(operationSQL, [userIdProfile], (error, doc) => {
    if (error) {
      res.status(500).end("error");
      console.log(error);
      return;
    } else if (!doc[0]) {
      res.status(200).json({ status: false, msg: "User Id is Empty." });
      console.log("Can't Select");
    } else {
      console.log("Select : " + operationSQL);
      findUserId = doc[0].userId;
      findCustomerId = doc[0].customerId;
      console.log("Get user ID :" + findUserId);
      console.log("Get customer ID :" + findCustomerId);
      operationSQL =
        "SELECT uuid As phoneNumberId, phoneNumber, status FROM `phoneNumber` WHERE uuid = ? and status = 1";
      sql.query(operationSQL, [phoneNumberId], (error, docPhone) => {
        //console.log(queryData)
        if (error) {
          res.status(400).end(error);
          console.log("Can't Select Phonenumber");
          return;
        } else if (!docPhone) {
          res
            .status(200)
            .json({ status: false, msg: "phoneNumber Id is Empty." });
          console.log("Can't Select");
          return;
        } else {
          try {
            findPhoneumberId = docPhone[0].phoneNumberId;
            console.log("find Phonenumber : " + findPhoneumberId);
            console.log("Select : " + operationSQL);
            console.log("result : " + docPhone[0]);
            console.log("Try to insert");
            operationSQL =
              "INSERT INTO `zoomPhoneExchange` (uuid, phoneNumberId, customerId, status) VALUES ?";
            const dataInsert = [
              [uuidinsert, findPhoneumberId, findCustomerId, "1"],
            ];
            sql.query(operationSQL, [dataInsert], (error, docExchange) => {
              if (error) {
                res.status(500).end(error);
                return;
              } else {
                console.log("INSERT : " + operationSQL);
                res.json({
                  status: "Success",
                  data: [
                    {
                      customerId: findCustomerId,
                      phoneNumber: findPhoneumberId,
                    },
                  ],
                });
                //Update status phone in used
                operationSQL =
                  "UPDATE `phoneNumber` SET status = 0 WHERE uuid = ? ";
                sql.query(
                  operationSQL,
                  [findPhoneumberId],
                  (err, docUpdate) => {
                    if (err) {
                      res.status(500).end(err);
                      console.log(error);
                      console.log("Can't update status phonnumber.");
                      return;
                    } else {
                      console.log("update status phonnumber successful.");
                    }
                  }
                );
              }
            });
          } catch (error) {
            res.status(200).json({
              status: "unSuccess",
              msg: "PhoneNumberId is Exit or Some Error",
            });
            console.log("PhoneNumberId is Exit or Some Error");
            return;
          }
        }
      });
    }
  });
});

router.delete("/zoomPhone/removePeeringDB", jwt.verify,  (req, res) => {
  const userIdProfile = req.body.userId;
  const phoneNumberId = req.body.phoneNumberId;
  let findUserId = "";
  let findCustomerId = "";
  let findPhoneumberId = "";
  console.log(userIdProfile);
  console.log(phoneNumberId);

  let operationSQL = 
    "SELECT  USR.uuid As userId, CUS.uuid As customerId FROM `users` AS USR INNER JOIN `customers` AS CUS ON CUS.userId = USR.uuid WHERE USR.uuid = ? ";
  sql.query(operationSQL, [userIdProfile], (error, doc) => {
    if (error) {
      res.status(500).end("error");
      console.log(error);
      return;
    } else if (!doc[0]) {
      res.status(200).json({ status: false, msg: "User Id is Empty." });
      console.log("Can't Select");
    } else {
      console.log("Select : " + operationSQL);
      findUserId = doc[0].userId;
      findCustomerId = doc[0].customerId;
      console.log("Get user ID :" + findUserId);
      console.log("Get customer ID :" + findCustomerId);
      operationSQL =
        "SELECT uuid As phoneNumberId, phoneNumber, status FROM `phoneNumber` WHERE uuid = ? and status = 0";
      sql.query(operationSQL, [phoneNumberId], (error, docPhone) => {
        //console.log(queryData)
        if (error) {
          res.status(400).end(error);
          console.log("Can't Select Phonenumber for Remove");
          return;
        }  else {
          try {
            findPhoneumberId = docPhone[0].phoneNumberId;
            console.log("find Phonenumber : " + findPhoneumberId);
            console.log("Select : " + operationSQL);
            console.log("result : " + docPhone[0]);
            console.log("Try to Delete");
            operationSQL =
              "DELETE FROM `zoomPhoneExchange` WHERE phoneNumberId = ? and 	customerId = ?";
            sql.query(
              operationSQL,
              [findPhoneumberId, findCustomerId],
              (error, docExchange) => {
                if (error) {
                  res.status(500).end(error);
                  return;
                } else {
                  console.log("DELETE : " + operationSQL);
                  res.json({
                    status: "Success",
                    data: [
                      {
                        customerId: findCustomerId,
                        phoneNumber: findPhoneumberId,
                      },
                    ],
                  });
                  //Update status phone in used
                  operationSQL =
                    "UPDATE `phoneNumber` SET status = 1 WHERE uuid = ? ";
                  sql.query(
                    operationSQL,
                    [findPhoneumberId],
                    (err, docUpdate) => {
                      if (err) {
                        res.status(500).end(err);
                        console.log(error);
                        console.log("Can't update status phonnumber.");
                        return;
                      } else {
                        console.log("update status phonnumber successful.");
                      }
                    }
                  );
                }
              }
            );
          } catch (error) {
            res.status(200).json({
              status: "unSuccess",
              msg: "PhoneNumberId is Exit or Some Error",
            });
            console.log("PhoneNumberId is Exit or Some Error");
            return;
          }
        }
      });
    }
  });
});

router.get("/example", (req, res) => {
  //res.json( [{'id':1,'phone':'033049860'},{'id':2,'phone':'033049861'},{'id':3,'phone':'033049862'},{'id':4,'phone':'033049863'}] );
  res.end("<h1>Hello!</h1>");
});

module.exports = router;
