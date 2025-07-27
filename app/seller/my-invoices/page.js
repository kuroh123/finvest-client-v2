"use client";

import { useState, useEffect } from "react";
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
import { formatCurrency } from "@/lib/utils";
import { useRouter } from "next/navigation";

function MyInvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { auth } = useAuth();
  const router = useRouter();

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/invoices/seller`,
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch invoices");
      }

      const data = await response.json();
      setInvoices(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { variant: "secondary", label: "Pending" },
      approved: { variant: "default", label: "Approved" },
      funded: { variant: "default", label: "Funded" },
      paid: { variant: "default", label: "Paid" },
      overdue: { variant: "destructive", label: "Overdue" },
    };

    const config = statusConfig[status] || {
      variant: "secondary",
      label: status,
    };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getFinancingStatus = (invoice) => {
    if (invoice.isFinanced) {
      return <Badge variant="default">Financed</Badge>;
    }
    const approvedOffers =
      invoice.offers?.filter((offer) => offer.status === "approved").length ||
      0;
    const pendingOffers =
      invoice.offers?.filter((offer) => offer.status === "pending").length || 0;

    if (approvedOffers > 0) {
      return (
        <Badge variant="default">{approvedOffers} Approved Offer(s)</Badge>
      );
    }
    if (pendingOffers > 0) {
      return (
        <Badge variant="secondary">{pendingOffers} Pending Offer(s)</Badge>
      );
    }
    return <Badge variant="outline">No Offers</Badge>;
  };

  const getTotalPayments = (payments) => {
    return payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading invoices...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Invoices</h1>
          <p className="text-muted-foreground">
            Manage and track all your uploaded invoices
          </p>
        </div>
        <Button onClick={() => router.push("/seller/upload-invoice")}>
          Upload New Invoice
        </Button>
      </div>

      {invoices.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">No invoices yet</h3>
              <p className="text-muted-foreground mb-4">
                Upload your first invoice to get started with financing
              </p>
              <Button onClick={() => router.push("/seller/upload-invoice")}>
                Upload Invoice
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {invoices.map((invoice) => (
            <Card
              key={invoice.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">
                      Invoice #{invoice.invoiceNumber}
                    </CardTitle>
                    <CardDescription>
                      Buyer: {invoice.buyerName} | Due:{" "}
                      {new Date(invoice.dueDate).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {getStatusBadge(invoice.status)}
                    {getFinancingStatus(invoice)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Invoice Amount
                    </p>
                    <p className="text-lg font-semibold">
                      {formatCurrency(invoice.amount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Offers Received
                    </p>
                    <p className="text-lg font-semibold">
                      {invoice.offers?.length || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Payments Received
                    </p>
                    <p className="text-lg font-semibold">
                      {formatCurrency(getTotalPayments(invoice.payments))}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Uploaded
                    </p>
                    <p className="text-lg font-semibold">
                      {new Date(invoice.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {invoice.buyerGSTIN && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-muted-foreground">
                      Buyer GSTIN
                    </p>
                    <p className="text-sm">{invoice.buyerGSTIN}</p>
                  </div>
                )}

                {invoice.buyerEmail && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-muted-foreground">
                      Buyer Email
                    </p>
                    <p className="text-sm">{invoice.buyerEmail}</p>
                  </div>
                )}

                <div className="flex justify-between items-center pt-4 border-t">
                  <div className="flex gap-2">
                    {invoice.offers && invoice.offers.length > 0 && (
                      <span className="text-sm text-muted-foreground">
                        Latest offer:{" "}
                        {formatCurrency(
                          Math.max(
                            ...invoice.offers.map((o) => o.amountRequested || 0)
                          )
                        )}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => router.push(`/seller/${invoice.id}`)}
                    >
                      View Details
                    </Button>
                    {getTotalPayments(invoice.payments) > 0 && (
                      <Button
                        onClick={() =>
                          router.push(`/seller/settlement/${invoice.id}`)
                        }
                      >
                        View Settlement
                      </Button>
                    )}
                    {getTotalPayments(invoice.payments) === 0 && (
                      <Button
                        variant="outline"
                        onClick={() =>
                          router.push(`/seller/${invoice.id}/record-payment`)
                        }
                      >
                        Record Payment
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default function MyInvoices() {
  return (
    <ProtectedRoute allowedRoles={["seller"]}>
      <MyInvoicesPage />
    </ProtectedRoute>
  );
}
