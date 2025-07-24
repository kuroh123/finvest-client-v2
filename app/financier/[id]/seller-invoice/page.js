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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils";

const InvoiceDetails = () => {
  const { id } = useParams();
  const router = useRouter();
  const { auth } = useAuth();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
    } catch (error) {
      console.error("Failed to fetch invoice:", error);
      setError("Failed to fetch invoice details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // ProtectedRoute will handle auth check, just fetch data when ready
    if (auth.token && id) {
      fetchInvoice(id);
    }
  }, [id, auth.token]);

  const handleAcceptOffer = async (offerId) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/offers/accept/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.token}`,
          },
          body: JSON.stringify({ offerId }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to accept offer");
      }

      // Refresh invoice data
      fetchInvoice(id);
    } catch (error) {
      console.error("Error accepting offer:", error);
    }
  };

  const handleRejectOffer = async (offerId) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/offers/${offerId}/reject`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to reject offer");
      }

      // Refresh invoice data
      fetchInvoice(id);
    } catch (error) {
      console.error("Error rejecting offer:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Loading...</h1>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Invoice Not Found</h1>
          <Button onClick={() => router.push("/seller")}>
            Go Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  //   const acceptedOffer = invoice.offers?.find(
  //     (offer) => offer.id === invoice.acceptedOfferId
  //   );
  const acceptedOffers = invoice.offers?.filter(
    (offer) => offer.status === "approved"
  );
  const pendingOffers =
    invoice.offers?.filter((offer) => offer.status === "pending") || [];
  const rejectedOffers =
    invoice.offers?.filter((offer) => offer.status === "rejected") || [];

  return (
    <ProtectedRoute allowedRoles={["financier"]}>
      <div className="min-h-screen bg-gray-50">
        <div className="p-6 max-w-4xl mx-auto">
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => router.push("/financier")}
              className="mb-4"
            >
              ← Back to Dashboard
            </Button>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 mb-2">
                  Invoice {invoice.invoiceNumber}
                </h1>
                <p className="text-slate-600">
                  Detailed view and offer management
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge
                  className={`${getStatusColor(
                    invoice.status
                  )} text-lg px-4 py-2`}
                >
                  {invoice.status}
                </Badge>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Invoice Details */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Invoice Information</CardTitle>
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
                        Amount
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
                        Upload Date
                      </label>
                      <p className="text-lg">
                        {formatDate(invoice.createdAt || invoice.uploadDate)}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Days to Maturity
                      </label>
                      <p className="text-lg">
                        {Math.floor(
                          (new Date(invoice.dueDate).getTime() -
                            new Date().getTime()) /
                            (1000 * 60 * 60 * 24)
                        )}{" "}
                        days
                      </p>
                    </div>
                  </div>
                  {invoice.description && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Description
                      </label>
                      <p className="text-lg">{invoice.description}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Accepted Offer */}
              {acceptedOffers.length > 0 && (
                <Card className="border-green-200 bg-green-50">
                  <CardHeader>
                    <CardTitle className="text-green-800">
                      Accepted Offer
                    </CardTitle>
                    <CardDescription>
                      This invoice has been funded
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {acceptedOffers.map((acceptedOffer) => (
                      <div
                        key={acceptedOffer.id}
                        className="grid grid-cols-2 gap-4 border-y py-4"
                      >
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            Financier
                          </label>
                          <p className="text-lg font-semibold">
                            {acceptedOffer.financier?.name ||
                              acceptedOffer.financierName}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            Funding Amount
                          </label>
                          <p className="text-lg font-semibold">
                            {formatCurrency(acceptedOffer.amountRequested)}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            Interest Rate
                          </label>
                          <p className="text-lg">
                            {acceptedOffer.interestRate}% APR
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            Funding Date
                          </label>
                          <p className="text-lg">
                            {formatDate(
                              acceptedOffer.createdAt ||
                                acceptedOffer.proposedDate
                            )}
                          </p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Pending Offers */}
              {pendingOffers.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>
                      Pending Offers ({pendingOffers.length})
                    </CardTitle>
                    <CardDescription>
                      Offers awaiting your response
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {pendingOffers.map((offer) => (
                        <div
                          key={offer.id}
                          className="p-4 border rounded-lg bg-white"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-semibold text-lg">
                                {offer.financier?.name || offer.financierName}
                              </h4>
                              <p className="text-sm text-gray-500">
                                Proposed on{" "}
                                {formatDate(
                                  offer.createdAt || offer.proposedDate
                                )}
                              </p>
                            </div>
                            <Badge
                              variant="outline"
                              className="bg-yellow-50 text-yellow-700"
                            >
                              {offer.interestRate}% APR
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <label className="text-sm font-medium text-gray-500">
                                Funding Amount
                              </label>
                              <p className="text-xl font-bold text-green-600">
                                {formatCurrency(
                                  offer.amount || offer.amountRequested
                                )}
                              </p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-500">
                                You'll Receive
                              </label>
                              <p className="text-lg font-semibold">
                                {formatCurrency(
                                  offer.amount || offer.amountRequested
                                )}{" "}
                                immediately
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className="border-blue-200">
                <CardHeader>
                  <CardTitle>Submit Your Offer</CardTitle>
                  <CardDescription>
                    Propose financing terms for this invoice
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    className="w-full"
                    onClick={() => router.push(`make-offer`)}
                  >
                    Make Financing Offer
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Total Offers</span>
                    <span className="font-semibold">
                      {invoice.offers?.length || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Pending</span>
                    <span className="font-semibold">
                      {pendingOffers.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Accepted</span>
                    <span className="font-semibold">
                      {acceptedOffers.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Rejected</span>
                    <span className="font-semibold">
                      {rejectedOffers.length}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Funding %</span>
                    <span className="font-semibold">
                      {acceptedOffers.length > 0
                        ? `${Math.round(
                            (acceptedOffers.reduce(
                              (acc, offer) => acc + offer.amountRequested,
                              0
                            ) /
                              invoice.amount) *
                              100
                          )}%`
                        : "0%"}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle>Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium">Invoice Uploaded</p>
                        <p className="text-xs text-gray-500">
                          {formatDate(invoice.createdAt || invoice.uploadDate)}
                        </p>
                      </div>
                    </div>

                    {acceptedOffers && acceptedOffers.length > 0 && (
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div>
                          <p className="text-sm font-medium">Funded</p>
                          <p className="text-xs text-gray-500">
                            {formatDate(
                              acceptedOffers[acceptedOffers.length - 1]
                                .createdAt ||
                                acceptedOffers[acceptedOffers.length - 1]
                                  .proposedDate
                            )}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          invoice.status === "Paid"
                            ? "bg-green-500"
                            : "bg-gray-300"
                        }`}
                      ></div>
                      <div>
                        <p className="text-sm font-medium">Payment Due</p>
                        <p className="text-xs text-gray-500">
                          {formatDate(invoice.dueDate)}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default InvoiceDetails;
