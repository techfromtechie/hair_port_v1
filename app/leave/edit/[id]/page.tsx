"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import FormInput from "@/app/components/forms/FormInput";
import FormSelect from "@/app/components/forms/FormSelect";
import FormActions from "@/app/components/forms/FormActions";
import Navbar from "@/app/components/Navbar";
import Loader from "@/app/components/Loader";

import { supabase } from "@/app/lib/supabase";
import { toast } from "react-toastify";

// =========================
// TYPES
// =========================

type Employee = {
  id: string;
  name: string;
};

type Branch = {
  id: string;
  name: string;
};

type LeaveRecord = {
  id: string;
  employee_id: string;
  branch_id: string;
  leave_date: string;
  leave_type: string;
};

// =========================
// LEAVE TYPES
// =========================

const leaveTypes = [
  {
    label: "Full",
    value: "Full",
  },
  {
    label: "Half",
    value: "Half",
  },
];

// =========================
// PAGE
// =========================

export default function EditLeavePage() {
  const router = useRouter();
  const params = useParams();

  const leaveId = params.id as string;

  // =========================
  // STATES
  // =========================

  const [employees, setEmployees] = useState<
    Employee[]
  >([]);

  const [branches, setBranches] = useState<
    Branch[]
  >([]);

  const [employee, setEmployee] = useState("");
  const [branch, setBranch] = useState("");
  const [leaveDate, setLeaveDate] = useState("");
  const [leaveType, setLeaveType] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] =
    useState(false);

  // =========================
  // TODAY
  // =========================

  const today = new Date()
    .toISOString()
    .split("T")[0];

  // =========================
  // FETCH ALL DATA FROM SUPABASE
  // =========================

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // =========================
        // FETCH EMPLOYEES
        // =========================

        const {
          data: employeeData,
          error: employeeError,
        } = await supabase
          .from("employees")
          .select("id, name")
          .order("name", {
            ascending: true,
          });

        if (employeeError) {
          throw employeeError;
        }

        setEmployees(employeeData ?? []);

        // =========================
        // FETCH BRANCHES
        // =========================

        const {
          data: branchData,
          error: branchError,
        } = await supabase
          .from("branches")
          .select("id, name")
          .order("name", {
            ascending: true,
          });

        if (branchError) {
          throw branchError;
        }

        setBranches(branchData ?? []);

        // =========================
        // FETCH EXISTING LEAVE
        // =========================

        const {
          data: leaveData,
          error: leaveError,
        } = await supabase
          .from("leaves")
          .select(`
            id,
            employee_id,
            branch_id,
            leave_date,
            leave_type
          `)
          .eq("id", leaveId)
          .single();

        if (leaveError) {
          throw leaveError;
        }

        const leave: LeaveRecord =
          leaveData;

        // =========================
        // SET EXISTING DATA
        // =========================

        setEmployee(
          leave.employee_id
        );

        setBranch(
          leave.branch_id
        );

        setLeaveDate(
          leave.leave_date
        );

        setLeaveType(
          leave.leave_type
        );
      } catch (error: any) {
        console.error(
          "Fetch edit leave error:",
          error
        );

        toast.error(
          error?.message ||
            "Failed to load leave details."
        );

        router.push("/leave");
      } finally {
        setLoading(false);
      }
    };

    if (leaveId) {
      fetchData();
    }
  }, [leaveId, router]);

  // =========================
  // UPDATE LEAVE IN SUPABASE
  // =========================

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    // =========================
    // VALIDATION
    // =========================

    if (!employee) {
      toast.error(
        "Please select an employee."
      );
      return;
    }

    if (!branch) {
      toast.error(
        "Please select a branch."
      );
      return;
    }

    if (!leaveDate) {
      toast.error(
        "Please select leave date."
      );
      return;
    }

    if (!leaveType) {
      toast.error(
        "Please select leave type."
      );
      return;
    }

    try {
      setSubmitting(true);

      // =========================
      // SUPABASE UPDATE
      // =========================

      const {
        error: updateError,
      } = await supabase
        .from("leaves")
        .update({
          employee_id: employee,
          branch_id: branch,
          leave_date: leaveDate,
          leave_type: leaveType,
        })
        .eq("id", leaveId);

      if (updateError) {
        throw updateError;
      }

      // =========================
      // SUCCESS
      // =========================

      toast.success(
        "Leave updated successfully!"
      );

      // =========================
      // REDIRECT
      // =========================

      setTimeout(() => {
        router.push("/leave");
        router.refresh();
      }, 700);
    } catch (error: any) {
      console.error(
        "Update leave error:",
        error
      );

      toast.error(
        error?.message ||
          "Failed to update leave."
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

        <section className="px-5 py-10 md:px-8">
          <div className="mx-auto max-w-5xl">
            <Loader
              text="Loading leave details..."
              fullScreen
            />
          </div>
        </section>
      </main>
    );
  }

  // =========================
  // UI
  // =========================

  return (
    <main className="min-h-screen bg-gray-100">
      {/* ================= NAVBAR ================= */}

      <div className="relative bg-[#17191d]">
        <Navbar />

        <div className="h-24" />
      </div>

      {/* ================= CONTENT ================= */}

      <section className="px-5 py-10 md:px-8">
        <div className="mx-auto max-w-5xl">
          {/* ================= HEADING ================= */}

          <div className="mb-8">
            <div className="flex items-center gap-4">
              {/* BACK */}

              <button
                type="button"
                onClick={() =>
                  router.back()
                }
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-700 shadow-sm transition hover:bg-gray-100 hover:text-black"
                aria-label="Go back"
              >
                <ArrowLeft size={20} />
              </button>

              {/* YELLOW LINE */}

              <div className="h-8 w-1 rounded-full bg-[#f5b942]" />

              {/* TITLE */}

              <h1 className="text-3xl font-bold tracking-tight text-[#17191d] md:text-4xl">
                Edit Leave
              </h1>
            </div>

            <p className="mt-3 ml-14 text-base text-gray-500">
              Update employee leave
              details below.
            </p>
          </div>

          {/* ================= FORM CARD ================= */}

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8 lg:p-10">
            <form
              onSubmit={handleSubmit}
              className="space-y-7"
            >
              {/* ================= EMPLOYEE + BRANCH ================= */}

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                
               

                {/* BRANCH */}

                <FormSelect
                  label="Branch"
                  placeholder="Select Branch"
                  options={branches.map(
                    (item) => ({
                      label: item.name,
                      value: item.id,
                    })
                  )}
                  value={branch}
                  onChange={(e) =>
                    setBranch(
                      e.target.value
                    )
                  }
                  required
                  name="branch"
                />

                 <FormSelect
                  label="Employee Name"
                  placeholder="Select Employee"
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
              </div>

              {/* ================= DATE + LEAVE TYPE ================= */}

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* DATE */}

                <FormInput
                  label="Leave Date"
                  type="date"
                  value={leaveDate}
                  onChange={(e) =>
                    setLeaveDate(
                      e.target.value
                    )
                  }
                  min={today}
                  required
                  name="leaveDate"
                />

                {/* LEAVE TYPE */}

                <FormSelect
                  label="Leave Type"
                  placeholder="Select Leave Type"
                  options={leaveTypes}
                  value={leaveType}
                  onChange={(e) =>
                    setLeaveType(
                      e.target.value
                    )
                  }
                  required
                  name="leaveType"
                />
              </div>

              {/* ================= ACTIONS ================= */}

              <FormActions
                submitText={
                  submitting
                    ? "Updating Leave..."
                    : "Update Leave"
                }
                cancelHref="/leave"
              />
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}