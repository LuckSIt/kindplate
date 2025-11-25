const express = require("express");
const partnersRouter = express.Router();
const pool = require("../lib/db");

// Middleware to check if user is authenticated
const requireAuth = (req, res, next) => {
    if (!req.session.user) {
        return res.status(401).json({
            success: false,
            error: "AUTHENTICATION_REQUIRED"
        });
    }
    next();
};

// Middleware to check if user is a partner
const requirePartner = async (req, res, next) => {
    if (!req.session.user || req.session.user.role !== 'partner') {
        return res.status(403).json({
            success: false,
            error: "PARTNER_ACCESS_REQUIRED"
        });
    }
    
    // Get partner_id from user_id
    const result = await pool.query(
        'SELECT id FROM partners WHERE user_id = $1',
        [req.session.user.id]
    );
    
    if (result.rowCount === 0) {
        return res.status(404).json({
            success: false,
            error: "PARTNER_PROFILE_NOT_FOUND"
        });
    }
    
    req.partnerId = result.rows[0].id;
    next();
};

// GET /api/partners/:id - Get partner details (public)
partnersRouter.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `SELECT 
                p.id, p.name, p.address, p.latitude, p.longitude, 
                p.description, p.categories, p.working_hours, p.logo_url,
                p.created_at
             FROM partners p
             WHERE p.id = $1 AND p.is_approved = TRUE`,
            [id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                error: "PARTNER_NOT_FOUND"
            });
        }

        res.json({
            success: true,
            partner: result.rows[0]
        });

    } catch (ex) {
        console.error("Get partner error:", ex);
        res.status(500).json({
            success: false,
            error: "UNKNOWN_ERROR"
        });
    }
});

// GET /api/partners - Get all partners (public, with filters)
partnersRouter.get("/", async (req, res) => {
    try {
        const { lat, lng, radius, category, q, sort, page = 1, limit = 20 } = req.query;
        
        let query = `
            SELECT 
                p.id, p.name, p.address, p.latitude, p.longitude, 
                p.categories, p.logo_url
            FROM partners p
            WHERE p.is_approved = TRUE
        `;
        
        const queryParams = [];
        let paramIndex = 1;

        // Filter by category
        if (category) {
            query += ` AND $${paramIndex} = ANY(p.categories)`;
            queryParams.push(category);
            paramIndex++;
        }

        // Search by name
        if (q) {
            query += ` AND p.name ILIKE $${paramIndex}`;
            queryParams.push(`%${q}%`);
            paramIndex++;
        }

        // Sort
        if (sort === 'distance' && lat && lng) {
            query += ` ORDER BY earth_distance(ll_to_earth(p.latitude, p.longitude), ll_to_earth($${paramIndex}, $${paramIndex+1})) ASC`;
            queryParams.push(parseFloat(lat), parseFloat(lng));
            paramIndex += 2;
        } else {
            query += ` ORDER BY p.created_at DESC`;
        }

        // Pagination
        const offset = (page - 1) * limit;
        query += ` LIMIT $${paramIndex} OFFSET $${paramIndex+1}`;
        queryParams.push(parseInt(limit), offset);

        const result = await pool.query(query, queryParams);

        // Get total count
        const countResult = await pool.query(
            'SELECT COUNT(*) FROM partners WHERE is_approved = TRUE'
        );

        res.json({
            success: true,
            items: result.rows,
            meta: {
                total: parseInt(countResult.rows[0].count),
                page: parseInt(page),
                limit: parseInt(limit)
            }
        });

    } catch (ex) {
        console.error("Get partners error:", ex);
        res.status(500).json({
            success: false,
            error: "UNKNOWN_ERROR"
        });
    }
});

// GET /api/partners/me - Get current partner's profile
partnersRouter.get("/me", requireAuth, requirePartner, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT 
                p.id, p.user_id, p.name, p.address, p.latitude, p.longitude, 
                p.description, p.categories, p.working_hours, p.logo_url,
                p.is_approved, p.created_at, p.updated_at
             FROM partners p
             WHERE p.id = $1`,
            [req.partnerId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                error: "PARTNER_NOT_FOUND"
            });
        }

        res.json({
            success: true,
            partner: result.rows[0]
        });

    } catch (ex) {
        console.error("Get my partner error:", ex);
        res.status(500).json({
            success: false,
            error: "UNKNOWN_ERROR"
        });
    }
});

// PATCH /api/partners/me - Update current partner's profile
partnersRouter.patch("/me", requireAuth, requirePartner, async (req, res) => {
    try {
        const { 
            name, address, latitude, longitude, description, 
            categories, working_hours, logo_url 
        } = req.body;

        const updates = [];
        const values = [];
        let paramIndex = 1;

        if (name) {
            updates.push(`name = $${paramIndex}`);
            values.push(name);
            paramIndex++;
        }
        if (address) {
            updates.push(`address = $${paramIndex}`);
            values.push(address);
            paramIndex++;
        }
        if (latitude !== undefined) {
            updates.push(`latitude = $${paramIndex}`);
            values.push(latitude);
            paramIndex++;
        }
        if (longitude !== undefined) {
            updates.push(`longitude = $${paramIndex}`);
            values.push(longitude);
            paramIndex++;
        }
        if (description !== undefined) {
            updates.push(`description = $${paramIndex}`);
            values.push(description);
            paramIndex++;
        }
        if (categories) {
            updates.push(`categories = $${paramIndex}`);
            values.push(categories);
            paramIndex++;
        }
        if (working_hours) {
            updates.push(`working_hours = $${paramIndex}`);
            values.push(JSON.stringify(working_hours));
            paramIndex++;
        }
        if (logo_url !== undefined) {
            updates.push(`logo_url = $${paramIndex}`);
            values.push(logo_url);
            paramIndex++;
        }

        if (updates.length === 0) {
            return res.status(400).json({
                success: false,
                error: "NO_UPDATES_PROVIDED"
            });
        }

        values.push(req.partnerId);
        const query = `
            UPDATE partners 
            SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
            WHERE id = $${paramIndex}
            RETURNING *
        `;

        const result = await pool.query(query, values);

        res.json({
            success: true,
            partner: result.rows[0]
        });

    } catch (ex) {
        console.error("Update partner error:", ex);
        res.status(500).json({
            success: false,
            error: "UNKNOWN_ERROR"
        });
    }
});

module.exports = partnersRouter;


