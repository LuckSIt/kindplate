// Валидация данных
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const validatePassword = (password) => {
    // Минимум 6 символов (выравниваем с фронтендом: customerRegisterSchema, placeholder "Минимум 6 символов")
    // Дополнительные сложности (буквы/цифры/спецсимволы) сейчас не требуем, чтобы не ломать регистрацию.
    if (typeof password !== 'string') return false;
    return password.length >= 6 && password.length <= 100;
};

const validateCoordinates = (coords) => {
    if (!Array.isArray(coords) || coords.length !== 2) {
        return false;
    }
    const [lat, lon] = coords;
    return typeof lat === 'number' && typeof lon === 'number' && 
           lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
};

const validatePrice = (price) => {
    const numPrice = parseFloat(price);
    return !isNaN(numPrice) && numPrice > 0 && numPrice <= 1000000;
};

const validateTime = (time) => {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
};

const validateQuantity = (quantity) => {
    const numQuantity = parseInt(quantity);
    return !isNaN(numQuantity) && numQuantity >= 0 && numQuantity <= 1000;
};

// Middleware для валидации регистрации
const validateRegistration = (req, res, next) => {
    const { name, email, password, is_business } = req.body;
    const errors = [];

    // Валидация имени
    if (!name || typeof name !== 'string' || name.length < 2 || name.length > 100) {
        errors.push('Имя должно содержать от 2 до 100 символов');
    }

    // Валидация email
    if (!email || typeof email !== 'string' || !validateEmail(email) || email.length > 255) {
        errors.push('Некорректный email адрес');
    }

    // Валидация пароля (минимум 6 символов, как на фронтенде)
    if (!password || !validatePassword(password)) {
        errors.push('Пароль должен содержать минимум 6 символов');
    }

    // Валидация данных бизнеса
    if (is_business) {
        const { coords, address } = req.body;
        if (!coords || !validateCoordinates(coords)) {
            errors.push('Некорректные координаты');
        }
        if (!address || typeof address !== 'string' || address.length < 5) {
            errors.push('Некорректный адрес');
        }
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            error: 'VALIDATION_ERROR',
            details: errors
        });
    }

    next();
};

// Middleware для валидации входа
const validateLogin = (req, res, next) => {
    const { email, password } = req.body;
    const errors = [];

    if (!email || typeof email !== 'string' || !validateEmail(email)) {
        errors.push('Некорректный email адрес');
    }

    if (!password || typeof password !== 'string' || password.length < 1) {
        errors.push('Пароль не может быть пустым');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            error: 'VALIDATION_ERROR',
            details: errors
        });
    }

    next();
};

// Middleware для валидации предложения
const validateOffer = (req, res, next) => {
    const { title, original_price, discounted_price, quantity_available, pickup_time_start, pickup_time_end } = req.body;
    const errors = [];

    if (!title || typeof title !== 'string' || title.length < 3 || title.length > 200) {
        errors.push('Название должно содержать от 3 до 200 символов');
    }

    if (!original_price || !validatePrice(original_price)) {
        errors.push('Некорректная оригинальная цена');
    }

    if (!discounted_price || !validatePrice(discounted_price)) {
        errors.push('Некорректная цена со скидкой');
    }

    if (parseFloat(discounted_price) >= parseFloat(original_price)) {
        errors.push('Цена со скидкой должна быть меньше оригинальной');
    }

    if (!quantity_available || !validateQuantity(quantity_available)) {
        errors.push('Количество должно быть от 0 до 1000');
    }

    if (!pickup_time_start || !validateTime(pickup_time_start)) {
        errors.push('Некорректное время начала самовывоза');
    }

    if (!pickup_time_end || !validateTime(pickup_time_end)) {
        errors.push('Некорректное время окончания самовывоза');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            error: 'VALIDATION_ERROR',
            details: errors
        });
    }

    next();
};

module.exports = {
    validateEmail,
    validatePassword,
    validateCoordinates,
    validatePrice,
    validateTime,
    validateQuantity,
    validateRegistration,
    validateLogin,
    validateOffer
};



