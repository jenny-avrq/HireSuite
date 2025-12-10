module.exports.requireAdmin = (req, res, next) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: "Unauthorized: User not logged in." });
    }

    if (req.session.role !== "Admin") {
        return res.status(403).json(({ error: "Restricted: Admins only" }));
    }

    next();
}