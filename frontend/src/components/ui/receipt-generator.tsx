import React from 'react';
import { Download, FileText } from 'lucide-react';
import { Button } from './button';

interface ReceiptData {
  orderId: number;
  businessName: string;
  businessAddress: string;
  items: Array<{
    title: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  subtotal: number;
  serviceFee: number;
  total: number;
  paymentMethod: string;
  createdAt: string;
  pickupTime: string;
}

interface ReceiptGeneratorProps {
  receiptData: ReceiptData;
  onDownload?: () => void;
}

export const ReceiptGenerator: React.FC<ReceiptGeneratorProps> = ({ 
  receiptData, 
  onDownload 
}) => {
  const generateReceipt = () => {
    // Создаем HTML для чека
    const receiptHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Чек заказа #${receiptData.orderId}</title>
        <style>
          body {
            font-family: 'Courier New', monospace;
            max-width: 400px;
            margin: 0 auto;
            padding: 20px;
            background: white;
            color: black;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
            margin-bottom: 20px;
          }
          .business-name {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          .business-address {
            font-size: 12px;
            color: #666;
          }
          .order-info {
            margin-bottom: 20px;
          }
          .order-number {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          .order-date {
            font-size: 12px;
            color: #666;
          }
          .items {
            margin-bottom: 20px;
          }
          .item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
            font-size: 12px;
          }
          .item-name {
            flex: 1;
          }
          .item-quantity {
            margin: 0 10px;
          }
          .item-price {
            font-weight: bold;
          }
          .totals {
            border-top: 1px solid #000;
            padding-top: 10px;
            margin-bottom: 20px;
          }
          .total-line {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
            font-size: 12px;
          }
          .total-final {
            font-weight: bold;
            font-size: 14px;
            border-top: 1px solid #000;
            padding-top: 5px;
          }
          .footer {
            text-align: center;
            font-size: 10px;
            color: #666;
            border-top: 1px solid #000;
            padding-top: 10px;
          }
          .pickup-info {
            background: #f0f0f0;
            padding: 10px;
            margin: 10px 0;
            border-radius: 5px;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="business-name">${receiptData.businessName}</div>
          <div class="business-address">${receiptData.businessAddress}</div>
        </div>
        
        <div class="order-info">
          <div class="order-number">Заказ #${receiptData.orderId}</div>
          <div class="order-date">${new Date(receiptData.createdAt).toLocaleString('ru-RU')}</div>
        </div>
        
        <div class="pickup-info">
          <strong>Время самовывоза:</strong><br>
          ${receiptData.pickupTime}
        </div>
        
        <div class="items">
          ${receiptData.items.map(item => `
            <div class="item">
              <span class="item-name">${item.title}</span>
              <span class="item-quantity">${item.quantity} шт.</span>
              <span class="item-price">${item.total} ₽</span>
            </div>
          `).join('')}
        </div>
        
        <div class="totals">
          <div class="total-line">
            <span>Подытог:</span>
            <span>${receiptData.subtotal} ₽</span>
          </div>
          <div class="total-line">
            <span>Сервисный сбор:</span>
            <span>${receiptData.serviceFee} ₽</span>
          </div>
          <div class="total-line total-final">
            <span>Итого к оплате:</span>
            <span>${receiptData.total} ₽</span>
          </div>
        </div>
        
        <div class="footer">
          <div>Способ оплаты: ${receiptData.paymentMethod}</div>
          <div>Спасибо за заказ!</div>
          <div>Забирайте строго в указанное время</div>
        </div>
      </body>
      </html>
    `;

    // Создаем новый window для печати
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(receiptHTML);
      printWindow.document.close();
      printWindow.focus();
      
      // Ждем загрузки и печатаем
      printWindow.onload = () => {
        printWindow.print();
        printWindow.close();
      };
    }

    if (onDownload) {
      onDownload();
    }
  };

  return (
    <Button onClick={generateReceipt} variant="outline" className="w-full">
      <FileText className="mr-2 h-4 w-4" />
      Скачать чек
    </Button>
  );
};



