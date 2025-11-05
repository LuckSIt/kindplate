const express = require("express");
const customerLocationsRouter = express.Router();
const pool = require("../lib/db");

// GET /customer/vendors/:id/locations - Получить все локации бизнеса
customerLocationsRouter.get("/vendors/:id/locations", async (req, res) => {
    try {
        const vendorId = req.params.id;

        const result = await pool.query(
            `SELECT 
                bl.id,
                bl.business_id,
                bl.name,
                bl.address,
                bl.lat,
                bl.lon,
                bl.opening_hours,
                bl.phone,
                bl.is_active,
                COUNT(DISTINCT o.id) as offers_count
             FROM business_locations bl
             LEFT JOIN offers o ON o.location_id = bl.id AND o.is_active = true AND o.quantity_available > 0
             WHERE bl.business_id = $1 AND bl.is_active = true
             GROUP BY bl.id
             ORDER BY bl.created_at DESC`,
            [vendorId]
        );

        res.send({
            success: true,
            data: {
                locations: result.rows.map(row => ({
                    id: row.id,
                    business_id: row.business_id,
                    name: row.name,
                    address: row.address,
                    coords: [parseFloat(row.lat), parseFloat(row.lon)],
                    opening_hours: row.opening_hours,
                    phone: row.phone,
                    offers_count: parseInt(row.offers_count) || 0
                }))
            }
        });
    } catch (e) {
        console.error("❌ Ошибка в /customer/vendors/:id/locations:", e);
        res.status(500).send({
            success: false,
            error: "UNKNOWN_ERROR",
            message: "Внутренняя ошибка сервера"
        });
    }
});

module.exports = customerLocationsRouter;

