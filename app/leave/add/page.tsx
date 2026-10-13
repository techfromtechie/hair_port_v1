"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import FormInput from "../../components/forms/FormInput";
import FormSelect from "../../components/forms/FormSelect";
import FormActions from "../../components/forms/FormActions";
import Navbar from "@/app/components/Navbar";

import { supabase } from "@/app/lib/supabase";
import { toast } from "react-toastify";

type Employee = {
  id: string;
  name: string;
  branch_id: string | null;
};

type Branch = {
  id: string;
  name: string;
};

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

export default function AddLeavePage() {
  const router = useRouter();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employee, setEmployee] = useState("");

  const [branches, setBranches] = useState<Branch[]>([]);
  const [branch, setBranch] = useState("");

  const [leaveDate, setLeaveDate] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const today = new Date().toISOString().split("T")[0];

    // Selected employee ki branch ke according branches filter hongi
  const filteredBranches = employee
    ? branches.filter(
        (item) =>
          item.id ===
          employees.find((emp) => emp.id === employee)?.branch_id
      )
    : branches;

  // Selected branch ke according employees filter honge
  const filteredEmployees = branch
    ? employees.filter((item) => item.branch_id === branch)
    : employees;

  // =========================
  // FETCH EMPLOYEES & BRANCHES
  // =========================
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // =========================
        // FETCH EMPLOYEES
        // =========================
        const { data: employeeData, error: employeeError } =
          await supabase
            .from("employees")
            .select(`
              id,
              name,
              branch_id
            `)
            .order("name", {
              ascending: true,
            });

        if (employeeError) {
          console.error(
            "Employee fetch error:",
            employeeError
          );

          toast.error("Failed to load employees.");
          return;
        }

        const formattedEmployees: Employee[] =
  (employeeData ?? []).map((item) => ({
    id: item.id,
    name: item.name,
    branch_id: item.branch_id,
  }));

setEmployees(formattedEmployees);
        // =========================
        // FETCH BRANCHES
        // =========================
        const { data: branchData, error: branchError } =
          await supabase
            .from("branches")
            .select(`
              id,
              name
            `)
            .order("name", {
              ascending: true,
            });

        if (branchError) {
          console.error(
            "Branch fetch error:",
            branchError
          );

          toast.error("Failed to load branches.");
          return;
        }

        const formattedBranches: Branch[] =
          (branchData ?? []).map((item) => ({
            id: item.id,
            name: item.name,
          }));

        setBranches(formattedBranches);
      } catch (error) {
        console.error(
          "Unexpected fetch error:",
          error
        );

        toast.error(
          "Something went wrong while loading data."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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

    const leaveType = String(
      formData.get("leaveType") || ""
    );

    // =========================
    // VALIDATION
    // =========================
    if (!employee) {
      toast.error("Please select an employee.");
      return;
    }

    if (!branch) {
      toast.error("Please select a branch.");
      return;
    }

    if (!leaveDate) {
      toast.error("Please select leave date.");
      return;
    }

    if (!leaveType) {
      toast.error("Please select leave type.");
      return;
    }

    // =========================
    // FIND EMPLOYEE
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
      // INSERT LEAVE
      // =========================
      const { error } = await supabase
        .from("leaves")
        .insert([
          {
            employee_id: selectedEmployee.id,
            branch_id: branch,
            leave_date: leaveDate,
            leave_type: leaveType,
          },
        ]);

      // =========================
      // SUPABASE ERROR
      // =========================
      if (error) {
        console.error(
          "Leave insert error:",
          error
        );

        toast.error(
          error.message || "Failed to add leave."
        );

        return;
      }

      // =========================
      // SUCCESS
      // =========================
      toast.success("Leave added successfully!");

      form.reset();

      setEmployee("");
      setBranch("");
      setLeaveDate("");

      // =========================
      // REDIRECT
      // =========================
      setTimeout(() => {
        router.push("/leave");
      }, 700);
    } catch (error) {
      console.error(
        "Unexpected leave error:",
        error
      );

      toast.error(
        "Something went wrong while adding leave."
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

      {/* ================= PAGE CONTENT ================= */}
      <section className="px-5 py-10 md:px-8">
        <div className="mx-auto max-w-5xl">

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

              {/* Title */}
              <h1 className="text-3xl font-bold tracking-tight text-[#17191d] md:text-4xl">
                Add Leave
              </h1>
            </div>

            <p className="mt-3 ml-14 text-base text-gray-500">
              Add employee leave details below.
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

                {/* Employee */}
                <FormSelect
  label="Employee Name"
  placeholder={
    loading ? "Loading Employees..." : "Select Employee"
  }
  options={filteredEmployees.map((item) => ({
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

    if (selectedEmployee?.branch_id) {
      setBranch(selectedEmployee.branch_id);
    } else {
      setBranch("");
    }
  }}
  required
  name="employee"
/>
                {/* Branch */}
                <FormSelect
  label="Branch"
  placeholder="Select Branch"
  options={filteredBranches.map((item) => ({
    label: item.name,
    value: item.id,
  }))}
  value={branch}
  onChange={(e) => {
    const selectedBranchId = e.target.value;

    setBranch(selectedBranchId);

    // Agar selected employee is branch ka nahi hai,
    // to employee selection reset kar dein.
    const selectedEmployee = employees.find(
      (item) => item.id === employee
    );

    if (
      selectedEmployee &&
      selectedEmployee.branch_id !== selectedBranchId
    ) {
      setEmployee("");
    }
  }}
  required
  name="branch"
/>

              </div>

              {/* ================= DATE + LEAVE TYPE ================= */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

                {/* Leave Date */}
                <FormInput
                  label="Leave Date"
                  type="date"
                  value={leaveDate}
                  onChange={(e) =>
                    setLeaveDate(e.target.value)
                  }
                  min={today}
                  required
                  name="leaveDate"
                />

                {/* Leave Type */}
                <FormSelect
                  label="Leave Type"
                  placeholder="Select Leave Type"
                  options={leaveTypes}
                  required
                  name="leaveType"
                />

              </div>

              {/* ================= ACTIONS ================= */}
              <FormActions
                submitText={
                  submitting
                    ? "Adding Leave..."
                    : "Add Leave"
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