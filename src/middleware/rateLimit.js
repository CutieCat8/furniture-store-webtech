function createRateLimiter(options = {}) {
  const windowMs = Number(options.windowMs) || 60000;
  const max = Number(options.max) || 20;
  const buckets = new Map();

  return function rateLimiter(req, res, next) {
    const key = req.ip || "unknown";
    const now = Date.now();
    const bucket = buckets.get(key) || { count: 0, resetAt: now + windowMs };

    if (now > bucket.resetAt) {
      bucket.count = 0;
      bucket.resetAt = now + windowMs;
    }

    bucket.count += 1;
    buckets.set(key, bucket);

    res.setHeader("X-RateLimit-Limit", String(max));
    res.setHeader("X-RateLimit-Remaining", String(Math.max(0, max - bucket.count)));
    res.setHeader("X-RateLimit-Reset", String(bucket.resetAt));

    if (bucket.count > max) {
      return res.status(429).json({
        status: "fail",
        message: "Too many requests",
      });
    }

    return next();
  };
}

module.exports = {
  createRateLimiter,
};
