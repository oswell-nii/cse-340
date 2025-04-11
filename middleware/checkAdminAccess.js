const jwt = require('jsonwebtoken');

function adminEmployeeAccess(req, res, next) {
    try {
        // Retrieve the token from cookies or authorization header
        const token = req.cookies.token || req.headers.authorization.split(" ")[1];
        if (!token) {
            return res.redirect('/account/login?error=Access denied. Please log in.');
        }

        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const accountType = decoded.accountType; // Assuming accountType is included in the payload

        // Check if accountType is "Employee" or "Admin"
        if (accountType === 'Employee' || accountType === 'Admin') {
            req.user = decoded; // Attach decoded token payload to request object for later use
            return next(); // Proceed to the requested route
        } else {
            return res.redirect('/account/login?error=Access restricted to authorized users.');
        }
    } catch (error) {
        return res.redirect('/account/login?error=Invalid or expired token. Please log in again.');
    }
}

module.exports = adminEmployeeAccess;