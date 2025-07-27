"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/utils";

function SettlementPage() {
  const [invoice, setInvoice] = useState(null);
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
  const [recordingPayment, setRecordingPayment] = useState(false);
  const { auth } = useAuth();
  const params = useParams();
  const router = useRouter();
  const invoiceId = params.id;

  useEffect(() => {
    fetchInvoiceDetails();
  }, [invoiceId]);

  const fetchInvoiceDetails = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/invoices/${invoiceId}`,
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch invoice details");
      }

      const data = await response.json();
      setInvoice(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateSettlement = async () => {
    setGenerating(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/settlements/${invoiceId}/generate`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${auth.token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to generate settlement");
      }

      const data = await response.json();
      setSettlements(data.settlements);
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const recordPayment = async () => {
    if (
      !paymentAmount ||
      isNaN(paymentAmount) ||
      parseFloat(paymentAmount) <= 0
    ) {
      setError("Please enter a valid payment amount");
      return;
    }

    setRecordingPayment(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/payments`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${auth.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            invoiceId: parseInt(invoiceId),
            amount: parseFloat(paymentAmount),
            method: paymentMethod,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to record payment");
      }

      // Refresh invoice data to show new payment
      await fetchInvoiceDetails();

      // Reset form
      setPaymentAmount("");
      setShowPaymentForm(false);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setRecordingPayment(false);
    }
  };

  const getTotalPayments = (payments) => {
    return payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0;
  };

  const getApprovedOffers = (offers) => {
    return offers?.filter((offer) => offer.status === "approved") || [];
  };

  const calculateDaysFunded = (uploadedAt) => {
    return Math.floor(
      (new Date() - new Date(uploadedAt)) / (1000 * 60 * 60 * 24)
    );
  };

  const calculateInterest = (amount, rate, days) => {
    return amount * (rate / 100) * (days / 365);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading settlement details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">Error: {error}</div>
        <div className="text-center mt-4">
          <Button onClick={() => router.push("/seller/my-invoices")}>
            Back to Invoices
          </Button>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Invoice not found</div>
      </div>
    );
  }

  const approvedOffers = getApprovedOffers(invoice.offers);
  const totalPayments = getTotalPayments(invoice.payments);
  const daysFunded = calculateDaysFunded(invoice.uploadedAt);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Settlement Details
          </h1>
          <p className="text-muted-foreground">
            Invoice #{invoice.invoiceNumber} - {invoice.buyerName}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => router.push("/seller/my-invoices")}
        >
          Back to Invoices
        </Button>
      </div>

      {/* Invoice Summary */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Invoice Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Original Amount
              </p>
              <p className="text-lg font-semibold">
                {formatCurrency(invoice.amount)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Payments
              </p>
              <p className="text-lg font-semibold">
                {formatCurrency(totalPayments)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Days Funded
              </p>
              <p className="text-lg font-semibold">{daysFunded} days</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Status
              </p>
              <Badge variant={invoice.isFinanced ? "default" : "secondary"}>
                {invoice.isFinanced ? "Financed" : "Pending"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Records */}
      {invoice.payments && invoice.payments.length > 0 ? (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Payment Records</CardTitle>
                <CardDescription>
                  All payments received for this invoice
                </CardDescription>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowPaymentForm(!showPaymentForm)}
              >
                {showPaymentForm ? "Cancel" : "Record Payment"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {invoice.payments.map((payment, index) => (
                <div
                  key={payment.id}
                  className="flex justify-between items-center p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">Payment #{index + 1}</p>
                    <p className="text-sm text-muted-foreground">
                      Method: {payment.method} | Date:{" "}
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {formatCurrency(payment.amount)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Payment Records</CardTitle>
                <CardDescription>
                  No payments recorded yet for this invoice
                </CardDescription>
              </div>
              <Button onClick={() => setShowPaymentForm(!showPaymentForm)}>
                {showPaymentForm ? "Cancel" : "Record Payment"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-8">
              Record the first payment to begin settlement process
            </p>
          </CardContent>
        </Card>
      )}

      {/* Payment Recording Form */}
      {showPaymentForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Record New Payment</CardTitle>
            <CardDescription>
              Enter payment details received for this invoice
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Payment Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  step="0.01"
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="method">Payment Method</Label>
                <select
                  id="method"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="cheque">Cheque</option>
                  <option value="upi">UPI</option>
                  <option value="cash">Cash</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button
                onClick={recordPayment}
                disabled={recordingPayment}
                className="flex-1"
              >
                {recordingPayment ? "Recording..." : "Record Payment"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowPaymentForm(false)}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Approved Offers */}
      {approvedOffers.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Approved Financing Offers</CardTitle>
            <CardDescription>
              Offers that are eligible for settlement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {approvedOffers.map((offer) => {
                const interest = calculateInterest(
                  offer.amountRequested,
                  offer.interestRate,
                  daysFunded
                );
                const totalDue = offer.amountRequested + interest;

                return (
                  <div key={offer.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium">
                          Offer from {offer.financier?.name || "Financier"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Rate: {offer.interestRate}% per annum
                        </p>
                      </div>
                      <Badge variant="default">Approved</Badge>
                    </div>

                    <Separator className="my-3" />

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Amount Requested
                        </p>
                        <p className="font-semibold">
                          {formatCurrency(offer.amountRequested)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Interest Accrued
                        </p>
                        <p className="font-semibold">
                          {formatCurrency(interest)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Total Due
                        </p>
                        <p className="font-semibold text-blue-600">
                          {formatCurrency(totalDue)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Days
                        </p>
                        <p className="font-semibold">{daysFunded}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Settlement Generation */}
      {approvedOffers.length > 0 && totalPayments > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Generate Settlement</CardTitle>
            <CardDescription>
              Calculate and record the final settlement for all approved offers
            </CardDescription>
          </CardHeader>
          <CardContent>
            {settlements.length === 0 ? (
              <div className="text-center">
                <p className="mb-4 text-muted-foreground">
                  Ready to generate settlement based on payments received and
                  approved offers
                </p>
                <Button onClick={generateSettlement} disabled={generating}>
                  {generating ? "Generating..." : "Generate Settlement"}
                </Button>
              </div>
            ) : (
              <div>
                <h4 className="font-semibold mb-4 text-green-600">
                  Settlement Generated Successfully
                </h4>
                <div className="space-y-4">
                  {settlements.map((settlement, index) => (
                    <div
                      key={settlement.id}
                      className="p-4 bg-green-50 border border-green-200 rounded-lg"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">Settlement #{index + 1}</p>
                          <p className="text-sm text-muted-foreground">
                            Settlement ID: {settlement.id}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-600">
                            {formatCurrency(settlement.amountSettled)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Platform Fee:{" "}
                            {formatCurrency(settlement.platformFee)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* No settlements available */}
      {(approvedOffers.length === 0 || totalPayments === 0) && (
        <Card>
          <CardContent className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">
              Settlement Not Available
            </h3>
            <p className="text-muted-foreground mb-4">
              {approvedOffers.length === 0
                ? "No approved offers available for settlement"
                : "No payments received yet for this invoice"}
            </p>
            <Button
              variant="outline"
              onClick={() => router.push(`/seller/${invoice.id}`)}
            >
              View Invoice Details
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function Settlement() {
  return (
    <ProtectedRoute allowedRoles={["seller"]}>
      <SettlementPage />
    </ProtectedRoute>
  );
}
