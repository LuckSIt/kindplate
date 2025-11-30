// Тестовый скрипт для поиска проблемного маршрута
require("dotenv").config();

const routes = [
    "./src/routes/auth",
    "./src/routes/business-locations",
    "./src/routes/offers",
    "./src/routes/orders",
    "./src/routes/payments",
    "./src/routes/customer",
    "./src/routes/customer-locations",
    "./src/routes/cart",
    "./src/routes/stats",
    "./src/routes/favorites",
    "./src/routes/reviews",
    "./src/routes/notifications",
    "./src/routes/subscriptions",
    "./src/routes/profile",
    "./src/routes/admin"
];

console.log("🔍 Тестирование загрузки роутов...\n");

for (const route of routes) {
    try {
        require(route);
        console.log(`✅ ${route} - OK`);
    } catch (error) {
        console.error(`❌ ${route} - ERROR:`);
        console.error(`   ${error.message}`);
        console.error(`   Stack: ${error.stack?.split('\n')[0]}`);
        process.exit(1);
    }
}

console.log("\n✅ Все роуты загружены успешно!");

