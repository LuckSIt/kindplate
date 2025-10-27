/**
 * Unit тесты для JWT токенов (JOSE)
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { createAccessToken, createRefreshToken, verifyToken, createTokenPair, decodeToken } from '../src/lib/jwt.js';

describe('JWT Token Creation', () => {
  const testUser = {
    id: 1,
    email: 'test@example.com',
    is_business: false
  };

  it('должен создавать access токен', async () => {
    const token = await createAccessToken({
      userId: testUser.id,
      email: testUser.email,
      isBusiness: testUser.is_business
    });

    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3); // JWT имеет 3 части
  });

  it('должен создавать refresh токен', async () => {
    const token = await createRefreshToken({
      userId: testUser.id
    });

    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3);
  });

  it('должен создавать пару токенов', async () => {
    const tokens = await createTokenPair(testUser);

    expect(tokens).toBeDefined();
    expect(tokens.accessToken).toBeDefined();
    expect(tokens.refreshToken).toBeDefined();
    expect(typeof tokens.accessToken).toBe('string');
    expect(typeof tokens.refreshToken).toBe('string');
  });
});

describe('JWT Token Verification', () => {
  const testUser = {
    id: 1,
    email: 'test@example.com',
    is_business: false
  };

  it('должен верифицировать валидный access токен', async () => {
    const token = await createAccessToken({
      userId: testUser.id,
      email: testUser.email,
      isBusiness: testUser.is_business
    });

    const payload = await verifyToken(token);

    expect(payload).toBeDefined();
    expect(payload.userId).toBe(testUser.id);
    expect(payload.email).toBe(testUser.email);
    expect(payload.isBusiness).toBe(testUser.is_business);
    expect(payload.type).toBe('access');
  });

  it('должен верифицировать валидный refresh токен', async () => {
    const token = await createRefreshToken({
      userId: testUser.id
    });

    const payload = await verifyToken(token);

    expect(payload).toBeDefined();
    expect(payload.userId).toBe(testUser.id);
    expect(payload.type).toBe('refresh');
  });

  it('должен отклонять невалидный токен', async () => {
    const invalidToken = 'invalid.token.here';

    await expect(verifyToken(invalidToken)).rejects.toThrow();
  });

  it('должен отклонять модифицированный токен', async () => {
    const token = await createAccessToken({
      userId: testUser.id,
      email: testUser.email,
      isBusiness: testUser.is_business
    });

    // Модифицируем токен
    const parts = token.split('.');
    const modifiedToken = parts[0] + '.' + parts[1] + '.modified';

    await expect(verifyToken(modifiedToken)).rejects.toThrow();
  });
});

describe('JWT Token Decoding', () => {
  const testUser = {
    id: 1,
    email: 'test@example.com',
    is_business: true
  };

  it('должен декодировать access токен без верификации', async () => {
    const token = await createAccessToken({
      userId: testUser.id,
      email: testUser.email,
      isBusiness: testUser.is_business
    });

    const payload = decodeToken(token);

    expect(payload).toBeDefined();
    expect(payload.userId).toBe(testUser.id);
    expect(payload.email).toBe(testUser.email);
    expect(payload.isBusiness).toBe(testUser.is_business);
    expect(payload.type).toBe('access');
  });

  it('должен декодировать refresh токен', async () => {
    const token = await createRefreshToken({
      userId: testUser.id
    });

    const payload = decodeToken(token);

    expect(payload).toBeDefined();
    expect(payload.userId).toBe(testUser.id);
    expect(payload.type).toBe('refresh');
  });

  it('должен выбрасывать ошибку для невалидного формата', () => {
    expect(() => decodeToken('invalid')).toThrow();
    expect(() => decodeToken('invalid.token')).toThrow();
  });
});

describe('JWT Token Properties', () => {
  const testUser = {
    id: 123,
    email: 'business@example.com',
    is_business: true
  };

  it('access токен должен содержать правильный issuer и audience', async () => {
    const token = await createAccessToken({
      userId: testUser.id,
      email: testUser.email,
      isBusiness: testUser.is_business
    });

    const payload = await verifyToken(token);

    expect(payload.iss).toBe('kindplate-api');
    expect(payload.aud).toBe('kindplate-client');
  });

  it('refresh токен должен содержать правильный issuer и audience', async () => {
    const token = await createRefreshToken({
      userId: testUser.id
    });

    const payload = await verifyToken(token);

    expect(payload.iss).toBe('kindplate-api');
    expect(payload.aud).toBe('kindplate-client');
  });

  it('токены должны содержать временные метки', async () => {
    const token = await createAccessToken({
      userId: testUser.id,
      email: testUser.email,
      isBusiness: testUser.is_business
    });

    const payload = await verifyToken(token);

    expect(payload.iat).toBeDefined(); // issued at
    expect(payload.exp).toBeDefined(); // expiration
    expect(payload.exp).toBeGreaterThan(payload.iat);
  });

  it('access и refresh токены должны иметь разные типы', async () => {
    const accessToken = await createAccessToken({
      userId: testUser.id,
      email: testUser.email,
      isBusiness: testUser.is_business
    });

    const refreshToken = await createRefreshToken({
      userId: testUser.id
    });

    const accessPayload = await verifyToken(accessToken);
    const refreshPayload = await verifyToken(refreshToken);

    expect(accessPayload.type).toBe('access');
    expect(refreshPayload.type).toBe('refresh');
  });
});

describe('JWT Token Pair', () => {
  const customerUser = {
    id: 1,
    email: 'customer@example.com',
    is_business: false
  };

  const businessUser = {
    id: 2,
    email: 'business@example.com',
    is_business: true
  };

  it('должен создавать разные токены для разных пользователей', async () => {
    const customerTokens = await createTokenPair(customerUser);
    const businessTokens = await createTokenPair(businessUser);

    expect(customerTokens.accessToken).not.toBe(businessTokens.accessToken);
    expect(customerTokens.refreshToken).not.toBe(businessTokens.refreshToken);

    const customerPayload = await verifyToken(customerTokens.accessToken);
    const businessPayload = await verifyToken(businessTokens.accessToken);

    expect(customerPayload.userId).toBe(customerUser.id);
    expect(businessPayload.userId).toBe(businessUser.id);
    expect(customerPayload.isBusiness).toBe(false);
    expect(businessPayload.isBusiness).toBe(true);
  });

  it('оба токена в паре должны быть валидными', async () => {
    const tokens = await createTokenPair(customerUser);

    const accessPayload = await verifyToken(tokens.accessToken);
    const refreshPayload = await verifyToken(tokens.refreshToken);

    expect(accessPayload).toBeDefined();
    expect(refreshPayload).toBeDefined();
    expect(accessPayload.userId).toBe(refreshPayload.userId);
  });
});




