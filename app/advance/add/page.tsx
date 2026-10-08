"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import FormInput from "../../components/forms/FormInput";
import FormSelect from "../../components/forms/FormSelect";
import FormTextarea from "../../components/forms/FormTextarea";
import FormActions from "../../components/forms/FormActions";
import Navbar from "@/app/components/Navbar";

import { supabase } from "@/app/lib/supabase";
import { toast } from "react-toastify";

type Employee = {
  id: string;
  name: string;
  branchId: string;
};

const paymentModes = [
  {
    label: "Cash",
    value: "cash",
  },
  {
    label: "Online",
    value: "online",
  },
];

export default function AddAdvancePage() {
  const router = useRouter();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employee, setEmployee] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // =========================
  // FETCH EMPLOYEES
  // =========================
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);

        const { data, error } = await supabase
          .from("employees")
          .select(`
            id,
            name,
            branch_id
          `)
          .order("name", {
            ascending: true,
          });

        if (error) {
          console.error("Employee fetch error:", error);

          toast.error("Failed to load employees.");

          return;
        }

        const formattedEmployees: Employee[] = (data ?? []).map(
          (item) => ({
            id: item.id,
            name: item.name,
            branchId: item.branch_id,
          })
        );

        setEmployees(formattedEmployees);
      } catch (error) {
        console.error("Unexpected employee error:", error);

        toast.error(
          "Something went wrong while loading employees."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  // =========================
  // HANDLE SUBMIT
  // =========================
  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);

    // =========================
    // FORM DATA
    // =========================

    const amount = Number(
      formData.get("amount")
    );

    const paymentMode = String(
      formData.get("paymentMode") || ""
    );

    const description = String(
      formData.get("description") || ""
    );

    const advanceDate = String(
      formData.get("advanceDate") || ""
    );

    // =========================
    // VALIDATION
    // =========================

    if (!employee) {
      toast.error("Please select an employee.");
      return;
    }

    if (!amount || amount <= 0) {
      toast.error("Please enter a valid advance amount.");
      return;
    }

    if (!paymentMode) {
      toast.error("Please select payment mode.");
      return;
    }

    if (!advanceDate) {
      toast.error("Please select advance date.");
      return;
    }

    // =========================
    // FIND SELECTED EMPLOYEE
    // =========================

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
      // CASH / ONLINE CALCULATION
      // =========================

      const cash =
        paymentMode === "cash"
          ? amount
          : 0;

      const online =
        paymentMode === "online"
          ? amount
          : 0;

      // =========================
      // INSERT INTO SUPABASE
      // =========================

      const { error } = await supabase
        .from("advance_payments")
        .insert([
          {
            employee_id: selectedEmployee.id,

            branch_id: selectedEmployee.branchId,

            cash,

            online,

            description:
              description.trim() || null,

            advance_date: advanceDate,
          },
        ]);

      // =========================
      // SUPABASE ERROR
      // =========================

      if (error) {
        console.error(
          "Advance insert error:",
          error
        );

        toast.error(
          error.message ||
            "Failed to add advance payment."
        );

        return;
      }

      // =========================
      // SUCCESS
      // =========================

      toast.success(
        "Advance payment added successfully!"
      );

      // Reset form
      form.reset();

      // Reset employee state
      setEmployee("");

      // Go to Advance Payment Report
      setTimeout(() => {
        router.push("/advance");
      }, 700);
    } catch (error) {
      console.error(
        "Unexpected advance error:",
        error
      );

      toast.error(
        "Something went wrong while adding advance."
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
        {/* ================= HEADING ================= */}
<div className="mb-8">

  <div className="flex items-center gap-4">

    {/* Back Button */}
    <button
      type="button"
      onClick={() => router.back()}
      className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-700 shadow-sm transition hover:bg-gray-100 hover:text-black"
      aria-label="Go back"
    >
      <ArrowLeft size={20} />
    </button>

    {/* Yellow Line */}
    <div className="h-8 w-1 rounded-full bg-[#f5b942]" />

    {/* Page Title */}
    <h1 className="text-3xl font-bold tracking-tight text-[#17191d] md:text-4xl">
      Add Advance
    </h1>

  </div>

  <p className="mt-3 ml-14 text-base text-gray-500">
    Create a new advance payment by
    entering the details below.
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
                  placeholder={
                    loading
                      ? "Loading Employees..."
                      : "Select Employee"
                  }
                  options={employees.map(
                    (item) => ({
                      label: item.name,
                      value: item.id,
                    })
                  )}
                  value={employee}
                  onChange={(e) =>
                    setEmployee(
                      e.target.value
                    )
                  }
                  required
                  name="employee"
                />

                {/* Advance Amount */}
                <FormInput
                  label="Advance Amount"
                  type="number"
                  placeholder="Enter advance amount"
                  required
                  name="amount"
                  min="1"
                />

              </div>

              {/* ================= ROW 2 ================= */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

                {/* Payment Mode */}
                <FormSelect
                  label="Payment Mode"
                  placeholder="Select Payment Mode"
                  options={paymentModes}
                  required
                  name="paymentMode"
                />

                {/* Advance Date */}
                <FormInput
                  label="Advance Date"
                  type="date"
                  required
                  name="advanceDate"
                  defaultValue={
                    new Date()
                      .toISOString()
                      .split("T")[0]
                  }
                />

              </div>

              {/* ================= ROW 3 ================= */}
              <div className="grid grid-cols-1 gap-6">

                <FormTextarea
  label="Description"
  placeholder="Enter description"
  rows={3}
/>
              </div>

              {/* ================= ACTIONS ================= */}
              <FormActions
                submitText={
                  submitting
                    ? "Adding Advance..."
                    : "Add Advance"
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