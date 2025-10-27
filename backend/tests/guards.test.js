/**
 * Unit тесты для authentication и authorization guards
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { requireAuth, requireBusiness, requireCustomer, optionalAuth } from '../src/lib/guards.js';

describe('requireAuth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = { session: {} };
    res = {};
    next = vi.fn();
  });

  it('должен пропускать аутентифицированного пользователя', () => {
    req.session.userId = 1;
    
    requireAuth(req, res, next);
    
    expect(next).toHaveBeenCalledWith();
  });

  it('должен выбрасывать ошибку для неаутентифицированного пользователя', () => {
    req.session = {};
    
    expect(() => requireAuth(req, res, next)).toThrow('Необходима авторизация');
  });

  it('должен выбрасывать ошибку при отсутствии сессии', () => {
    req.session = null;
    
    expect(() => requireAuth(req, res, next)).toThrow('Необходима авторизация');
  });
});

describe('requireBusiness Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = { session: {} };
    res = {};
    next = vi.fn();
  });

  it('должен пропускать бизнес-пользователя', () => {
    req.session.userId = 1;
    req.session.isBusiness = true;
    
    requireBusiness(req, res, next);
    
    expect(next).toHaveBeenCalledWith();
  });

  it('должен выбрасывать ошибку для обычного пользователя', () => {
    req.session.userId = 1;
    req.session.isBusiness = false;
    
    expect(() => requireBusiness(req, res, next)).toThrow('Доступ только для бизнеса');
  });

  it('должен выбрасывать ошибку для неаутентифицированного пользователя', () => {
    req.session = {};
    
    expect(() => requireBusiness(req, res, next)).toThrow('Необходима авторизация');
  });
});

describe('requireCustomer Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = { session: {} };
    res = {};
    next = vi.fn();
  });

  it('должен пропускать обычного пользователя (не бизнес)', () => {
    req.session.userId = 1;
    req.session.isBusiness = false;
    
    requireCustomer(req, res, next);
    
    expect(next).toHaveBeenCalledWith();
  });

  it('должен выбрасывать ошибку для бизнес-пользователя', () => {
    req.session.userId = 1;
    req.session.isBusiness = true;
    
    expect(() => requireCustomer(req, res, next)).toThrow('Доступ только для клиентов');
  });

  it('должен выбрасывать ошибку для неаутентифицированного пользователя', () => {
    req.session = {};
    
    expect(() => requireCustomer(req, res, next)).toThrow('Необходима авторизация');
  });
});

describe('optionalAuth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = { session: {} };
    res = {};
    next = vi.fn();
  });

  it('должен устанавливать isAuthenticated = true для аутентифицированного пользователя', () => {
    req.session.userId = 1;
    req.session.isBusiness = false;
    
    optionalAuth(req, res, next);
    
    expect(req.isAuthenticated).toBe(true);
    expect(req.userId).toBe(1);
    expect(req.isBusiness).toBe(false);
    expect(next).toHaveBeenCalledWith();
  });

  it('должен устанавливать isAuthenticated = false для неаутентифицированного пользователя', () => {
    req.session = {};
    
    optionalAuth(req, res, next);
    
    expect(req.isAuthenticated).toBe(false);
    expect(req.userId).toBeUndefined();
    expect(next).toHaveBeenCalledWith();
  });

  it('не должен выбрасывать ошибку при отсутствии сессии', () => {
    req.session = null;
    
    expect(() => optionalAuth(req, res, next)).not.toThrow();
    expect(req.isAuthenticated).toBe(false);
    expect(next).toHaveBeenCalledWith();
  });

  it('должен правильно определять бизнес-пользователя', () => {
    req.session.userId = 2;
    req.session.isBusiness = true;
    
    optionalAuth(req, res, next);
    
    expect(req.isAuthenticated).toBe(true);
    expect(req.userId).toBe(2);
    expect(req.isBusiness).toBe(true);
    expect(next).toHaveBeenCalledWith();
  });
});

describe('Guards Integration Tests', () => {
  it('должен правильно обрабатывать последовательность guards', () => {
    const req = { session: { userId: 1, isBusiness: true } };
    const res = {};
    const next = vi.fn();

    // Сначала проверяем аутентификацию
    requireAuth(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);

    // Затем проверяем, что это бизнес
    requireBusiness(req, res, next);
    expect(next).toHaveBeenCalledTimes(2);
  });

  it('должен блокировать доступ на втором guard', () => {
    const req = { session: { userId: 1, isBusiness: false } };
    const res = {};
    const next = vi.fn();

    // Проходит requireAuth
    requireAuth(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);

    // Не проходит requireBusiness
    expect(() => requireBusiness(req, res, next)).toThrow();
    expect(next).toHaveBeenCalledTimes(1); // Не должен быть вызван второй раз
  });
});




