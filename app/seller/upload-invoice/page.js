"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { Textarea } from "@/components/ui/textarea";

const UploadInvoice = () => {
  const router = useRouter();
  const { auth } = useAuth();
  const [formData, setFormData] = useState({
    invoiceNumber: "",
    buyerName: "",
    amount: "",
    dueDate: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/invoices`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.token}`,
          },
          body: JSON.stringify({
            invoiceNumber: formData.invoiceNumber,
            buyerName: formData.buyerName,
            amount: parseFloat(formData.amount),
            dueDate: formData.dueDate,
            description: formData.description,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to upload invoice");
      }

      // Reset form
      setFormData({
        invoiceNumber: "",
        buyerName: "",
        amount: "",
        dueDate: "",
        description: "",
      });

      // Navigate back to dashboard
      router.push("/seller");
    } catch (error) {
      console.error("Error uploading invoice:", error);
      setError("Failed to upload invoice. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <ProtectedRoute allowedRoles={["seller"]}>
      <div className="min-h-screen bg-gray-50">
        <div className="p-6 max-w-2xl mx-auto">
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => router.push("/seller")}
              className="mb-4"
            >
              ← Back to Dashboard
            </Button>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              Upload New Invoice
            </h1>
            <p className="text-slate-600">
              Add a new invoice to request financing
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Invoice Details</CardTitle>
              <CardDescription>
                Fill in the information about your invoice to make it available
                for financing
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="invoiceNumber" className="mb-2 block">
                      Invoice Number *
                    </Label>
                    <Input
                      id="invoiceNumber"
                      name="invoiceNumber"
                      value={formData.invoiceNumber}
                      onChange={handleChange}
                      placeholder="INV-2024-001"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="amount" className="mb-2 block">
                      Invoice Amount (INR) *
                    </Label>
                    <Input
                      id="amount"
                      name="amount"
                      type="number"
                      value={formData.amount}
                      onChange={handleChange}
                      placeholder="25000"
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="buyerName" className="mb-2 block">
                    Buyer Company Name *
                  </Label>
                  <Input
                    id="buyerName"
                    name="buyerName"
                    value={formData.buyerName}
                    onChange={handleChange}
                    placeholder="TechCorp Industries"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="dueDate" className="mb-2 block">
                    Payment Due Date *
                  </Label>
                  <Input
                    id="dueDate"
                    name="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description" className="mb-2 block">
                    Description (Optional)
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Additional notes about this invoice..."
                    rows={3}
                  />
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">
                    What happens next?
                  </h3>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>
                      • Your invoice will be reviewed and made available to
                      financiers
                    </li>
                    <li>
                      • Financiers will submit offers with their proposed terms
                    </li>
                    <li>
                      • You can review and accept the best offer for your needs
                    </li>
                    <li>
                      • Once accepted, funding is typically released within 24
                      hours
                    </li>
                  </ul>
                </div>

                <div className="flex gap-4">
                  <Button type="submit" className="flex-1" disabled={loading}>
                    {loading ? "Uploading..." : "Upload Invoice"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/seller")}
                    className="flex-1"
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default UploadInvoice;
