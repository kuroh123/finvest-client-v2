"use client";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function FinancierDashboard() {
  const router = useRouter();
  const { auth } = useAuth();
  const [offers, setOffers] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterAmount, setFilterAmount] = useState("");
  const [sortBy, setSortBy] = useState("amount");

  const fetchInvoices = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/invoices/available`,
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

  const fetchMyOffers = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/offers/my`,
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
      setOffers(data);
    } catch (error) {
      console.error("Failed to fetch invoices:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (auth.token) {
      fetchMyOffers();
      fetchInvoices();
    }
  }, [auth.token]);

  const activeInvestments = offers.filter(
    (offer) => offer.status === "approved"
  );

  const totalInvested = activeInvestments.reduce((sum, offer) => {
    return sum + offer.amountRequested;
  }, 0);

  const totalEarnings = activeInvestments.reduce((sum, offer) => {
    // Calculate number of days between creation and invoice due date (or assumed duration)
    const createdAt = new Date(offer.createdAt);
    const invoice = offer.invoice; // Assuming populated invoice
    const dueDate = new Date(invoice?.dueDate);

    const durationInDays = Math.max(
      1,
      (dueDate - createdAt) / (1000 * 60 * 60 * 24)
    );

    // Assuming interestRate is annual (like 12% per annum)
    const interestEarned =
      (offer.amountRequested * offer.interestRate * durationInDays) /
      (100 * 365);

    return sum + interestEarned;
  }, 0);

  const averageReturn =
    totalInvested > 0 ? ((totalEarnings / totalInvested) * 100).toFixed(2) : 0;

  const pendingOffers = offers.filter((offer) => offer.status === "pending");
  const acceptedOffers = offers.filter((offer) => offer.status === "approved");

  return (
    <ProtectedRoute allowedRoles={["financier"]}>
      <div className="min-h-screen bg-gray-50">
        <div className="p-6 mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              Financier Dashboard
            </h1>
            <p className="text-slate-600">
              Discover investment opportunities and track your portfolio
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Invested</CardDescription>
                <CardTitle className="text-3xl">
                  {formatCurrency(totalInvested)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Across {activeInvestments.length} invoices
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Earnings</CardDescription>
                <CardTitle className="text-3xl">
                  {formatCurrency(totalEarnings)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-green-600">
                  +{averageReturn}% average return
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Active Offers</CardDescription>
                <CardTitle className="text-3xl">
                  {pendingOffers.length}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Awaiting responses
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Funded Invoices</CardDescription>
                <CardTitle className="text-3xl">
                  {acceptedOffers.length}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Currently active
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Available Invoices */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Available Invoices</CardTitle>
                      <CardDescription>
                        Investment opportunities awaiting financing
                      </CardDescription>
                    </div>
                  </div>

                  {/* Filters */}
                  <div className="flex gap-4 mt-4">
                    <Input
                      placeholder="Min amount..."
                      value={filterAmount}
                      onChange={(e) => setFilterAmount(e.target.value)}
                      className="max-w-xs"
                    />
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="max-w-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="amount">Sort by Amount</SelectItem>
                        <SelectItem value="dueDate">
                          Sort by Due Date
                        </SelectItem>
                        <SelectItem value="uploadDate">
                          Sort by Upload Date
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    {invoices.map((invoice) => (
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
                          <p className="text-xs text-gray-400">
                            Uploaded: {formatDate(invoice.uploadedAt)}
                          </p>
                        </div>

                        <div className="text-right mr-4">
                          <p className="font-semibold text-lg">
                            {formatCurrency(invoice.amount)}
                          </p>
                          {invoice.offers && invoice.offers.length > 0 && (
                            <p className="text-sm text-blue-600">
                              {invoice.offers.length} competing offer(s)
                            </p>
                          )}
                          <p className="text-xs text-gray-500">
                            {Math.floor(
                              (new Date(invoice.dueDate).getTime() -
                                new Date().getTime()) /
                                (1000 * 60 * 60 * 24)
                            )}{" "}
                            days to maturity
                          </p>
                        </div>

                        <div className="flex flex-col gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleMakeOffer(invoice.id)}
                          >
                            Make Offer
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/invoice/${invoice.id}`)}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* My Recent Offers */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>My Recent Offers</CardTitle>
                  <CardDescription>Track your submitted offers</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {offers.slice(0, 5).map((offer) => {
                      return (
                        <div key={offer.id} className="p-4 border rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium">
                              {offer.invoice?.invoiceNumber}
                            </h4>
                            <Badge className={getStatusColor(offer.status)}>
                              {offer.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">
                            {formatCurrency(offer.amountRequested)} at{" "}
                            {offer.interestRate}% APR
                          </p>
                          <p className="text-xs text-gray-500">
                            Proposed: {formatDate(offer.createdAt)}
                          </p>
                          {offer.status === "approved" && (
                            <div className="mt-2 p-2 bg-green-50 rounded text-xs text-green-700">
                              Offer accepted! Funding released.
                            </div>
                          )}
                        </div>
                      );
                    })}
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
