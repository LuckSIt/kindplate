const pool = require("./db");

function authOnly(req, res, next) {
    if (req.session.userId === undefined) {
        res.status(403).send({
            error: "NOT_AUTHENTICATED",
        });
        return;
    }
    next();
}

async function businessOnly(req, res, next) {
    if (req.session.userId === undefined) {
        res.status(403).send({
            error: "NOT_AUTHENTICATED",
        });
        return;
    }

    const result = await pool.query(
        "SELECT is_business FROM users WHERE id=$1",
        [req.session.userId]
    );

    if (result.rowCount == 0) {
        req.session.userId = undefined;
        res.status(403).send({
            error: "NOT_AUTHENTICATED",
        });
        return;
    } else if (!result.rows[0].is_business) {
        res.status(403).send({
            error: "NOT_AUTHORIZED",
        });
        return;
    }

    next();
}

module.exports = {
    authOnly,
    businessOnly,
};
