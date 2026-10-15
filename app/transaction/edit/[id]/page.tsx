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

type UserRole = "admin" | "branch_manager";

type Employee = {
  id: string;
  name: string;
  branchId: string;
};

type Branch = {
  id: string;
  name: string;
};

type PaymentMode = "Cash" | "Online" | "Other";

const services = [
  { label: "Hair Cutting", value: "Hair Cutting" },
  { label: "Hair Styling", value: "Hair Styling" },
  { label: "Face Massage", value: "Face Massage" },
  { label: "Hair Spa", value: "Hair Spa" },
  { label: "Facial", value: "Facial" },
  { label: "Beard Styling", value: "Beard Styling" },
  { label: "Hair Coloring", value: "Hair Coloring" },
];

const paymentModes = [
  { label: "Cash", value: "Cash" },
  { label: "Online", value: "Online" },
  { label: "Other", value: "Other" },
];

export default function EditTransactionPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [managerBranchId, setManagerBranchId] = useState("");

  const [employee, setEmployee] = useState("");
  const [branch, setBranch] = useState("");
  const [service, setService] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState<PaymentMode | "">("");
  const [transactionDate, setTransactionDate] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    const fetchData = async () => {
      try {
        setLoading(true);

        // Identify the currently signed-in user's role.
        const { data: roleData, error: roleError } = await supabase.rpc("get_my_role");
        if (roleError) throw roleError;

        const profile = Array.isArray(roleData) ? roleData[0] : roleData;
        if (!profile || !["admin", "branch_manager"].includes(profile.role)) {
          throw new Error("Your account role could not be verified. Please sign in again.");
        }

        const role = profile.role as UserRole;
        let branchId = "";

        // For a branch manager, determine their assigned branch from their linked employee record.
        if (role === "branch_manager") {
          if (!profile.employee_id) {
            throw new Error("This manager account is not linked to an employee.");
          }

          const { data: managerEmployee, error: managerError } = await supabase
            .from("employees")
            .select("id, branch_id")
            .eq("id", profile.employee_id)
            .single();

          if (managerError) throw managerError;
          if (!managerEmployee?.branch_id) {
            throw new Error("The branch assigned to this manager could not be found.");
          }
          branchId = managerEmployee.branch_id;
        }

        // Load only the employees belonging to the manager's branch. Admins see all employees.
        let employeeQuery = supabase
          .from("employees")
          .select("id, name, branch_id")
          .order("name", { ascending: true });
        if (role === "branch_manager") {
          employeeQuery = employeeQuery.eq("branch_id", branchId);
        }
        const { data: employeeData, error: employeeError } = await employeeQuery;
        if (employeeError) throw employeeError;

        const formattedEmployees: Employee[] = (employeeData ?? []).map((item) => ({
          id: item.id,
          name: item.name,
          branchId: item.branch_id,
        }));

        // Load only the manager's own branch. Admins see all branches.
        let branchQuery = supabase
          .from("branches")
          .select("id, name")
          .order("name", { ascending: true });
        if (role === "branch_manager") {
          branchQuery = branchQuery.eq("id", branchId);
        }
        const { data: branchData, error: branchError } = await branchQuery;
        if (branchError) throw branchError;

        // A branch manager can only load a transaction belonging to their branch.
        let transactionQuery = supabase
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
          .eq("id", id);
        if (role === "branch_manager") {
          transactionQuery = transactionQuery.eq("branch_id", branchId);
        }
        const { data: transactionData, error: transactionError } = await transactionQuery.single();
        if (transactionError) throw transactionError;
        if (!transactionData) {
          toast.error("Transaction not found or you do not have access to it.");
          router.replace("/transaction");
          return;
        }

        // Do not allow the form to load a transaction employee outside the available employee list.
        const transactionEmployee = formattedEmployees.find(
          (item) => item.id === transactionData.employee_id
        );
        if (role === "branch_manager" && !transactionEmployee) {
          throw new Error("This transaction does not belong to your branch.");
        }

        if (cancelled) return;
        setUserRole(role);
        setManagerBranchId(branchId);
        setEmployees(formattedEmployees);
        setBranches((branchData ?? []) as Branch[]);
        setEmployee(transactionData.employee_id ?? "");
        setBranch(role === "branch_manager" ? branchId : transactionData.branch_id ?? "");
        setService(transactionData.service ?? "");
        setAmount(transactionData.amount != null ? String(transactionData.amount) : "");
        setPaymentMode((transactionData.payment_mode ?? "") as PaymentMode | "");
        setTransactionDate(transactionData.transaction_date ?? "");
        setDescription(transactionData.description ?? "");
      } catch (error: unknown) {
        console.error("Transaction fetch error:", error);
        const message = error instanceof Error ? error.message : "Failed to load transaction.";
        toast.error(message);
        if (!cancelled) router.replace("/transaction");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void fetchData();
    return () => {
      cancelled = true;
    };
  }, [id, router]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
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
    if (!amount || !Number.isFinite(Number(amount)) || Number(amount) <= 0) {
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

    const selectedEmployee = employees.find((item) => item.id === employee);
    if (!selectedEmployee) {
      toast.error("Please select a valid employee.");
      return;
    }

    if (
      userRole === "branch_manager" &&
      (selectedEmployee.branchId !== managerBranchId || branch !== managerBranchId)
    ) {
      toast.error("You can only update transactions for your own branch.");
      return;
    }

    const branchToSave = userRole === "branch_manager" ? managerBranchId : branch;
    if (selectedEmployee.branchId !== branchToSave) {
      toast.error("The selected employee and branch do not match.");
      return;
    }

    try {
      setSubmitting(true);
      const numericAmount = Number(amount);
      const cash = paymentMode === "Cash" ? numericAmount : 0;
      const online = paymentMode === "Online" ? numericAmount : 0;
      const other = paymentMode === "Other" ? numericAmount : 0;

      let updateQuery = supabase.from("transactions").update({
        employee_id: employee,
        branch_id: branchToSave,
        service,
        amount: numericAmount,
        payment_mode: paymentMode,
        cash,
        online,
        other,
        description: description || null,
        transaction_date: transactionDate,
      }).eq("id", id);

      if (userRole === "branch_manager") {
        updateQuery = updateQuery.eq("branch_id", managerBranchId);
      }

      const { error } = await updateQuery;
      if (error) throw error;

      toast.success("Transaction updated successfully!");
      setTimeout(() => {
        router.push("/transaction");
        router.refresh();
      }, 700);
    } catch (error: unknown) {
      console.error("Transaction update error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update transaction.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100">
        <div className="relative bg-[#17191d]">
          <Navbar />
          <div className="h-24" />
        </div>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-[#f5b942]" />
            <p className="text-sm font-medium text-gray-500">Loading transaction...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="relative bg-[#17191d]">
        <Navbar />
        <div className="h-24" />
      </div>

      <section className="px-5 py-10 md:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition hover:border-[#f5b942] hover:bg-[#fff9eb] hover:text-[#a86f00]"
                title="Go Back"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div className="h-8 w-1 rounded-full bg-[#f5b942]" />
              <h1 className="text-3xl font-bold tracking-tight text-[#17191d] md:text-4xl">
                Edit Transaction
              </h1>
            </div>
            <p className="mt-3 ml-12 text-base text-gray-500">
              Update transaction details by editing the fields below.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8 lg:p-10">
            <form onSubmit={handleSubmit} className="space-y-7">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormSelect
                  label="Employee Name"
                  placeholder="Select Employee"
                  options={employees.map((item) => ({ label: item.name, value: item.id }))}
                  value={employee}
                  onChange={(e) => {
                    const selectedEmployeeId = e.target.value;
                    setEmployee(selectedEmployeeId);
                    const selected = employees.find((item) => item.id === selectedEmployeeId);
                    if (selected) {
                      setBranch(userRole === "branch_manager" ? managerBranchId : selected.branchId);
                    }
                  }}
                  required
                />

                <FormSelect
                  label="Branch"
                  placeholder="Select Branch"
                  options={branches.map((item) => ({ label: item.name, value: item.id }))}
                  value={branch}
                  onChange={(e) => {
                    if (userRole !== "branch_manager") setBranch(e.target.value);
                  }}
                  disabled={userRole === "branch_manager"}
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormSelect
                  label="Service"
                  placeholder="Select Service"
                  options={services}
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  required
                />
                <FormInput
                  label="Amount"
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="0"
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormSelect
                  label="Payment Mode"
                  placeholder="Select Payment Mode"
                  options={paymentModes}
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value as PaymentMode)}
                  required
                />
                <FormInput
                  label="Transaction Date"
                  type="date"
                  value={transactionDate}
                  onChange={(e) => setTransactionDate(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormTextarea
                  label="Description"
                  placeholder="Enter description"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => router.back()}
                  disabled={submitting}
                  className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#f5b942] px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-[#e0a82f] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {submitting ? "Updating Transaction..." : "Update Transaction"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
