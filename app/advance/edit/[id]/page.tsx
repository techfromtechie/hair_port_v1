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

type UserRole = "admin" | "branch_manager";

const paymentModes = [
  { label: "Cash", value: "Cash" },
  { label: "Online", value: "Online" },
];

export default function EditAdvancePaymentPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [managerBranchId, setManagerBranchId] = useState("");

  const [employee, setEmployee] = useState("");
  const [branch, setBranch] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState("");
  const [advanceDate, setAdvanceDate] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        // Identify the logged-in user's role.
        const { data: roleData, error: roleError } =
          await supabase.rpc("get_my_role");
        if (roleError) throw roleError;

        const profile = Array.isArray(roleData) ? roleData[0] : roleData;
        if (
          !profile ||
          !["admin", "branch_manager"].includes(profile.role)
        ) {
          throw new Error("User role not found.");
        }

        const role = profile.role as UserRole;
        setUserRole(role);

        let branchId = "";

        // Find the branch assigned to this branch manager.
        if (role === "branch_manager") {
          if (!profile.employee_id) {
            throw new Error("Manager employee is not linked.");
          }

          const { data: managerEmployee, error: managerError } =
            await supabase
              .from("employees")
              .select("branch_id")
              .eq("id", profile.employee_id)
              .single();

          if (managerError) throw managerError;
          if (!managerEmployee?.branch_id) {
            throw new Error("Manager branch not found.");
          }

          branchId = managerEmployee.branch_id;
          setManagerBranchId(branchId);
          setBranch(branchId);
        }

        // Admins can load all employees; managers only their branch.
        let employeeQuery = supabase
          .from("employees")
          .select("id, name, branch_id")
          .order("name", { ascending: true });

        if (role === "branch_manager") {
          employeeQuery = employeeQuery.eq("branch_id", branchId);
        }

        const { data: employeeData, error: employeeError } =
          await employeeQuery;
        if (employeeError) throw employeeError;

        const formattedEmployees: Employee[] = (employeeData ?? []).map(
          (item) => ({
            id: item.id,
            name: item.name,
            branchId: item.branch_id,
          })
        );
        setEmployees(formattedEmployees);

        // Fetch the advance record. Managers can only load their own branch's record.
        let advanceQuery = supabase
          .from("advance_payments")
          .select(
            "id, employee_id, branch_id, cash, online, description, advance_date"
          )
          .eq("id", id);

        if (role === "branch_manager") {
          advanceQuery = advanceQuery.eq("branch_id", branchId);
        }

        const { data: advanceData, error: advanceError } =
          await advanceQuery.single();
        if (advanceError) throw advanceError;

        if (!advanceData) {
          toast.error("Advance payment not found.");
          router.push("/advance");
          return;
        }

        // Ensure the existing employee is in the permitted employee list.
        const existingEmployee = formattedEmployees.find(
          (item) => item.id === advanceData.employee_id
        );

        if (!existingEmployee) {
          toast.error("You cannot edit an advance from another branch.");
          router.push("/advance");
          return;
        }

        setEmployee(advanceData.employee_id || "");
        setBranch(
          role === "branch_manager"
            ? branchId
            : advanceData.branch_id || existingEmployee.branchId
        );

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
      } catch (error) {
        console.error("Advance fetch error:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to load advance payment."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, router]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!employee) {
      toast.error("Please select an employee.");
      return;
    }
    if (!amount || Number(amount) <= 0) {
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

    const selectedEmployee = employees.find((item) => item.id === employee);
    if (!selectedEmployee) {
      toast.error("Selected employee is not available for your account.");
      return;
    }

    if (
      userRole === "branch_manager" &&
      selectedEmployee.branchId !== managerBranchId
    ) {
      toast.error("You can only select employees from your own branch.");
      return;
    }

    const branchToSave =
      userRole === "branch_manager" ? managerBranchId : selectedEmployee.branchId;

    if (selectedEmployee.branchId !== branchToSave) {
      toast.error("Employee and branch do not match.");
      return;
    }

    try {
      setSubmitting(true);
      const numericAmount = Number(amount);
      const cash = paymentMode === "Cash" ? numericAmount : 0;
      const online = paymentMode === "Online" ? numericAmount : 0;

      let updateQuery = supabase
        .from("advance_payments")
        .update({
          employee_id: selectedEmployee.id,
          branch_id: branchToSave,
          cash,
          online,
          description: description.trim() || null,
          advance_date: advanceDate,
        })
        .eq("id", id);

      if (userRole === "branch_manager") {
        updateQuery = updateQuery.eq("branch_id", managerBranchId);
      }

      const { data: updatedRows, error } = await updateQuery.select("id");
      if (error) throw error;
      if (!updatedRows || updatedRows.length === 0) {
        throw new Error("Update was not allowed. Check your branch access.");
      }

      toast.success("Advance payment updated successfully!");
      setTimeout(() => {
        router.push("/advance");
        router.refresh();
      }, 700);
    } catch (error) {
      console.error("Advance update error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update advance payment."
      );
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
            <p className="text-sm font-medium text-gray-500">
              Loading advance payment...
            </p>
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
                Edit Advance Payment
              </h1>
            </div>
            <p className="mt-3 ml-12 text-base text-gray-500">
              Update advance payment details by editing the fields below.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8 lg:p-10">
            <form onSubmit={handleSubmit} className="space-y-7">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormSelect
                  label="Employee Name"
                  placeholder={loading ? "Loading Employees..." : "Select Employee"}
                  options={employees.map((item) => ({
                    label: item.name,
                    value: item.id,
                  }))}
                  value={employee}
                  onChange={(e) => {
                    const selectedEmployeeId = e.target.value;
                    setEmployee(selectedEmployeeId);
                    const selected = employees.find(
                      (item) => item.id === selectedEmployeeId
                    );
                    if (selected) {
                      setBranch(
                        userRole === "branch_manager"
                          ? managerBranchId
                          : selected.branchId
                      );
                    }
                  }}
                  required
                />

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

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormSelect
                  label="Payment Mode"
                  placeholder="Select Payment Mode"
                  options={paymentModes}
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  required
                />

                <FormInput
                  label="Advance Date"
                  type="date"
                  value={advanceDate}
                  onChange={(e) => setAdvanceDate(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-6">
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
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#f5b942] px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-[#e0a82f] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {submitting ? "Updating Advance..." : "Update Advance"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
