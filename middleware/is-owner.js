const isOwner = (req, res, next) => {
    if (req.user.id !== req.params.userId) {
        return res.status(401).json({ error: "Unauthorized"});
    };
    next();
};

module.exports = isOwner;