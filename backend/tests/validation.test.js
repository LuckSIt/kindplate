/**
 * Unit тесты для валидации данных
 */

import { describe, it, expect } from 'vitest';

// Функция валидации email
function validateEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Функция валидации пароля
function validatePassword(password) {
  if (!password || typeof password !== 'string') return false;
  return password.length >= 6;
}

// Функция валидации имени
function validateName(name) {
  if (!name || typeof name !== 'string') return false;
  const trimmedName = name.trim();
  return trimmedName.length >= 2 && trimmedName.length <= 100;
}

// Функция валидации телефона
function validatePhone(phone) {
  if (!phone) return true; // Телефон опционален
  if (typeof phone !== 'string') return false;
  const phoneRegex = /^[\d\s\+\-\(\)]+$/;
  return phoneRegex.test(phone) && phone.length >= 10 && phone.length <= 20;
}

describe('Email Validation', () => {
  it('должен принимать валидные email адреса', () => {
    expect(validateEmail('test@example.com')).toBe(true);
    expect(validateEmail('user.name@domain.co.uk')).toBe(true);
    expect(validateEmail('test+tag@example.com')).toBe(true);
    expect(validateEmail('123@test.ru')).toBe(true);
  });

  it('должен отклонять невалидные email адреса', () => {
    expect(validateEmail('invalid')).toBe(false);
    expect(validateEmail('test@')).toBe(false);
    expect(validateEmail('@example.com')).toBe(false);
    expect(validateEmail('test @example.com')).toBe(false);
    expect(validateEmail('')).toBe(false);
    expect(validateEmail(null)).toBe(false);
    expect(validateEmail(undefined)).toBe(false);
  });
});

describe('Password Validation', () => {
  it('должен принимать пароли длиной >= 6 символов', () => {
    expect(validatePassword('123456')).toBe(true);
    expect(validatePassword('password')).toBe(true);
    expect(validatePassword('Str0ng!P@ss')).toBe(true);
  });

  it('должен отклонять короткие пароли', () => {
    expect(validatePassword('12345')).toBe(false);
    expect(validatePassword('abc')).toBe(false);
    expect(validatePassword('1')).toBe(false);
    expect(validatePassword('')).toBe(false);
  });

  it('должен отклонять null и undefined', () => {
    expect(validatePassword(null)).toBe(false);
    expect(validatePassword(undefined)).toBe(false);
  });
});

describe('Name Validation', () => {
  it('должен принимать валидные имена', () => {
    expect(validateName('Иван')).toBe(true);
    expect(validateName('Мария Петровна')).toBe(true);
    expect(validateName('Café "Le Bon"')).toBe(true);
    expect(validateName('А'.repeat(100))).toBe(true); // Максимум 100 символов
  });

  it('должен отклонять слишком короткие имена', () => {
    expect(validateName('A')).toBe(false);
    expect(validateName(' ')).toBe(false);
    expect(validateName('')).toBe(false);
  });

  it('должен отклонять слишком длинные имена', () => {
    expect(validateName('A'.repeat(101))).toBe(false);
  });

  it('должен обрабатывать пробелы в начале/конце', () => {
    expect(validateName('  Иван  ')).toBe(true); // Обрезаются до 'Иван'
    expect(validateName('   ')).toBe(false); // Только пробелы
  });

  it('должен отклонять null и undefined', () => {
    expect(validateName(null)).toBe(false);
    expect(validateName(undefined)).toBe(false);
  });
});

describe('Phone Validation', () => {
  it('должен принимать валидные номера телефонов', () => {
    expect(validatePhone('+7 (999) 123-45-67')).toBe(true);
    expect(validatePhone('+79991234567')).toBe(true);
    expect(validatePhone('8 999 123 45 67')).toBe(true);
    expect(validatePhone('1234567890')).toBe(true);
  });

  it('должен отклонять невалидные номера', () => {
    expect(validatePhone('abc')).toBe(false);
    expect(validatePhone('123')).toBe(false); // Слишком короткий
    expect(validatePhone('12345678901234567890123')).toBe(false); // Слишком длинный
    expect(validatePhone('123-456-78a90')).toBe(false); // Содержит букву
  });

  it('должен принимать пустой телефон (опционален)', () => {
    expect(validatePhone('')).toBe(true);
    expect(validatePhone(null)).toBe(true);
    expect(validatePhone(undefined)).toBe(true);
  });
});

describe('Registration Data Validation', () => {
  it('должен валидировать полный набор данных для регистрации', () => {
    const validData = {
      name: 'Иван Петров',
      email: 'ivan@example.com',
      password: 'SecureP@ss123'
    };

    expect(validateName(validData.name)).toBe(true);
    expect(validateEmail(validData.email)).toBe(true);
    expect(validatePassword(validData.password)).toBe(true);
  });

  it('должен отклонять невалидные данные', () => {
    const invalidData = {
      name: 'A',
      email: 'invalid-email',
      password: '123'
    };

    expect(validateName(invalidData.name)).toBe(false);
    expect(validateEmail(invalidData.email)).toBe(false);
    expect(validatePassword(invalidData.password)).toBe(false);
  });
});




