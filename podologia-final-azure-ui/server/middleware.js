module.exports = {
  ensureAuth: function(req, res, next) {
    if (req.session && req.session.user) return next();
    return res.status(401).json({ message: 'Not authenticated' });
  },
  requireRole: function(role) {
    return function(req, res, next) {
      if (!req.session || !req.session.user) return res.status(401).json({ message: 'Not authenticated' });
      if (req.session.user.role !== role) return res.status(403).json({ message: 'Forbidden' });
      return next();
    }
  },
  allowRoles: function(roles) {
    return function(req, res, next) {
      if (!req.session || !req.session.user) return res.status(401).json({ message: 'Not authenticated' });
      if (!roles.includes(req.session.user.role)) return res.status(403).json({ message: 'Forbidden' });
      return next();
    }
  }
}
