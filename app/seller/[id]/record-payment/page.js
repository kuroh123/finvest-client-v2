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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";

function RecordPaymentPage() {
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
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

  const recordPayment = async (e) => {
    e.preventDefault();

    if (
      !paymentAmount ||
      isNaN(paymentAmount) ||
      parseFloat(paymentAmount) <= 0
    ) {
      setError("Please enter a valid payment amount");
      return;
    }

    setRecording(true);
    setError("");

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

      setSuccess("Payment recorded successfully!");
      setPaymentAmount("");

      // Refresh invoice data
      await fetchInvoiceDetails();

      // Redirect back to invoice details after a delay
      setTimeout(() => {
        router.push(`/seller/${invoiceId}`);
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setRecording(false);
    }
  };

  const getTotalPayments = (payments) => {
    return payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading invoice details...</div>
      </div>
    );
  }

  if (error && !invoice) {
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

  const totalPayments = getTotalPayments(invoice.payments);
  const remainingAmount = invoice.amount - totalPayments;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Record Payment</h1>
          <p className="text-muted-foreground">
            Invoice #{invoice.invoiceNumber} - {invoice.buyerName}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => router.push(`/seller/${invoice.id}`)}
        >
          Back to Invoice
        </Button>
      </div>

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-600 font-medium">{success}</p>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      )}

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
                Payments Received
              </p>
              <p className="text-lg font-semibold">
                {formatCurrency(totalPayments)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Remaining Amount
              </p>
              <p className="text-lg font-semibold text-blue-600">
                {formatCurrency(remainingAmount)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Status
              </p>
              <Badge variant={remainingAmount <= 0 ? "default" : "secondary"}>
                {remainingAmount <= 0 ? "Fully Paid" : "Pending"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Existing Payments */}
      {invoice.payments && invoice.payments.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Previous Payments</CardTitle>
            <CardDescription>
              Payments already recorded for this invoice
            </CardDescription>
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
      )}

      {/* Payment Recording Form */}
      <Card>
        <CardHeader>
          <CardTitle>Record New Payment</CardTitle>
          <CardDescription>
            Enter the details of the payment received from the buyer
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={recordPayment} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="amount">Payment Amount *</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter payment amount"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  step="0.01"
                  min="0"
                  max={remainingAmount}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Maximum: {formatCurrency(remainingAmount)}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="method">Payment Method *</Label>
                <select
                  id="method"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                >
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="cheque">Cheque</option>
                  <option value="upi">UPI</option>
                  <option value="neft">NEFT</option>
                  <option value="rtgs">RTGS</option>
                  <option value="cash">Cash</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <Separator />

            <div className="flex gap-4">
              <Button type="submit" disabled={recording} className="flex-1">
                {recording ? "Recording Payment..." : "Record Payment"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/seller/${invoice.id}`)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="mt-6 flex gap-4">
        <Button
          variant="outline"
          onClick={() => router.push(`/seller/settlement/${invoice.id}`)}
          disabled={!invoice.payments || invoice.payments.length === 0}
        >
          View Settlement
        </Button>
        <Button
          variant="outline"
          onClick={() => router.push("/seller/my-invoices")}
        >
          Back to All Invoices
        </Button>
      </div>
    </div>
  );
}

export default function RecordPayment() {
  return (
    <ProtectedRoute allowedRoles={["seller"]}>
      <RecordPaymentPage />
    </ProtectedRoute>
  );
}
