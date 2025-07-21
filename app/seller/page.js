"use client";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
import { Progress } from "@/components/ui/progress";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils";

export default function SellerDashboard() {
  const { auth } = useAuth();
  const router = useRouter();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSellerInvoices = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/invoices/seller`,
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
      setInvoices(data);
    } catch (error) {
      console.error("Failed to fetch invoices:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (auth.token) {
      fetchSellerInvoices();
    }
  }, [auth.token]);

  const totalInvoices = invoices.length;
  const fundedInvoices = invoices.filter(
    (inv) => inv.status === "Funded" || inv.status === "Paid"
  ).length;
  const totalAmount = invoices.reduce((sum, inv) => sum + inv.amount, 0);
  const fundedAmount = invoices
    .filter((inv) => inv.status === "funded" || inv.status === "paid")
    .reduce((sum, inv) => sum + inv.amount, 0);

  const pendingInvoices = invoices.filter((inv) => inv.status === "pending");
  const recentOffers = invoices
    .flatMap((inv) => inv.offers || [])
    .filter((offer) => offer.status === "pending")
    .slice(0, 3);

  console.log(totalInvoices, fundedInvoices, totalAmount, fundedAmount);

  return (
    <ProtectedRoute allowedRoles={["seller"]}>
      <div className="min-h-screen bg-gray-50">
        <div className="p-6 mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              Seller Dashboard
            </h1>
            <p className="text-slate-600">
              Manage your invoices and track financing
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Invoices</CardDescription>
                <CardTitle className="text-3xl">{totalInvoices}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {fundedInvoices} funded (
                  {Math.round((fundedInvoices / totalInvoices) * 100)}%)
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Value</CardDescription>
                <CardTitle className="text-3xl">
                  {formatCurrency(totalAmount)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Across all invoices
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Funded Amount</CardDescription>
                <CardTitle className="text-3xl">
                  {formatCurrency(fundedAmount)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Progress
                  value={(fundedAmount / totalAmount) * 100}
                  className="h-2"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  {Math.round((fundedAmount / totalAmount) * 100)}% of total
                  value
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Pending Offers</CardDescription>
                <CardTitle className="text-3xl">
                  {recentOffers.length}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Awaiting your review
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Invoices */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Recent Invoices</CardTitle>
                    <CardDescription>
                      Your latest uploaded invoices
                    </CardDescription>
                  </div>
                  <Button onClick={() => router.push("/seller/upload-invoice")}>
                    Upload Invoice
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {invoices.slice(0, 5).map((invoice) => (
                      <div
                        key={invoice.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold">
                              {invoice.invoiceNumber}
                            </h3>
                            <Badge className={getStatusColor(invoice.status)}>
                              {invoice.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">
                            {invoice.buyerName}
                          </p>
                          <p className="text-sm text-gray-500">
                            Due: {formatDate(invoice.dueDate)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">
                            {formatCurrency(invoice.amount)}
                          </p>
                          {invoice.offers && invoice.offers.length > 0 && (
                            <p className="text-sm text-blue-600">
                              {invoice.offers.length} offer(s)
                            </p>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="ml-4"
                          onClick={() => router.push(`/seller/${invoice.id}`)}
                        >
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Offers */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Pending Offers</CardTitle>
                  <CardDescription>
                    Offers waiting for your response
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentOffers.length > 0 ? (
                      recentOffers.map((offer) => (
                        <div key={offer.id} className="p-4 border rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium">
                              {offer.financier?.name}
                            </h4>
                            <Badge variant="outline">
                              {offer.interestRate}% APR
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {formatCurrency(offer.amountRequested)} funding
                            offer
                          </p>
                          <p className="text-xs text-gray-500 mb-3">
                            Proposed: {formatDate(offer.createdAt)}
                          </p>
                          <div className="flex gap-2">
                            <Button size="sm" className="flex-1">
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1"
                            >
                              Decline
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-8">
                        No pending offers
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
