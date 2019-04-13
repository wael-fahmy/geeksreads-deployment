
const Joi = require('joi');
const bcrypt = require('bcrypt');
const _ = require('lodash');
const {User} = require('../models/User');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();




//Login Authentication

/**
 *
 * @api {POST}  /user/SignIn/ Signing in by Email and Password
 * @apiName SignIn
 * @apiGroup User
 *
 * @apiParam  {String} UserEmail Email of User
 * @apiParam  {String} UserPassword Password of User
 * @apiSuccess {String}   ReturnMsg   Return Message Log in Successful.
 * @apiSuccess {String} UserId Id of User after Successfully Signing in
 * @apiSuccess {String} Token Authentication Access Token
 * @apiSuccessExample {json}  Success
 *     HTTP/1.1 200 OK
 * {
 *        "ReturnMsg": "Log in Successful.",
 *        "UserId": "5ca23e81783e981f88e1618c",
 *        "Token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1Y2EyM2U4MTc4M2U5ODFmODhlMTYxOGMiLCJpYXQiOjE1NTQxMzcxMjJ9.rUfROgeq1wgmsUxljg_ZLI2UbFMQubHQEYLKz2zd29Q"
 *   }
 * @apiErrorExample {json} InvalidEmailorPassword-Response:
 *     HTTP/1.1 400
 *  {
 *    "ReturnMsg":"Invalid email or password."
 *  }
 *
 * @apiErrorExample {json} UnConfirmedUser-Response:
 *     HTTP/1.1 401
 *  {
 *    "ReturnMsg" :'Your account has not been verified.'
 *  }
 *
 */

router.post('/', async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send({"ReturnMsg":error.details[0].message});

  let user = await User.findOne({ UserEmail: req.body.UserEmail });
  if (!user) return res.status(400).send({"ReturnMsg":"Invalid email or password."});
  if (!user.Confirmed) return res.status(401).send({ "ReturnMsg" :'Your account has not been verified.' });
  const validPassword = await bcrypt.compare(req.body.UserPassword, user.UserPassword);
  if (!validPassword) return res.status(400).send({"ReturnMsg":"Invalid email or password."});
  const token = user.generateAuthToken();
    res.send({
      "ReturnMsg": "Log in Successful.",
      "UserId": user.UserId,
      "Token":token});
});

function validate(req) {
  const schema = {
    UserEmail: Joi.string().min(5).max(255).required().email(),
    UserPassword: Joi.string().min(5).max(255).required()
  };

  return Joi.validate(req, schema);
}

module.exports = router;
