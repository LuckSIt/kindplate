const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
    user: process.env.DB_USER || "postgres",
    host: process.env.DB_HOST || "localhost",
    database: process.env.DB_NAME || "kindplate",
    password: process.env.DB_PASSWORD || "password",
    port: process.env.DB_PORT || 5432,
});

async function checkData() {
    try {
        console.log("🔍 Проверяем данные в базе...\n");

        // Проверяем бизнес‑пользователей с координатами
        const businesses = await pool.query(
            `SELECT id, name, address, coord_0, coord_1 
             FROM users 
             WHERE is_business = true
             ORDER BY id`
        );

        console.log(`🏢 Бизнес‑пользователи (${businesses.rows.length}):`);
        businesses.rows.forEach((b) => {
            console.log(
                `  - #${b.id} ${b.name} | ${b.address} | coords=(${b.coord_0}, ${b.coord_1})`
            );
        });

        // Проверяем наличие таблицы offers
        const offersTable = await pool.query(
            `SELECT table_name 
             FROM information_schema.tables 
             WHERE table_schema = 'public' AND table_name = 'offers'`
        );

        if (offersTable.rows.length === 0) {
            console.log("\n⚠️  Таблица offers не найдена — карта не сможет показать предложения.");
            return;
        }

        // Считаем все офферы и активные офферы, которые попадают под условия /offers/search
        const allOffers = await pool.query("SELECT COUNT(*) AS c FROM offers");
        const activeOffers = await pool.query(
            `SELECT COUNT(*) AS c 
             FROM offers o
             JOIN users u ON o.business_id = u.id
             WHERE u.is_business = true
               AND (u.coord_0 IS NOT NULL AND u.coord_1 IS NOT NULL)
               AND (o.is_active IS NULL OR o.is_active = true)
               AND (o.quantity_available IS NULL OR o.quantity_available > 0)`
        );

        console.log(`\n📦 Всего записей в offers: ${allOffers.rows[0].c}`);
        console.log(
            `✅ Офферы, удовлетворяющие фильтрам карты (is_active + quantity_available + coords): ${activeOffers.rows[0].c}`
        );

        // Показываем несколько активных офферов с координатами бизнеса
        const sample = await pool.query(
            `SELECT 
                o.id,
                o.title,
                o.discounted_price,
                o.quantity_available,
                o.is_active,
                u.id AS business_id,
                u.name AS business_name,
                u.coord_0,
                u.coord_1
             FROM offers o
             JOIN users u ON o.business_id = u.id
             WHERE u.is_business = true
               AND (u.coord_0 IS NOT NULL AND u.coord_1 IS NOT NULL)
               AND (o.is_active IS NULL OR o.is_active = true)
               AND (o.quantity_available IS NULL OR o.quantity_available > 0)
             ORDER BY o.id
             LIMIT 10`
        );

        if (sample.rows.length === 0) {
            console.log(
                "\n⚠️  Нет ни одного активного оффера с координатами — поэтому на карте пусто."
            );
        } else {
            console.log("\n🔎 Примеры офферов, которые должен видеть фронтенд:");
            sample.rows.forEach((row) => {
                console.log(
                    `  - offer #${row.id} "${row.title}" ${row.discounted_price}₽, qty=${row.quantity_available}, active=${row.is_active} | business #${row.business_id} "${row.business_name}" coords=(${row.coord_0}, ${row.coord_1})`
                );
            });
        }
    } catch (error) {
        console.error("❌ Ошибка при проверке данных:", error);
    } finally {
        await pool.end();
    }
}

checkData();

