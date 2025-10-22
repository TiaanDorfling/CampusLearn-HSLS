import { verifyToken } from '../utils/jwt.js';

export function auth(required = true) {
  return (req, res, next) => {
    const token = req.cookies?.jwt;
    if (!token) {
      if (!required) return next();
      return res.status(401).json({ error: 'No token' });
    }

    const payload = verifyToken(token);
    if (!payload) {
      res.clearCookie('jwt', {
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
      });
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.user = { id: payload.sub, _id: payload.sub, role: payload.role };
    next();
  };
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    if (!roles.includes(req.user.role))
      return res.status(403).json({ error: 'Forbidden' });
    next();
  };
}

export function verifyUserAccess(req, res, next) {
  const { user } = req;
  const targetUserId = req.params.id || req.body.id;

  if (!user)
    return res.status(401).json({ error: 'Unauthorized – login required' });

  if (user.role === 'admin' || user.id === targetUserId) {
    return next();
  }

  return res.status(403).json({ error: 'Forbidden – cannot modify other profiles' });
}
