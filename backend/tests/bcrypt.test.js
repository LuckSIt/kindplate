/**
 * Unit тесты для bcrypt хэширования паролей
 */

import { describe, it, expect } from 'vitest';
import bcrypt from 'bcrypt';

describe('Bcrypt Password Hashing', () => {
  const testPassword = 'TestPassword123!';
  const weakPassword = '123';
  const strongPassword = 'Str0ng!P@ssw0rd#2024';

  it('должен хэшировать пароль с salt rounds = 12', async () => {
    const hash = await bcrypt.hash(testPassword, 12);
    
    expect(hash).toBeDefined();
    expect(typeof hash).toBe('string');
    expect(hash).not.toBe(testPassword);
    expect(hash.length).toBeGreaterThan(50); // bcrypt хэш всегда > 50 символов
  });

  it('должен верифицировать правильный пароль', async () => {
    const hash = await bcrypt.hash(testPassword, 12);
    const isValid = await bcrypt.compare(testPassword, hash);
    
    expect(isValid).toBe(true);
  });

  it('должен отклонять неправильный пароль', async () => {
    const hash = await bcrypt.hash(testPassword, 12);
    const isValid = await bcrypt.compare('WrongPassword', hash);
    
    expect(isValid).toBe(false);
  });

  it('должен создавать разные хэши для одного и того же пароля', async () => {
    const hash1 = await bcrypt.hash(testPassword, 12);
    const hash2 = await bcrypt.hash(testPassword, 12);
    
    expect(hash1).not.toBe(hash2);
    
    // Но оба хэша должны быть валидными для исходного пароля
    expect(await bcrypt.compare(testPassword, hash1)).toBe(true);
    expect(await bcrypt.compare(testPassword, hash2)).toBe(true);
  });

  it('должен работать со слабыми паролями (но они не рекомендуются)', async () => {
    const hash = await bcrypt.hash(weakPassword, 12);
    const isValid = await bcrypt.compare(weakPassword, hash);
    
    expect(isValid).toBe(true);
  });

  it('должен работать с сильными паролями', async () => {
    const hash = await bcrypt.hash(strongPassword, 12);
    const isValid = await bcrypt.compare(strongPassword, hash);
    
    expect(isValid).toBe(true);
  });

  it('должен быть регистрозависимым', async () => {
    const hash = await bcrypt.hash('Password', 12);
    
    expect(await bcrypt.compare('Password', hash)).toBe(true);
    expect(await bcrypt.compare('password', hash)).toBe(false);
    expect(await bcrypt.compare('PASSWORD', hash)).toBe(false);
  });

  it('должен отклонять пустые пароли', async () => {
    const hash = await bcrypt.hash('validPassword', 12);
    const isValid = await bcrypt.compare('', hash);
    
    expect(isValid).toBe(false);
  });
});




