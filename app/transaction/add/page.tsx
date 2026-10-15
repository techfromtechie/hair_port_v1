"use client";

import { useEffect, useState } from "react";
import FormInput from "../../components/forms/FormInput";
import FormSelect from "../../components/forms/FormSelect";
import FormTextarea from "../../components/forms/FormTextarea";
import FormActions from "../../components/forms/FormActions";
import Navbar from "@/app/components/Navbar";
import { supabase } from "@/app/lib/supabase";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Loader from "@/app/components/Loader";

type Employee = {
  id: string;
  name: string;
  branchId: string;
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
  }
];

export default function AddTransactionPage() {
  const router = useRouter();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employee, setEmployee] = useState("");
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // =========================
  // FETCH EMPLOYEES
  // =========================

  
useEffect(() => {
  let active = true;

  const fetchEmployees = async () => {
    try {
      setLoadingEmployees(true);

      // Step 1: Get the logged-in user's role
      const { data: roles, error: roleError } =
        await supabase.rpc("get_my_role");

      if (roleError) throw roleError;

      const profile = roles?.[0];

      if (!profile) {
        throw new Error("User role not found.");
      }

      // Step 2: Start the employee query
      let query = supabase
        .from("employees")
        .select("id, name, branch_id")
        .order("name", { ascending: true });

      // Step 3: Branch Manager can see only their branch
      if (profile.role === "branch_manager") {
        if (!profile.employee_id) {
          throw new Error("Manager employee record not found.");
        }

        const { data: manager, error: managerError } =
          await supabase
            .from("employees")
            .select("branch_id")
            .eq("id", profile.employee_id)
            .single();

        if (managerError) throw managerError;

        if (!manager?.branch_id) {
          throw new Error("Manager branch not found.");
        }

        query = query.eq("branch_id", manager.branch_id);
      } else if (profile.role !== "admin") {
        throw new Error("You are not authorized to view employees.");
      }

      // Step 4: Fetch permitted employees
      const { data, error } = await query;

      if (error) throw error;

      if (!active) return;

      const formattedEmployees: Employee[] = (data || []).map(
        (item) => ({
          id: item.id,
          name: item.name,
          branchId: item.branch_id,
        })
      );

      setEmployees(formattedEmployees);
    } catch (error: unknown) {
      console.error("Employee fetch error:", error);

      if (active) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to load employees."
        );
      }
    } finally {
      if (active) setLoadingEmployees(false);
    }
  };

  fetchEmployees();

  return () => {
    active = false;
  };
}, []);


  // =========================
  // SUBMIT TRANSACTION
  // =========================

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    // IMPORTANT:
    // Save form reference before using await
    const form = e.currentTarget;

    if (!employee) {
      toast.error("Please select an employee.");
      return;
    }

    const formData = new FormData(form);

    const service =
      formData.get("service")?.toString() || "";

    const amountValue =
      formData.get("amount")?.toString() || "";

    const paymentMode =
      formData.get("paymentMode")?.toString() || "";

    const description =
      formData.get("description")?.toString() || "";

    const transactionDate =
      formData.get("transactionDate")?.toString() || "";

    const amount = Number(amountValue);

    // =========================
    // VALIDATION
    // =========================

    

    if (!amountValue || amount <= 0) {
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

    const selectedEmployee = employees.find(
      (item) => item.id === employee
    );

    if (!selectedEmployee) {
      toast.error("Selected employee not found.");
      return;
    }

    try {
      setSubmitting(true);

      // =========================
      // INSERT TRANSACTION
      // =========================

      const { error } = await supabase
        .from("transactions")
        .insert([
          {
            employee_id: selectedEmployee.id,
            branch_id: selectedEmployee.branchId,
           service: service || null,
            amount,
            payment_mode: paymentMode,
            description: description || null,
            transaction_date: transactionDate,
          },
        ]);

      if (error) {
        throw error;
      }

      // =========================
      // SUCCESS
      // =========================

     toast.success("Transaction added successfully!");

// Reset form and stay on Add Transaction page
form.reset();
setEmployee("");    } catch (error: any) {
      console.error("Transaction insert error:", error);

      toast.error(
        error?.message || "Failed to add transaction."
      );
    } finally {
      setSubmitting(false);
    }
  };

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
                Add Transaction
              </h1>

            </div>

            <p className="mt-3 ml-12 text-base text-gray-500">
              Create a new transaction by entering the details below.
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
   {/* Employee Name */}
<div className="relative">
  <FormSelect
    label="Employee Name"
    placeholder={
      loadingEmployees
        ? "Loading employees..."
        : "Select Employee"
    }
    options={employees.map((item) => ({
      label: item.name,
      value: item.id,
    }))}
    value={employee}
    onChange={(e) => setEmployee(e.target.value)}
    required
  />

  {loadingEmployees && (
    <div className="absolute right-3 top-9">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-200 border-t-[#f5b942]" />
    </div>
  )}
</div>

                {/* Service */}
                <FormSelect
                  label="Service"
                  placeholder="Select Service"
                  options={services}
                  
                  name="service"
                />

              </div>

              {/* ================= ROW 2 ================= */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

                {/* Amount */}
                <FormInput
                  label="Amount"
                  type="number"
                  placeholder="Enter amount"
                  required
                  name="amount"
                />

                {/* Payment Mode */}
                <FormSelect
                  label="Payment Mode"
                  placeholder="Select Payment Mode"
                  options={paymentModes}
                  required
                  name="paymentMode"
                />

              </div>

              {/* ================= ROW 3 ================= */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

               <FormTextarea
  label="Description"
  placeholder="Enter description"
  rows={3}
/>

                {/* Transaction Date */}
                <FormInput
                  label="Transaction Date"
                  type="date"
                  required
                  name="transactionDate"
                  defaultValue={
                    new Date().toISOString().split("T")[0]
                  }
                />

              </div>

              {/* ================= ACTIONS ================= */}
              <FormActions
                submitText={
                  submitting
                    ? "Adding Transaction..."
                    : "Add Transaction"
                }
                cancelHref="/"
              />

            </form>

          </div>

        </div>
      </section>
    </main>
  );
}