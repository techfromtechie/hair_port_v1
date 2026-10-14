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

type Employee = {
  id: string;
  name: string;
  branch_id: string;
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

const leaveTypes = [
  { label: "Full", value: "Full" },
  { label: "Half", value: "Half" },
];

export default function EditLeavePage() {
  const router = useRouter();
  const params = useParams();
  const leaveId = params.id as string;

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [employee, setEmployee] = useState("");
  const [branch, setBranch] = useState("");
  const [managerBranchId, setManagerBranchId] = useState("");
  const [userRole, setUserRole] = useState<"admin" | "branch_manager" | null>(null);
  const [leaveDate, setLeaveDate] = useState("");
  const [leaveType, setLeaveType] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const today = new Date().toISOString().split("T")[0];
  const isBranchManager = userRole === "branch_manager";

  useEffect(() => {
    if (!leaveId) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        // Resolve the signed-in user's role and, for managers, assigned branch.
        const { data: roleData, error: roleError } = await supabase.rpc("get_my_role");
        if (roleError) throw roleError;

        const profile = Array.isArray(roleData) ? roleData[0] : roleData;
        const role = profile?.role as "admin" | "branch_manager" | undefined;
        if (!role || (role !== "admin" && role !== "branch_manager")) {
          throw new Error("Your account does not have permission to edit leave records.");
        }
        setUserRole(role);

        let branchId = "";
        if (role === "branch_manager") {
          if (!profile?.employee_id) {
            throw new Error("Your manager account is not linked to an employee.");
          }

          const { data: managerEmployee, error: managerEmployeeError } = await supabase
            .from("employees")
            .select("branch_id")
            .eq("id", profile.employee_id)
            .single();

          if (managerEmployeeError) throw managerEmployeeError;
          if (!managerEmployee?.branch_id) {
            throw new Error("Could not determine your assigned branch.");
          }
          branchId = managerEmployee.branch_id;
          setManagerBranchId(branchId);
          setBranch(branchId);
        }

        // Load the leave record first and prevent a manager from opening another branch's leave.
        let leaveQuery = supabase
          .from("leaves")
          .select("id, employee_id, branch_id, leave_date, leave_type")
          .eq("id", leaveId);

        if (role === "branch_manager") {
          leaveQuery = leaveQuery.eq("branch_id", branchId);
        }

        const { data: leaveData, error: leaveError } = await leaveQuery.single();
        if (leaveError) throw leaveError;
        const leave = leaveData as LeaveRecord;

        // Managers only load their own branch; admins can load all branches.
        let employeesQuery = supabase
          .from("employees")
          .select("id, name, branch_id")
          .order("name", { ascending: true });

        let branchesQuery = supabase
          .from("branches")
          .select("id, name")
          .order("name", { ascending: true });

        if (role === "branch_manager") {
          employeesQuery = employeesQuery.eq("branch_id", branchId);
          branchesQuery = branchesQuery.eq("id", branchId);
        }

        const [
          { data: employeeData, error: employeeError },
          { data: branchData, error: branchError },
        ] = await Promise.all([employeesQuery, branchesQuery]);

        if (employeeError) throw employeeError;
        if (branchError) throw branchError;

        const availableEmployees = (employeeData ?? []) as Employee[];
        const availableBranches = (branchData ?? []) as Branch[];

        // Also verify the leave's employee is in the allowed employee list.
        if (!availableEmployees.some((item) => item.id === leave.employee_id)) {
          throw new Error("This leave record is outside your branch access.");
        }

        setEmployees(availableEmployees);
        setBranches(availableBranches);
        setEmployee(leave.employee_id);
        setBranch(role === "branch_manager" ? branchId : leave.branch_id);
        setLeaveDate(leave.leave_date);
        setLeaveType(leave.leave_type);
      } catch (error: any) {
        console.error("Fetch edit leave error:", error);
        toast.error(error?.message || "Failed to load leave details.");
        router.push("/leave");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [leaveId, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

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

    const selectedEmployee = employees.find((item) => item.id === employee);
    if (!selectedEmployee) {
      toast.error("Selected employee is not available for your branch.");
      return;
    }

    // Do not allow the form to assign a manager's leave to another branch.
    if (isBranchManager && branch !== managerBranchId) {
      toast.error("You can only update leave records for your own branch.");
      return;
    }
    if (selectedEmployee.branch_id !== branch) {
      toast.error("Selected employee does not belong to the selected branch.");
      return;
    }

    try {
      setSubmitting(true);

      let updateQuery = supabase
        .from("leaves")
        .update({
          employee_id: employee,
          branch_id: branch,
          leave_date: leaveDate,
          leave_type: leaveType,
        })
        .eq("id", leaveId);

      if (isBranchManager) {
        updateQuery = updateQuery.eq("branch_id", managerBranchId);
      }

      const { error: updateError } = await updateQuery;
      if (updateError) throw updateError;

      toast.success("Leave updated successfully!");
      setTimeout(() => {
        router.push("/leave");
        router.refresh();
      }, 700);
    } catch (error: any) {
      console.error("Update leave error:", error);
      toast.error(error?.message || "Failed to update leave.");
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
        <section className="px-5 py-10 md:px-8">
          <div className="mx-auto max-w-5xl">
            <Loader text="Loading leave details..." fullScreen />
          </div>
        </section>
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
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-700 shadow-sm transition hover:bg-gray-100 hover:text-black"
                aria-label="Go back"
              >
                <ArrowLeft size={20} />
              </button>
              <div className="h-8 w-1 rounded-full bg-[#f5b942]" />
              <h1 className="text-3xl font-bold tracking-tight text-[#17191d] md:text-4xl">
                Edit Leave
              </h1>
            </div>
            <p className="mt-3 ml-14 text-base text-gray-500">
              Update employee leave details below.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8 lg:p-10">
            <form onSubmit={handleSubmit} className="space-y-7">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormSelect
                  label="Branch"
                  placeholder="Select Branch"
                  options={branches.map((item) => ({
                    label: item.name,
                    value: item.id,
                  }))}
                  value={branch}
                  onChange={(e) => {
                    const selectedBranchId = e.target.value;
                    setBranch(isBranchManager ? managerBranchId : selectedBranchId);

                    if (employee) {
                      const selectedEmployee = employees.find((item) => item.id === employee);
                      if (selectedEmployee && selectedEmployee.branch_id !== selectedBranchId) {
                        setEmployee("");
                      }
                    }
                  }}
                  required
                  name="branch"
                  disabled={isBranchManager}
                />

                <FormSelect
                  label="Employee Name"
                  placeholder="Select Employee"
                  options={employees
                    .filter((item) => !branch || item.branch_id === branch)
                    .map((item) => ({
                      label: item.name,
                      value: item.id,
                    }))}
                  value={employee}
                  onChange={(e) => setEmployee(e.target.value)}
                  required
                  name="employee"
                />
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormInput
                  label="Leave Date"
                  type="date"
                  value={leaveDate}
                  onChange={(e) => setLeaveDate(e.target.value)}
                  min={today}
                  required
                  name="leaveDate"
                />

                <FormSelect
                  label="Leave Type"
                  placeholder="Select Leave Type"
                  options={leaveTypes}
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  required
                  name="leaveType"
                />
              </div>

              <FormActions
                submitText={submitting ? "Updating Leave..." : "Update Leave"}
                cancelHref="/leave"
              />
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
