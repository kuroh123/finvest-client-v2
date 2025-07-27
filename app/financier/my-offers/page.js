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

function MyOffersPage() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [searchTerm, setSearchTerm] = useState("");
  const { auth } = useAuth();
  const router = useRouter();

  useEffect(() => {
    fetchMyOffers();
  }, []);

  const fetchMyOffers = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/offers/my`,
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch offers");
      }

      const data = await response.json();
      setOffers(data);
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
      rejected: { variant: "destructive", label: "Rejected" },
      expired: { variant: "outline", label: "Expired" },
    };

    const config = statusConfig[status] || {
      variant: "secondary",
      label: status,
    };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const calculateInterest = (amount, rate, days) => {
    return amount * (rate / 100) * (days / 365);
  };

  const getDaysFunded = (createdAt, dueDate) => {
    const created = new Date(createdAt);
    const due = new Date(dueDate);
    return Math.max(1, Math.floor((due - created) / (1000 * 60 * 60 * 24)));
  };

  const getFilteredAndSortedOffers = () => {
    let filtered = offers.filter((offer) => {
      const matchesStatus =
        filterStatus === "all" || offer.status === filterStatus;
      const matchesSearch =
        searchTerm === "" ||
        offer.invoice?.invoiceNumber
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        offer.invoice?.buyerName
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "amount":
          return b.amountRequested - a.amountRequested;
        case "rate":
          return b.interestRate - a.interestRate;
        case "createdAt":
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });
  };

  const getOfferStats = () => {
    const totalOffers = offers.length;
    const approvedOffers = offers.filter((o) => o.status === "approved").length;
    const pendingOffers = offers.filter((o) => o.status === "pending").length;
    const totalInvested = offers
      .filter((o) => o.status === "approved")
      .reduce((sum, o) => sum + o.amountRequested, 0);

    return { totalOffers, approvedOffers, pendingOffers, totalInvested };
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading your offers...</div>
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

  const stats = getOfferStats();
  const filteredOffers = getFilteredAndSortedOffers();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Offers</h1>
            <p className="text-muted-foreground">
              Track and manage all your financing offers
            </p>
          </div>
          <Button onClick={() => router.push("/financier")}>
            Browse Invoices
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Offers</CardDescription>
              <CardTitle className="text-3xl">{stats.totalOffers}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {stats.approvedOffers} approved
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Pending Offers</CardDescription>
              <CardTitle className="text-3xl">{stats.pendingOffers}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Awaiting seller response
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Invested</CardDescription>
              <CardTitle className="text-3xl">
                {formatCurrency(stats.totalInvested)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                In approved offers
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Success Rate</CardDescription>
              <CardTitle className="text-3xl">
                {stats.totalOffers > 0
                  ? Math.round((stats.approvedOffers / stats.totalOffers) * 100)
                  : 0}
                %
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Approval rate</p>
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
                <label className="text-sm font-medium">Status Filter</label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
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
                    <SelectItem value="createdAt">Date Created</SelectItem>
                    <SelectItem value="amount">Amount</SelectItem>
                    <SelectItem value="rate">Interest Rate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Offers List */}
        {filteredOffers.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">No offers found</h3>
                <p className="text-muted-foreground mb-4">
                  {filterStatus === "all" && searchTerm === ""
                    ? "You haven't made any offers yet"
                    : "No offers match your current filters"}
                </p>
                <Button onClick={() => router.push("/financier")}>
                  Browse Available Invoices
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {filteredOffers.map((offer) => {
              const daysFunded = offer.invoice?.dueDate
                ? getDaysFunded(offer.createdAt, offer.invoice.dueDate)
                : 30; // default
              const potentialInterest = calculateInterest(
                offer.amountRequested,
                offer.interestRate,
                daysFunded
              );

              return (
                <Card
                  key={offer.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">
                          Invoice #{offer.invoice?.invoiceNumber || "N/A"}
                        </CardTitle>
                        <CardDescription>
                          Buyer: {offer.invoice?.buyerName || "N/A"} | Offered
                          on {formatDate(offer.createdAt)}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        {getStatusBadge(offer.status)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Amount Offered
                        </p>
                        <p className="text-lg font-semibold">
                          {formatCurrency(offer.amountRequested)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Interest Rate
                        </p>
                        <p className="text-lg font-semibold">
                          {offer.interestRate}% p.a.
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Invoice Value
                        </p>
                        <p className="text-lg font-semibold">
                          {formatCurrency(offer.invoice?.amount || 0)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Due Date
                        </p>
                        <p className="text-lg font-semibold">
                          {offer.invoice?.dueDate
                            ? formatDate(offer.invoice.dueDate)
                            : "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Potential Interest
                        </p>
                        <p className="text-lg font-semibold text-green-600">
                          {formatCurrency(potentialInterest)}
                        </p>
                      </div>
                    </div>

                    {offer.terms && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-muted-foreground">
                          Terms
                        </p>
                        <p className="text-sm">{offer.terms}</p>
                      </div>
                    )}

                    <Separator className="my-4" />

                    <div className="flex justify-between items-center">
                      <div className="flex gap-2">
                        <span className="text-sm text-muted-foreground">
                          Duration: ~{daysFunded} days
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() =>
                            router.push(
                              `/financier/${
                                offer.invoice?.id || offer.invoiceId
                              }`
                            )
                          }
                        >
                          View Invoice
                        </Button>
                        {offer.status === "approved" && (
                          <Button
                            onClick={() =>
                              router.push(
                                `/financier/settlement/${
                                  offer.invoice?.id || offer.invoiceId
                                }`
                              )
                            }
                          >
                            View Settlement
                          </Button>
                        )}
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

export default function MyOffers() {
  return (
    <ProtectedRoute allowedRoles={["financier"]}>
      <MyOffersPage />
    </ProtectedRoute>
  );
}
