// This file serves as documentation for the API endpoints that should be implemented
// These endpoints correspond to the controller logic provided

/*
INVOICE ENDPOINTS:

POST /api/invoices - Create new invoice (createInvoice)
GET /api/invoices/seller - Get all invoices for logged-in seller (getSellerInvoices)  
GET /api/invoices/available - Get available invoices for financing (getAvailableInvoices)
GET /api/invoices/:id - Get specific invoice with offers and payments (getInvoiceById)

PAYMENT ENDPOINTS:

POST /api/payments - Record a payment (recordPayment)
GET /api/payments/invoice/:invoiceId - Get payments for specific invoice (getPaymentsForInvoice)

SETTLEMENT ENDPOINTS:

POST /api/settlements/generate/:invoiceId - Generate settlements for invoice (generateSettlementsForInvoice)

OFFER ENDPOINTS:

POST /api/offers - Create new offer
GET /api/offers/financier - Get offers by logged-in financier
PUT /api/offers/:id/accept - Accept an offer
PUT /api/offers/:id/reject - Reject an offer

EXPECTED DATA STRUCTURES:

Invoice:
{
  id: number,
  invoiceNumber: string,
  buyerName: string,
  buyerEmail: string,
  buyerGSTIN: string,
  amount: number,
  dueDate: string (ISO date),
  uploadedAt: string (ISO date),
  sellerId: number,
  status: 'pending' | 'approved' | 'funded' | 'paid' | 'overdue',
  isFinanced: boolean,
  offers: Offer[],
  payments: Payment[],
  seller: { name: string }
}

Offer:
{
  id: number,
  amountRequested: number,
  interestRate: number,
  terms: string,
  status: 'pending' | 'approved' | 'rejected',
  createdAt: string (ISO date),
  financierId: number,
  invoiceId: number,
  invoice: Invoice,
  financier: { name: string }
}

Payment:
{
  id: number,
  amount: number,
  method: string,
  createdAt: string (ISO date),
  invoiceId: number
}

Settlement:
{
  id: number,
  amountSettled: number,
  platformFee: number,
  financingRequestId: number,
  paymentId: number
}

*/

export default function ApiDocumentation() {
  return null;
}
