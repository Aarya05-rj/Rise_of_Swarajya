/**
 * Auth Middleware
 * Validates user_id is present in request body or params
 */
const authMiddleware = (req, res, next) => {
  const user_id = req.body?.user_id || req.params?.id;
  if (!user_id) {
    return res.status(401).json({ success: false, error: "Unauthorized: user_id is required" });
  }
  next();
};

module.exports = authMiddleware;
