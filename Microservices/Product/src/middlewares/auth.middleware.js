const jwt = require("jsonwebtoken");

function createAuthMiddleware(roles = ["user"]) {
  return async function authMiddleware(req, res, next) {
    // Check for token in cookies OR Authorization header
    const token =
      req.cookies?.token || req.headers?.authorization?.split(" ")[1];

    console.log('🔍 Auth Check:', {
      hasCookie: !!req.cookies?.token,
      hasAuthHeader: !!req.headers?.authorization,
      token: token ? token.substring(0, 20) + '...' : 'NO TOKEN',
      requiredRoles: roles
    });

    if (!token) {
      console.log('❌ No token provided');
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      console.log('✅ Token decoded:', {
        userId: decoded.id,
        userRole: decoded.role,
        username: decoded.username,
        requiredRoles: roles
      });

      if (!roles.includes(decoded.role)) {
        console.log('❌ Role not authorized:', {
          userRole: decoded.role,
          requiredRoles: roles
        });
        return res
          .status(403)
          .json({ message: "Forbidden: Role not authorized" });
      }

      req.user = decoded;
      console.log('✅ Authentication successful');
      next();
    } catch (error) {
      console.log('❌ Token verification failed:', error.message);
      return res.status(401).json({ 
        message: "Unauthorized: Invalid token",
        error: error.message 
      });
    }
  };
}

module.exports = createAuthMiddleware;