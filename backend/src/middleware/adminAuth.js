exports.adminAuth = (req, res, next) => {
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    return res.status(500).json({ success: false, message: 'ADMIN_PASSWORD not configured on server.' });
  }

  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

  if (!token || token !== adminPassword) {
    return res.status(401).json({ success: false, message: 'Unauthorized. Invalid or missing admin token.' });
  }

  next();
};
