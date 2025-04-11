// middleware/checkJWTToken.js
const jwt = require('jsonwebtoken');

function checkJWTToken(req, res, next) {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.redirect('/account/login?error=Please log in first.');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded; // Attach token payload to request
    res.locals.accountData = decoded; // For use in EJS views
    res.locals.loggedin = true; // For showing/hiding UI elements

    next();
  } catch (error) {
    return res.redirect('/account/login?error=Invalid or expired token.');
  }
}

module.exports = checkJWTToken;
