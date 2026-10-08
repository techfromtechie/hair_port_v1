"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "react-toastify";

import Navbar from "@/app/components/Navbar";
import FormInput from "@/app/components/forms/FormInput";
import FormSelect from "@/app/components/forms/FormSelect";
import FormTextarea from "@/app/components/forms/FormTextarea";
import { supabase } from "@/app/lib/supabase";

type Employee = {
  id: string;
  name: string;
  branchId: string;
};

type Branch = {
  id: string;
  name: string;
};

const services = [
  {
    label: "Hair Cutting",
    value: "Hair Cutting",
  },
  {
    label: "Hair Styling",
    value: "Hair Styling",
  },
  {
    label: "Face Massage",
    value: "Face Massage",
  },
  {
    label: "Hair Spa",
    value: "Hair Spa",
  },
  {
    label: "Facial",
    value: "Facial",
  },
  {
    label: "Beard Styling",
    value: "Beard Styling",
  },
  {
    label: "Hair Coloring",
    value: "Hair Coloring",
  },
];

const paymentModes = [
  {
    label: "Cash",
    value: "Cash",
  },
  {
    label: "Online",
    value: "Online",
  },
  {
    label: "Other",
    value: "Other",
  },
];

export default function EditTransactionPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);

  const [employee, setEmployee] = useState("");
  const [branch, setBranch] = useState("");
  const [service, setService] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState("");
  const [transactionDate, setTransactionDate] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // =========================
  // FETCH DATA
  // =========================

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch employees
        const { data: employeeData, error: employeeError } =
          await supabase
            .from("employees")
            .select("id, name, branch_id")
            .order("name", { ascending: true });

        if (employeeError) {
          throw employeeError;
        }

        const formattedEmployees: Employee[] =
          (employeeData || []).map((item) => ({
            id: item.id,
            name: item.name,
            branchId: item.branch_id,
          }));

        setEmployees(formattedEmployees);

        // Fetch branches
        const { data: branchData, error: branchError } =
          await supabase
            .from("branches")
            .select("id, name")
            .order("name", { ascending: true });

        if (branchError) {
          throw branchError;
        }

        setBranches(branchData || []);

        // Fetch transaction
        const { data: transactionData, error: transactionError } =
          await supabase
            .from("transactions")
            .select(`
              id,
              employee_id,
              branch_id,
              service,
              amount,
              payment_mode,
              description,
              transaction_date
            `)
            .eq("id", id)
            .single();

        if (transactionError) {
          throw transactionError;
        }

        if (!transactionData) {
          toast.error("Transaction not found");
          router.push("/transaction");
          return;
        }

        // Set existing values
        setEmployee(transactionData.employee_id || "");
        setBranch(transactionData.branch_id || "");
        setService(transactionData.service || "");

        setAmount(
          transactionData.amount !== null &&
            transactionData.amount !== undefined
            ? String(transactionData.amount)
            : ""
        );

        setPaymentMode(transactionData.payment_mode || "");
        setTransactionDate(transactionData.transaction_date || "");
        setDescription(transactionData.description || "");
      } catch (error: any) {
        console.error("Transaction fetch error:", error);

        toast.error(
          error?.message || "Failed to load transaction."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, router]);

  // =========================
  // UPDATE TRANSACTION
  // =========================

  const handleSubmit = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!employee) {
      toast.error("Please select an employee.");
      return;
    }

    if (!branch) {
      toast.error("Please select a branch.");
      return;
    }

    if (!service) {
      toast.error("Please select a service.");
      return;
    }

    if (!amount || Number(amount) <= 0) {
      toast.error("Please enter a valid amount.");
      return;
    }

    if (!paymentMode) {
      toast.error("Please select payment mode.");
      return;
    }

    if (!transactionDate) {
      toast.error("Please select transaction date.");
      return;
    }

    try {
      setSubmitting(true);

      const numericAmount = Number(amount);

      // Payment calculation
      const cash =
        paymentMode === "Cash" ? numericAmount : 0;

      const online =
        paymentMode === "Online" ? numericAmount : 0;

      const other =
        paymentMode === "Other" ? numericAmount : 0;

      const { error } = await supabase
        .from("transactions")
        .update({
          employee_id: employee,
          branch_id: branch,
          service,
          amount: numericAmount,
          payment_mode: paymentMode,
          cash,
          online,
          other,
          description: description || null,
          transaction_date: transactionDate,
        })
        .eq("id", id);

      if (error) {
        throw error;
      }

      toast.success("Transaction updated successfully!");

      setTimeout(() => {
        router.push("/transaction");
        router.refresh();
      }, 700);
    } catch (error: any) {
      console.error("Transaction update error:", error);

      toast.error(
        error?.message || "Failed to update transaction."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100">
        {/* NAVBAR */}
        <div className="relative bg-[#17191d]">
          <Navbar />
          <div className="h-24" />
        </div>

        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-[#f5b942]" />

            <p className="text-sm font-medium text-gray-500">
              Loading transaction...
            </p>
          </div>
        </div>
      </main>
    );
  }

  // =========================
  // PAGE
  // =========================

  return (
    <main className="min-h-screen bg-gray-100">
      {/* ================= NAVBAR ================= */}

      <div className="relative bg-[#17191d]">
        <Navbar />

        <div className="h-24" />
      </div>

      {/* ================= PAGE ================= */}

      <section className="px-5 py-10 md:px-8">
        <div className="mx-auto max-w-5xl">

          {/* ================= HEADING ================= */}

          <div className="mb-8">

            {/* Back Button + Heading */}

            <div className="flex items-center gap-3">

              {/* Back Button */}

              <button
                type="button"
                onClick={() => router.back()}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition hover:border-[#f5b942] hover:bg-[#fff9eb] hover:text-[#a86f00]"
                title="Go Back"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>

              {/* Heading Line */}

              <div className="h-8 w-1 rounded-full bg-[#f5b942]" />

              <h1 className="text-3xl font-bold tracking-tight text-[#17191d] md:text-4xl">
                Edit Transaction
              </h1>
            </div>

            <p className="mt-3 ml-12 text-base text-gray-500">
              Update transaction details by editing the fields below.
            </p>
          </div>

          {/* ================= FORM CARD ================= */}

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8 lg:p-10">

            <form
              onSubmit={handleSubmit}
              className="space-y-7"
            >

              {/* ================= ROW 1 ================= */}

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

                {/* Employee Name */}

                <FormSelect
                  label="Employee Name"
                  placeholder="Select Employee"
                  options={employees.map((item) => ({
                    label: item.name,
                    value: item.id,
                  }))}
                  value={employee}
                  onChange={(e) => {
                    const selectedEmployeeId =
                      e.target.value;

                    setEmployee(selectedEmployeeId);

                    // Automatically select employee branch
                    const selectedEmployee =
                      employees.find(
                        (item) =>
                          item.id === selectedEmployeeId
                      );

                    if (selectedEmployee) {
                      setBranch(
                        selectedEmployee.branchId
                      );
                    }
                  }}
                  required
                />

                {/* Branch */}

                <FormSelect
                  label="Branch"
                  placeholder="Select Branch"
                  options={branches.map((item) => ({
                    label: item.name,
                    value: item.id,
                  }))}
                  value={branch}
                  onChange={(e) =>
                    setBranch(e.target.value)
                  }
                  required
                />
              </div>

              {/* ================= ROW 2 ================= */}

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

                {/* Service */}

                <FormSelect
                  label="Service"
                  placeholder="Select Service"
                  options={services}
                  value={service}
                  onChange={(e) =>
                    setService(e.target.value)
                  }
                  required
                />

                {/* Amount */}

                <FormInput
                  label="Amount"
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) =>
                    setAmount(e.target.value)
                  }
                  min="0"
                  required
                />
              </div>

              {/* ================= ROW 3 ================= */}

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

                {/* Payment Mode */}

                <FormSelect
                  label="Payment Mode"
                  placeholder="Select Payment Mode"
                  options={paymentModes}
                  value={paymentMode}
                  onChange={(e) =>
                    setPaymentMode(e.target.value)
                  }
                  required
                />

                {/* Transaction Date */}

                <FormInput
                  label="Transaction Date"
                  type="date"
                  value={transactionDate}
                  onChange={(e) =>
                    setTransactionDate(e.target.value)
                  }
                  required
                />
              </div>

              {/* ================= ROW 4 ================= */}

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

                {/* Description */}

                <FormTextarea
                  label="Description"
                  placeholder="Enter description"
                  rows={3}
                  value={description}
                  onChange={(e) =>
                    setDescription(e.target.value)
                  }
                />
              </div>

              {/* ================= ACTIONS ================= */}

              <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:justify-end">

                {/* Cancel */}

                <button
                  type="button"
                  onClick={() => router.back()}
                  disabled={submitting}
                  className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                {/* Update */}

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#f5b942] px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-[#e0a82f] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}

                  {submitting
                    ? "Updating Transaction..."
                    : "Update Transaction"}
                </button>
              </div>

            </form>
          </div>
        </div>
      </section>
    </main>
  );
}