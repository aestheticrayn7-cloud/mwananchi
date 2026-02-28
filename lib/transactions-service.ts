import { Transaction } from './types';

class TransactionsService {
  async getTransactions(token: string): Promise<Transaction[]> {
    try {
      const response = await fetch('/api/transactions', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }

      const { transactions } = await response.json();
      return transactions;
    } catch (error) {
      console.error('[v0] Error fetching transactions:', error);
      return [];
    }
  }

  async createTransaction(
    cartItems: any[],
    totals: any,
    paymentMethod: string,
    token: string,
    customerId?: string
  ): Promise<Transaction> {
    const response = await fetch('/api/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        items: cartItems,
        subtotal: totals.subtotal,
        discount_amount: totals.discount,
        tax_amount: totals.tax,
        net_amount: totals.total,
        payment_method: paymentMethod,
        customer_id: customerId,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create transaction');
    }

    const { transaction } = await response.json();
    return transaction;
  }

  async getTransactionReceipt(transactionId: string, token: string): Promise<Transaction | null> {
    try {
      const response = await fetch(`/api/transactions/${transactionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) return null;

      const { transaction } = await response.json();
      return transaction;
    } catch (error) {
      console.error('[v0] Error fetching receipt:', error);
      return null;
    }
  }

  generateReceiptHTML(transaction: Transaction): string {
    const date = new Date(transaction.created_at).toLocaleString('en-KE');
    const items = transaction.transaction_items || [];

    return `
      <html>
        <head>
          <title>Receipt #${transaction.id.slice(0, 8)}</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
            .items { margin: 20px 0; }
            .item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #ddd; }
            .summary { margin-top: 20px; padding-top: 10px; border-top: 2px solid #333; }
            .row { display: flex; justify-content: space-between; padding: 5px 0; }
            .total { font-weight: bold; font-size: 18px; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>RECEIPT</h2>
            <p>${date}</p>
            <p>Transaction #${transaction.id.slice(0, 8)}</p>
          </div>

          <div class="items">
            ${items.map(item => `
              <div class="item">
                <div>
                  <p>${item.product?.name || 'Item'}</p>
                  <p style="font-size: 12px; color: #666;">${item.quantity} × KES ${item.unit_price.toFixed(2)}</p>
                </div>
                <p>KES ${item.line_total.toFixed(2)}</p>
              </div>
            `).join('')}
          </div>

          <div class="summary">
            <div class="row">
              <span>Subtotal:</span>
              <span>KES ${transaction.total_amount.toFixed(2)}</span>
            </div>
            ${transaction.discount_amount > 0 ? `
              <div class="row">
                <span>Discount:</span>
                <span>-KES ${transaction.discount_amount.toFixed(2)}</span>
              </div>
            ` : ''}
            <div class="row">
              <span>Tax (16%):</span>
              <span>KES ${transaction.tax_amount.toFixed(2)}</span>
            </div>
            <div class="row total">
              <span>TOTAL:</span>
              <span>KES ${transaction.net_amount.toFixed(2)}</span>
            </div>
            <div class="row">
              <span>Payment Method:</span>
              <span>${transaction.payment_method.toUpperCase()}</span>
            </div>
          </div>

          <div class="footer">
            <p>Thank you for your business!</p>
            <p>Mwananchi POS System</p>
          </div>
        </body>
      </html>
    `;
  }
}

export const transactionsService = new TransactionsService();
