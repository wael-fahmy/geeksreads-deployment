const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function (req, res, next) {
  const token = req.header('x-auth-token');  //receives Token From User
  if (!token) return res.status(401).send({"ReturnMsg":'Access denied. No token provided.'});//Makes Sure A token is Sent

  try {
    const decoded = jwt.verify(token, config.get('jwtPrivateKey')); //Decodes token to the Current User that sent it
    req.user = decoded; // Forwards the User to other APIs
    next();
  }
  catch (ex) {
    res.status(400).send({"ReturnMsg":'Invalid token.'});// Handles Exception Of Invalid Token
  }
}
