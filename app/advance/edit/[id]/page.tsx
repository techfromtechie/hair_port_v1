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



const paymentModes = [
  {
    label: "Cash",
    value: "Cash",
  },
  {
    label: "Online",
    value: "Online",
  },
];

export default function EditAdvancePaymentPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [employees, setEmployees] = useState<Employee[]>([]);
  

  const [employee, setEmployee] = useState("");
  const [branch, setBranch] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState("");
  const [advanceDate, setAdvanceDate] = useState("");
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

        // =========================
        // FETCH EMPLOYEES
        // =========================

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

      

        // =========================
        // FETCH ADVANCE
        // =========================

        const { data: advanceData, error: advanceError } =
          await supabase
            .from("advance_payments")
            .select(`
              id,
              employee_id,
              branch_id,
              cash,
              online,
              description,
              advance_date
            `)
            .eq("id", id)
            .single();

        if (advanceError) {
          throw advanceError;
        }

        if (!advanceData) {
          toast.error("Advance payment not found.");
          router.push("/advance");
          return;
        }

        // =========================
        // SET EXISTING VALUES
        // =========================

        setEmployee(advanceData.employee_id || "");
        setBranch(advanceData.branch_id || "");

        const cash = Number(advanceData.cash || 0);
        const online = Number(advanceData.online || 0);

        if (cash > 0) {
          setAmount(String(cash));
          setPaymentMode("Cash");
        } else if (online > 0) {
          setAmount(String(online));
          setPaymentMode("Online");
        } else {
          setAmount("");
          setPaymentMode("");
        }

        setAdvanceDate(advanceData.advance_date || "");
        setDescription(advanceData.description || "");
      } catch (error: any) {
        console.error("Advance fetch error:", error);

        toast.error(
          error?.message || "Failed to load advance payment."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, router]);

  // =========================
  // UPDATE ADVANCE
  // =========================

  const handleSubmit = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!employee) {
      toast.error("Please select an employee.");
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

    if (!advanceDate) {
      toast.error("Please select advance date.");
      return;
    }

    try {
      setSubmitting(true);

      const numericAmount = Number(amount);

      const cash =
        paymentMode === "Cash"
          ? numericAmount
          : 0;

      const online =
        paymentMode === "Online"
          ? numericAmount
          : 0;

      const { error } = await supabase
        .from("advance_payments")
        .update({
          employee_id: employee,
          branch_id: branch,
          cash,
          online,
          description: description || null,
          advance_date: advanceDate,
        })
        .eq("id", id);

      if (error) {
        throw error;
      }

      toast.success(
        "Advance payment updated successfully!"
      );

      setTimeout(() => {
        router.push("/advance");
        router.refresh();
      }, 700);
    } catch (error: any) {
      console.error(
        "Advance update error:",
        error
      );

      toast.error(
        error?.message ||
          "Failed to update advance payment."
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
        <div className="relative bg-[#17191d]">
          <Navbar />
          <div className="h-24" />
        </div>

        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-[#f5b942]" />

            <p className="text-sm font-medium text-gray-500">
              Loading advance payment...
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
                Edit Advance Payment
              </h1>
            </div>

            <p className="mt-3 ml-12 text-base text-gray-500">
              Update advance payment details by editing the fields below.
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
        const selectedEmployeeId = e.target.value;

        setEmployee(selectedEmployeeId);

        const selectedEmployee = employees.find(
          (item) => item.id === selectedEmployeeId
        );

        if (selectedEmployee) {
          setBranch(selectedEmployee.branchId);
        }
      }}
      required
    />

    {/* Advance Amount */}
    <FormInput
      label="Advance Amount"
      type="number"
      placeholder="Enter advance amount"
      value={amount}
      onChange={(e) => setAmount(e.target.value)}
      min="1"
      required
    />

  </div>

  {/* ================= ROW 2 ================= */}

  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

    {/* Payment Mode */}
    <FormSelect
      label="Payment Mode"
      placeholder="Select Payment Mode"
      options={paymentModes}
      value={paymentMode}
      onChange={(e) => setPaymentMode(e.target.value)}
      required
    />

    {/* Advance Date */}
    <FormInput
      label="Advance Date"
      type="date"
      value={advanceDate}
      onChange={(e) => setAdvanceDate(e.target.value)}
      required
    />

  </div>

  {/* ================= ROW 3 ================= */}

  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

    {/* Description */}
    <FormTextarea
      label="Description"
      placeholder="Enter description"
      rows={3}
      value={description}
      onChange={(e) => setDescription(e.target.value)}
    />

    {/* Empty field */}
    <div></div>

  </div>

  {/* ================= ACTIONS ================= */}

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
      {submitting && (
        <Loader2 className="h-4 w-4 animate-spin" />
      )}

      {submitting
        ? "Updating Advance..."
        : "Update Advance"}
    </button>

  </div>
</form>
          </div>
        </div>
      </section>
    </main>
  );
}