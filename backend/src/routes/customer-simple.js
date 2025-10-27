const express = require("express");
const customerRouter = express.Router();

// Простые mock данные для тестирования
const mockSellers = [
    {
        id: 1,
        name: "Кафе Вкусняшка",
        address: "Невский проспект, 100",
        coords: [59.9311, 30.3609],
        items: [
            {
                id: 1,
                name: "Пицца Маргарита",
                description: "Классическая пицца с томатами и моцареллой. Свежая и вкусная!",
                amount: 5,
                price_orig: 500,
                price_disc: 200
            },
            {
                id: 2,
                name: "Салат Цезарь",
                description: "Свежий салат с курицей, сыром пармезан и соусом Цезарь",
                amount: 3,
                price_orig: 350,
                price_disc: 150
            },
            {
                id: 3,
                name: "Бургер с картофелем",
                description: "Сочный бургер с говядиной и картофелем фри",
                amount: 4,
                price_orig: 450,
                price_disc: 180
            }
        ]
    }
];

customerRouter.get("/sellers", async (req, res) => {
    try {
        console.log("🔍 Запрос /customer/sellers (mock)");
        console.log("📦 Товары:", mockSellers[0].items.length);
        console.log("👥 Бизнес-пользователи:", mockSellers.length);

        res.send({
            success: true,
            sellers: mockSellers,
        });
    } catch (e) {
        console.error("❌ Ошибка в /customer/sellers:", e);
        res.send({
            success: false,
            error: "UNKNOWN_ERROR",
        });
    }
});

module.exports = customerRouter;
