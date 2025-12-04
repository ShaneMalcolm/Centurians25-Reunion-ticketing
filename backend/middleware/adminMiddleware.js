//backend\middleware\adminMiddleware.js
export default function adminMiddleware(req, res, next) {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ msg: "Admin access only" });
  }
  next();
}
