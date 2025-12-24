const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  let token = null;

  //ai 
  //Header se token (Bearer <token>)
  if (req.header("Authorization")) {
    const authHeader = req.header("Authorization");
    if (authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }
  }

  // Query se token (?token=...)
  if (!token && req.query.token) {
    token = req.query.token;
  }

  // Token missing
  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token is not valid" });
  }
};


const admin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admins only.' });
    }
    next();
};

const authorization = (allowedRoles) => {
    return (req, res, next) =>{
        if(!allowedRoles.includes(req.user.role)){
            return res.status(409).json({message : "your are not allowed"})
        }
        next();
    }
}

module.exports = { auth, admin };
