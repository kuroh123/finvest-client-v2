"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatDate } from "@/lib/utils";

function BrowseInvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterAmount, setFilterAmount] = useState("");
  const [sortBy, setSortBy] = useState("amount");
  const [searchTerm, setSearchTerm] = useState("");
  const [amountFilter, setAmountFilter] = useState("all");
  const { auth } = useAuth();
  const router = useRouter();

  useEffect(() => {
    fetchAvailableInvoices();
  }, []);

  const fetchAvailableInvoices = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/invoices/available`,
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

  const getDaysUntilDue = (dueDate) => {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const getDueDateBadge = (dueDate) => {
    const days = getDaysUntilDue(dueDate);
    if (days <= 7) {
      return <Badge variant="destructive">Due in {days} days</Badge>;
    } else if (days <= 30) {
      return <Badge variant="secondary">Due in {days} days</Badge>;
    } else {
      return <Badge variant="outline">Due in {days} days</Badge>;
    }
  };

  const getFilteredAndSortedInvoices = () => {
    let filtered = invoices.filter((invoice) => {
      const matchesSearch =
        searchTerm === "" ||
        invoice.invoiceNumber
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        invoice.buyerName?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesAmount =
        amountFilter === "all" ||
        (amountFilter === "small" && invoice.amount < 100000) ||
        (amountFilter === "medium" &&
          invoice.amount >= 100000 &&
          invoice.amount < 500000) ||
        (amountFilter === "large" && invoice.amount >= 500000);

      return matchesSearch && matchesAmount;
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "amount":
          return b.amount - a.amount;
        case "dueDate":
          return new Date(a.dueDate) - new Date(b.dueDate);
        case "uploadedAt":
        default:
          return new Date(b.uploadedAt) - new Date(a.uploadedAt);
      }
    });
  };

  const getInvoiceStats = () => {
    const totalInvoices = invoices.length;
    const totalValue = invoices.reduce((sum, inv) => sum + inv.amount, 0);
    const avgValue = totalInvoices > 0 ? totalValue / totalInvoices : 0;
    const dueThisWeek = invoices.filter(
      (inv) => getDaysUntilDue(inv.dueDate) <= 7
    ).length;

    return { totalInvoices, totalValue, avgValue, dueThisWeek };
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading available invoices...</div>
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

  const stats = getInvoiceStats();
  const filteredInvoices = getFilteredAndSortedInvoices();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Browse Invoices
            </h1>
            <p className="text-muted-foreground">
              Discover financing opportunities from verified sellers
            </p>
          </div>
          <Button onClick={() => router.push("/financier/my-offers")}>
            My Offers
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Available Invoices</CardDescription>
              <CardTitle className="text-3xl">{stats.totalInvoices}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Ready for financing
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Value</CardDescription>
              <CardTitle className="text-3xl">
                {formatCurrency(stats.totalValue)}
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
              <CardDescription>Average Value</CardDescription>
              <CardTitle className="text-3xl">
                {formatCurrency(stats.avgValue)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Per invoice</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Due This Week</CardDescription>
              <CardTitle className="text-3xl">{stats.dueThisWeek}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Quick turnaround</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filter & Search</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <Input
                  placeholder="Search by invoice number or buyer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Amount Range</label>
                <Select value={amountFilter} onValueChange={setAmountFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Amounts</SelectItem>
                    <SelectItem value="small">Under ₹1L</SelectItem>
                    <SelectItem value="medium">₹1L - ₹5L</SelectItem>
                    <SelectItem value="large">Above ₹5L</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Sort By</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="amount">Amount (High to Low)</SelectItem>
                    <SelectItem value="dueDate">Due Date (Earliest)</SelectItem>
                    <SelectItem value="uploadedAt">Recently Added</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Invoices List */}
        {filteredInvoices.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">
                  No invoices found
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm === "" && amountFilter === "all"
                    ? "No invoices are currently available for financing"
                    : "No invoices match your current filters"}
                </p>
                <Button
                  onClick={() => {
                    setSearchTerm("");
                    setAmountFilter("all");
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {filteredInvoices.map((invoice) => {
              const daysUntilDue = getDaysUntilDue(invoice.dueDate);
              const hasOffers = invoice.offers && invoice.offers.length > 0;
              const offerCount = invoice.offers?.length || 0;

              return (
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
                          Buyer: {invoice.buyerName} | Seller:{" "}
                          {invoice.seller?.name || "Verified Seller"} | Uploaded{" "}
                          {formatDate(invoice.uploadedAt)}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="secondary">Available</Badge>
                        {getDueDateBadge(invoice.dueDate)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Invoice Amount
                        </p>
                        <p className="text-2xl font-bold text-blue-600">
                          {formatCurrency(invoice.amount)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Due Date
                        </p>
                        <p className="text-lg font-semibold">
                          {formatDate(invoice.dueDate)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {daysUntilDue} days remaining
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Current Offers
                        </p>
                        <p className="text-lg font-semibold">{offerCount}</p>
                        <p className="text-sm text-muted-foreground">
                          {hasOffers ? "competing offers" : "be the first!"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Est. Duration
                        </p>
                        <p className="text-lg font-semibold">
                          {daysUntilDue} days
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {daysUntilDue <= 30 ? "Short term" : "Long term"}
                        </p>
                      </div>
                    </div>

                    {invoice.buyerGSTIN && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-muted-foreground">
                          Buyer GSTIN
                        </p>
                        <p className="text-sm font-mono">
                          {invoice.buyerGSTIN}
                        </p>
                      </div>
                    )}

                    {hasOffers && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-muted-foreground">
                          Existing Offers
                        </p>
                        <div className="flex gap-2 mt-1">
                          {invoice.offers.slice(0, 3).map((offer, index) => (
                            <Badge key={index} variant="outline">
                              {formatCurrency(offer.amountRequested)} @{" "}
                              {offer.interestRate}%
                            </Badge>
                          ))}
                          {invoice.offers.length > 3 && (
                            <Badge variant="secondary">
                              +{invoice.offers.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    <Separator className="my-4" />

                    <div className="flex justify-between items-center">
                      <div className="flex gap-2">
                        <span className="text-sm text-muted-foreground">
                          Potential ROI:{" "}
                          {daysUntilDue > 0
                            ? ((12 / (daysUntilDue / 30)) * 100).toFixed(1)
                            : "0"}
                          % annual
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() =>
                            router.push(`/financier/${invoice.id}`)
                          }
                        >
                          View Details
                        </Button>
                        <Button
                          onClick={() =>
                            router.push(`/financier/${invoice.id}/make-offer`)
                          }
                        >
                          Make Offer
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function BrowseInvoices() {
  return (
    <ProtectedRoute allowedRoles={["financier"]}>
      <BrowseInvoicesPage />
    </ProtectedRoute>
  );
}
