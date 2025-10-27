const crypto = require('crypto');

// Простая система аудита без JOSE (для упрощения)
class AuditLogger {
  constructor() {
    this.secretKey = process.env.AUDIT_SECRET_KEY || 'default-secret-key';
  }

  // Создаем подпись для события
  createSignature(data) {
    const hmac = crypto.createHmac('sha256', this.secretKey);
    hmac.update(JSON.stringify(data));
    return hmac.digest('hex');
  }

  // Логируем событие
  logEvent(eventType, data, userId = null) {
    const timestamp = new Date().toISOString();
    const event = {
      id: crypto.randomBytes(16).toString('hex'),
      type: eventType,
      timestamp,
      userId,
      data,
      signature: null
    };

    // Создаем подпись
    event.signature = this.createSignature(event);

    // В реальном приложении здесь было бы сохранение в базу данных
    console.log('🔍 AUDIT EVENT:', {
      id: event.id,
      type: event.type,
      timestamp: event.timestamp,
      userId: event.userId,
      data: event.data,
      signature: event.signature
    });

    return event;
  }

  // Проверяем подпись события
  verifySignature(event) {
    if (!event.signature) {
      return false;
    }

    const { signature, ...eventWithoutSignature } = event;
    const expectedSignature = this.createSignature(eventWithoutSignature);
    
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  }

  // Специфичные методы для разных типов событий
  logPaymentCreated(paymentId, orderId, amount, paymentMethod, userId) {
    return this.logEvent('PAYMENT_CREATED', {
      paymentId,
      orderId,
      amount,
      paymentMethod
    }, userId);
  }

  logPaymentStatusChanged(paymentId, oldStatus, newStatus, userId) {
    return this.logEvent('PAYMENT_STATUS_CHANGED', {
      paymentId,
      oldStatus,
      newStatus
    }, userId);
  }

  logOrderCreated(orderId, businessId, total, userId) {
    return this.logEvent('ORDER_CREATED', {
      orderId,
      businessId,
      total
    }, userId);
  }

  logOrderStatusChanged(orderId, oldStatus, newStatus, userId) {
    return this.logEvent('ORDER_STATUS_CHANGED', {
      orderId,
      oldStatus,
      newStatus
    }, userId);
  }

  logWebhookReceived(webhookType, data, source) {
    return this.logEvent('WEBHOOK_RECEIVED', {
      webhookType,
      data,
      source
    });
  }
}

// Создаем единственный экземпляр
const auditLogger = new AuditLogger();

module.exports = auditLogger;
