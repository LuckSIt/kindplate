const express = require("express");
const businessRouter = express.Router();
const pool = require("../lib/db");

businessRouter.get("/items/all", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT id, name, description, amount, price_orig, price_disc FROM items WHERE owner_id=$1",
            [req.session.userId]
        );

        res.send({
            success: true,
            items: result.rows,
        });
    } catch (e) {
        res.send({
            success: false,
            error: "UNKNOWN_ERROR",
        });
    }
});

businessRouter.get("/items/mine", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT id, name, description, amount, price_orig, price_disc FROM items WHERE owner_id=$1 ORDER BY id",
            [req.session.userId]
        );

        res.send({
            success: true,
            items: result.rows,
        });
    } catch (e) {
        res.send({
            success: false,
            error: "unknown",
        });
    }
});

businessRouter.post("/items/create", async (req, res) => {
    try {
        const { name, description, amount, price_orig, price_disc } = req.body;

        const result = await pool.query(
            "INSERT INTO items(name, description, amount, owner_id, price_orig, price_disc) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, description, amount, price_orig, price_disc",
            [
                name,
                description,
                amount,
                req.session.userId,
                price_orig,
                price_disc,
            ]
        );

        res.send({
            success: true,
            item: result.rows[0],
        });
    } catch (e) {
        res.send({
            success: false,
            error: "UNKNOWN_ERROR",
        });
    }
});

businessRouter.post("/items/delete", async (req, res) => {
    try {
        const { id } = req.body;

        const result = await pool.query(
            "SELECT owner_id FROM items WHERE id=$1",
            [id]
        );

        if (result.rowCount == 0) {
            res.send({
                success: false,
                error: "ITEM_DOES_NOT_EXIST",
            });
            return;
        } else if (result.rows[0].owner_id != req.session.userId) {
            res.send({
                success: false,
                error: "NO_AUTHORITY",
            });
            return;
        }

        await pool.query("DELETE FROM items WHERE id=$1", [id]);

        res.send({
            success: true,
        });
    } catch (e) {
        console.log(e);
        res.send({
            success: false,
            error: "UNKNOWN_ERROR",
        });
    }
});

businessRouter.post("/items/edit", async (req, res) => {
    try {
        const { id, name, description, amount, price_orig, price_disc } =
            req.body;

        const result = await pool.query(
            "SELECT owner_id FROM items WHERE id=$1",
            [id]
        );

        if (result.rowCount == 0) {
            res.send({
                success: false,
                error: "ITEM_DOES_NOT_EXIST",
            });
            return;
        } else if (result.rows[0].owner_id != req.session.userId) {
            res.send({
                success: false,
                error: "NO_AUTHORITY",
            });
            return;
        }

        await pool.query(
            "UPDATE items SET name=$1, description=$2, amount=$3, price_orig=$4, price_disc=$5 WHERE id=$6",
            [name, description, amount, price_orig, price_disc, id]
        );

        res.send({
            success: true,
        });
    } catch (e) {
        console.log(e);
        res.send({
            success: false,
            error: "UNKNOWN_ERROR",
        });
    }
});

module.exports = businessRouter;
