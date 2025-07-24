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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { formatCurrency, formatDate } from "@/lib/utils";

const MakeOffer = () => {
  const { id: invoiceId } = useParams();
  const router = useRouter();
  const { auth } = useAuth();

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [offerAmount, setOfferAmount] = useState(0);
  const [interestRate, setInterestRate] = useState([8]);
  const [submitting, setSubmitting] = useState(false);

  console.log(interestRate);

  const fetchInvoice = async (invoiceId) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/invoices/${invoiceId}`,
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setInvoice(data);
      // Set default offer amount to 90% of invoice value
      setOfferAmount(Math.round(data.amount * 0.9));
    } catch (error) {
      console.error("Failed to fetch invoice:", error);
      setError("Failed to fetch invoice details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (invoiceId && auth.token) {
      fetchInvoice(invoiceId);
    }
  }, [invoiceId, auth.token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (offerAmount <= 0 || offerAmount > invoice.amount) {
      alert("Offer amount must be between ₹1 and the full invoice amount.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/offers/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.token}`,
          },
          body: JSON.stringify({
            invoiceId: invoice.id,
            amountRequested: offerAmount,
            interestRate: interestRate[0],
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to submit offer");
      }

      alert(
        `Your offer of ${formatCurrency(offerAmount)} at ${
          interestRate[0]
        }% APR has been submitted to the seller.`
      );

      // Navigate back to dashboard
      router.push("/financier");
    } catch (error) {
      console.error("Error submitting offer:", error);
      alert("Failed to submit offer. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={["financier"]}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Loading...</h1>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !invoice) {
    return (
      <ProtectedRoute allowedRoles={["financier"]}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Invoice Not Found</h1>
            <Button onClick={() => router.push("/financier")}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const daysToMaturity = Math.floor(
    (new Date(invoice.dueDate).getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24)
  );
  const expectedReturn =
    offerAmount * (interestRate[0] / 100) * (daysToMaturity / 365);
  const totalReturn = offerAmount + expectedReturn;

  return (
    <ProtectedRoute allowedRoles={["financier"]}>
      <div className="min-h-screen bg-gray-50">
        <div className="p-6 max-w-6xl mx-auto">
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="mb-4"
            >
              ← Back
            </Button>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              Make Financing Offer
            </h1>
            <p className="text-slate-600">
              Submit your terms for invoice {invoice.invoiceNumber}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Invoice Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Invoice Summary</CardTitle>
                <CardDescription>
                  Details of the invoice you're making an offer on
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Invoice Number
                    </label>
                    <p className="text-lg font-semibold">
                      {invoice.invoiceNumber}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Full Amount
                    </label>
                    <p className="text-lg font-semibold">
                      {formatCurrency(invoice.amount)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Buyer
                    </label>
                    <p className="text-lg">{invoice.buyerName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Due Date
                    </label>
                    <p className="text-lg">{formatDate(invoice.dueDate)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Days to Maturity
                    </label>
                    <p className="text-lg font-semibold">
                      {daysToMaturity} days
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Existing Offers
                    </label>
                    <p className="text-lg">{invoice.offers?.length || 0}</p>
                  </div>
                </div>

                {invoice.offers && invoice.offers.length > 0 && (
                  <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                    <p className="text-sm font-medium text-yellow-800 mb-1">
                      Competing Offers:
                    </p>
                    {invoice.offers.map((offer, idx) => (
                      <p key={idx} className="text-sm text-yellow-700">
                        {formatCurrency(offer.amountRequested || offer.amount)}{" "}
                        at {offer.interestRate}% APR
                      </p>
                    ))}
                  </div>
                )}

                {invoice.description && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Description
                    </label>
                    <p className="text-sm text-gray-700">
                      {invoice.description}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Offer Form */}
            <Card>
              <CardHeader>
                <CardTitle>Your Offer</CardTitle>
                <CardDescription>Set your financing terms</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="offerAmount" className="mb-2 block">
                      Offer Amount (INR)
                    </Label>
                    <Input
                      id="offerAmount"
                      type="number"
                      value={offerAmount}
                      onChange={(e) => setOfferAmount(parseInt(e.target.value))}
                      max={invoice.amount}
                      min={1}
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Maximum: {formatCurrency(invoice.amount)}
                    </p>
                  </div>

                  <div>
                    <Label className="mb-2 block">
                      Interest Rate: {interestRate[0]}% APR
                    </Label>
                    <div className="mt-2">
                      <Slider
                        value={interestRate}
                        onValueChange={setInterestRate}
                        max={25}
                        min={3}
                        step={0.5}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>3%</span>
                        <span>25%</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                    <h3 className="font-semibold text-blue-900">
                      Offer Summary
                    </h3>
                    <div className="text-sm text-blue-700 space-y-1">
                      <div className="flex justify-between">
                        <span>Your Investment:</span>
                        <span className="font-semibold">
                          {formatCurrency(offerAmount)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Expected Interest:</span>
                        <span className="font-semibold">
                          {formatCurrency(expectedReturn)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Return:</span>
                        <span className="font-semibold">
                          {formatCurrency(totalReturn)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Return on Investment:</span>
                        <span className="font-semibold">
                          {((expectedReturn / offerAmount) * 100).toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">
                      Terms & Conditions
                    </h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Funding will be released upon offer acceptance</li>
                      <li>
                        • Interest calculated from funding date to payment date
                      </li>
                      <li>
                        • Payment collected directly from buyer at maturity
                      </li>
                      <li>• Standard recourse terms apply</li>
                    </ul>
                  </div>

                  <div className="flex gap-4">
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={submitting}
                    >
                      {submitting ? "Submitting..." : "Submit Offer"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.back()}
                      className="flex-1"
                      disabled={submitting}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default MakeOffer;
