"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  Plus,
  Search,
  RotateCcw,
  Building2,
  UserRound,
  Phone,
  IndianRupee,
  Pencil,
  Trash2,
  X,
  Save,
  UserCog,
} from "lucide-react";
import Navbar from "@/app/components/Navbar";
import Loader from "@/app/components/Loader";
import FormSelect from "@/app/components/forms/FormSelect";
import ExportTable from "@/app/components/ExportTable";
import { supabase } from "@/app/lib/supabase";

type Employee = {
  id: string;
  name: string;
  contactNumber: string;
  branchId: string;
  branch: string;
  jobPosition: string;
  dateOfBirth: string;
  joiningDate: string;
  aadharCard: string;
  gender: string;
  salary: number;
  address: string;
};

type Branch = {
  id: string;
  name: string;
  location: string;
  managerEmployeeId: string | null;
};

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingManager, setSavingManager] = useState(false);
  const [error, setError] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [managerBranch, setManagerBranch] = useState<Branch | null>(null);
  const [selectedManagerId, setSelectedManagerId] = useState("");
  const [managerModalOpen, setManagerModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [
        { data: branchData, error: branchError },
        { data: employeeData, error: employeeError },
      ] = await Promise.all([
        supabase
          .from("branches")
          .select("id, name, location, manager_employee_id")
          .order("name", { ascending: true }),

        supabase
          .from("employees")
          .select(`
            id,
            name,
            contact_number,
            branch_id,
            job_position,
            date_of_birth,
            joining_date,
            aadhar_card,
            gender,
            salary,
            address,
            created_at
          `)
          .order("created_at", { ascending: false }),
      ]);

      if (branchError) throw branchError;
      if (employeeError) throw employeeError;

      const rawBranches = branchData ?? [];

      const branchMap = new Map<string, string>(
        rawBranches.map((branch) => [branch.id, branch.name])
      );

      const formattedEmployees: Employee[] = (
        employeeData ?? []
      ).map((employee) => ({
        id: employee.id,
        name: employee.name ?? "",
        contactNumber: employee.contact_number ?? "-",
        branchId: employee.branch_id ?? "",
        branch: branchMap.get(employee.branch_id) ?? "Unknown Branch",
        jobPosition: employee.job_position ?? "Not Assigned",
        dateOfBirth: employee.date_of_birth ?? "-",
        joiningDate: employee.joining_date ?? "-",
        aadharCard: employee.aadhar_card ?? "-",
        gender: employee.gender ?? "-",
        salary: Number(employee.salary ?? 0),
        address: employee.address ?? "-",
      }));

      setBranches(
        rawBranches.map((branch) => ({
          id: branch.id,
          name: branch.name,
          location: branch.location ?? "",
          managerEmployeeId: branch.manager_employee_id ?? null,
        }))
      );

      setEmployees(formattedEmployees);
    } catch (err) {
      console.error("Fetch employee/branch data error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while loading employee data."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const filteredEmployees = useMemo(
    () =>
      employees.filter(
        (employee) =>
          !selectedBranch || employee.branchId === selectedBranch
      ),
    [employees, selectedBranch]
  );

  const resetFilters = () => setSelectedBranch("");

  const handleDelete = async (employee: Employee) => {
    if (
      !window.confirm(
        `Are you sure you want to delete ${employee.name}?`
      )
    ) {
      return;
    }

    try {
      const { error: deleteError } = await supabase
        .from("employees")
        .delete()
        .eq("id", employee.id);

      if (deleteError) throw deleteError;

      toast.success("Employee deleted successfully.");
      await fetchData();
    } catch (err) {
      console.error("Delete employee error:", err);

      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to delete employee."
      );
    }
  };
    const openManagerModal = (branch: Branch) => {
    setManagerBranch(branch);
    setSelectedManagerId(branch.managerEmployeeId ?? "");
    setManagerModalOpen(true);
  };

  
const handleSaveManager = async () => {
  if (!managerBranch) return;

  if (selectedManagerId) {
    const candidate = employees.find(
      (employee) => employee.id === selectedManagerId
    );

    if (!candidate) {
      toast.error("Please select a valid employee.");
      return;
    }
  }

  try {
    setSavingManager(true);

    const { error: updateError } = await supabase
      .from("branches")
      .update({
        manager_employee_id: selectedManagerId || null,
      })
      .eq("id", managerBranch.id);

    if (updateError) throw updateError;

    toast.success(
      selectedManagerId
        ? "Branch manager updated successfully."
        : "Branch manager removed successfully."
    );

    setManagerModalOpen(false);
    setManagerBranch(null);

    await fetchData();
  } catch (err) {
    console.error("Manager update error:", err);

    toast.error(
      err instanceof Error
        ? err.message
        : "Could not update branch manager."
    );
  } finally {
    setSavingManager(false);
  }
};


  const formatDate = (date: string) => {
    if (!date || date === "-") return "-";

    // Remove time if Supabase returns an ISO date-time string.
    const datePart = date.split("T")[0];
    const parts = datePart.split("-");

    if (parts.length !== 3) return date;

    const [year, month, day] = parts;

    if (!year || !month || !day) return date;

    return `${day}-${month}-${year}`;
  };

  const totalSalary = filteredEmployees.reduce(
    (total, employee) => total + employee.salary,
    0
  );

  

const managerOptions = useMemo(() => {
  if (!managerBranch) return [];

  return employees
    .filter((employee) => employee.branchId === managerBranch.id)
    .sort((a, b) => a.name.localeCompare(b.name));
}, [employees, managerBranch]);



  return (
    <main className="min-h-screen bg-[#f5f6f8]">
      <div className="relative bg-[#17191d]">
        <Navbar />
        <div className="h-24" />
      </div>

      {loading ? (
        <Loader text="Loading employees..." fullScreen />
      ) : (
        <section className="px-5 py-10 md:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <Link
                    href="/management/admin"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition hover:border-[#f5b942] hover:bg-[#fff9eb] hover:text-[#a86f00]"
                    title="Back to Admin Dashboard"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Link>

                  <div className="h-8 w-1 rounded-full bg-[#f5b942]" />

                  <h1 className="text-3xl font-bold tracking-tight text-[#17191d] md:text-4xl">
                    Employees
                  </h1>
                </div>

                <p className="ml-4 mt-3 text-base text-gray-500">
                  View employees and manage each branch&apos;s manager.
                </p>
              </div>

              <Link
                href="/management/admin/employees/add"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#17191d] px-5 text-sm font-semibold text-white transition hover:bg-black"
              >
                <Plus className="h-4 w-4" />
                Add Employee
              </Link>
            </div>

            {error && (
              <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
                <p className="font-semibold">
                  Failed to load employee data.
                </p>

                <p className="mt-1">{error}</p>

                <p className="mt-2">
                  Confirm that `employees.job_position` and
                  `branches.manager_employee_id` exist in Supabase.
                </p>
              </div>
            )}

            {/* BRANCH MANAGER MANAGEMENT */}
            <section className="mb-8 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fff9eb] text-[#a86f00]">
                  <UserCog className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Branch Managers
                  </h2>

                  <p className="text-sm text-gray-500">
                    Assign, change, or remove the manager for each branch.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {branches.map((branch) => {
                  const manager = employees.find(
                    (employee) =>
                      employee.id === branch.managerEmployeeId
                  );

                  return (
                    <div
                      key={branch.id}
                      className="rounded-xl border border-gray-200 p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                          <Building2 className="h-5 w-5" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="font-bold text-gray-900">
                            {branch.name}
                          </h3>

                          <p className="mt-1 text-sm text-gray-500">
                            {branch.location || "Branch location not set"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 rounded-lg bg-gray-50 p-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Current Manager
                        </p>

                        <p className="mt-1 font-semibold text-gray-900">
                          {manager?.name ?? "Not assigned"}
                        </p>

                        {manager && (
                          <p className="mt-1 text-xs text-gray-500">
                            {manager.jobPosition}
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => openManagerModal(branch)}
                        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#17191d] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-black"
                      >
                        <Pencil className="h-4 w-4" />
                        {manager ? "Change Manager" : "Assign Manager"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>
                        {/* EMPLOYEE FILTER */}
            <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormSelect
                  label="Branch"
                  value={selectedBranch}
                  onChange={(event) =>
                    setSelectedBranch(event.target.value)
                  }
                  options={[
                    { label: "All Branches", value: "" },
                    ...branches.map((branch) => ({
                      label: branch.name,
                      value: branch.id,
                    })),
                  ]}
                />
              </div>
            </div>

            {/* SUMMARY */}
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <SummaryCard
                title="Total Employees"
                value={filteredEmployees.length.toString()}
                subtitle="Employees shown"
                icon={<UserRound className="h-5 w-5" />}
                iconClass="bg-blue-50 text-blue-600"
              />

              <SummaryCard
                title="Branches"
                value={branches.length.toString()}
                subtitle="Available branches"
                icon={<Building2 className="h-5 w-5" />}
                iconClass="bg-amber-50 text-[#d59618]"
              />

              <SummaryCard
                title="Total Salary"
                value={`₹${totalSalary.toLocaleString("en-IN")}`}
                subtitle="Monthly salary"
                icon={<IndianRupee className="h-5 w-5" />}
                iconClass="bg-green-50 text-green-600"
              />
            </div>

            {/* EMPLOYEE TABLE */}
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="flex flex-col gap-4 border-b border-gray-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-[#17191d]">
                    All Employees
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Employee details, job positions, and branch information.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-sm text-gray-500">
                    Showing{" "}
                    <span className="font-semibold text-gray-800">
                      {filteredEmployees.length}
                    </span>{" "}
                    employees
                  </p>

                  <button
                    type="button"
                    onClick={resetFilters}
                    className="inline-flex h-11 items-center gap-2 rounded-lg border border-gray-300 bg-white px-5 text-sm font-semibold text-gray-700 transition hover:border-[#f5b942] hover:bg-[#fff9eb]"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reset
                  </button>

                  <ExportTable
                    data={filteredEmployees.map((employee) => ({
                      name: employee.name,
                      contactNumber: employee.contactNumber,
                      branch: employee.branch,
                      jobPosition: employee.jobPosition,
                      dateOfBirth: formatDate(employee.dateOfBirth),
                      joiningDate: formatDate(employee.joiningDate),
                      aadharCard: employee.aadharCard,
                      salary: employee.salary,
                    }))}
                    columns={[
                      { header: "Name", key: "name" },
                      { header: "Contact Number", key: "contactNumber" },
                      { header: "Branch", key: "branch" },
                      { header: "Job Position", key: "jobPosition" },
                      { header: "Date of Birth", key: "dateOfBirth" },
                      { header: "Joining Date", key: "joiningDate" },
                      { header: "Aadhar Card", key: "aadharCard" },
                      { header: "Salary", key: "salary" },
                    ]}
                    fileName="Employees-Report"
                    disabled={!filteredEmployees.length}
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[1250px]">
                  <thead>
                    <tr className="bg-[#17191d] text-left text-sm text-white">
                      <th className="whitespace-nowrap px-6 py-4 font-semibold">
                        Name
                      </th>
                      <th className="whitespace-nowrap px-6 py-4 font-semibold">
                        Contact Number
                      </th>
                      <th className="whitespace-nowrap px-6 py-4 font-semibold">
                        Branch
                      </th>
                      <th className="whitespace-nowrap px-6 py-4 font-semibold">
                        Job Position
                      </th>
                      <th className="whitespace-nowrap px-6 py-4 font-semibold">
                        Date of Birth
                      </th>
                      <th className="whitespace-nowrap px-6 py-4 font-semibold">
                        Joining Date
                      </th>
                      <th className="whitespace-nowrap px-6 py-4 font-semibold">
                        Aadhar Card
                      </th>
                      <th className="whitespace-nowrap px-6 py-4 text-right font-semibold">
                        Salary
                      </th>
                      <th className="whitespace-nowrap px-6 py-4 text-center font-semibold">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredEmployees.length > 0 ? (
                      filteredEmployees.map((employee) => (
                        <tr
                          key={employee.id}
                          className="border-b border-gray-100 transition last:border-b-0 hover:bg-[#fffaf0]"
                        >
                          <td className="whitespace-nowrap px-6 py-4">
                            <span className="font-semibold text-gray-800">
                              {employee.name}
                            </span>
                          </td>

                          <td className="whitespace-nowrap px-6 py-4">
                            <span className="inline-flex items-center gap-2 text-sm text-gray-700">
                              <Phone className="h-4 w-4 shrink-0 text-gray-400" />
                              {employee.contactNumber}
                            </span>
                          </td>

                          <td className="whitespace-nowrap px-6 py-4">
                            <span className="inline-flex items-center gap-2 text-sm text-gray-700">
                              <Building2 className="h-4 w-4 shrink-0 text-gray-400" />
                              {employee.branch}
                            </span>
                          </td>

                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                            {employee.jobPosition}
                          </td>

                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                            {formatDate(employee.dateOfBirth)}
                          </td>

                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                            {formatDate(employee.joiningDate)}
                          </td>

                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                            {employee.aadharCard}
                          </td>

                          <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-semibold text-gray-800">
                            ₹{employee.salary.toLocaleString("en-IN")}
                          </td>

                          <td className="whitespace-nowrap px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <Link
                                href={`/management/admin/employees/edit/${employee.id}`}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                                title="Edit Employee"
                              >
                                <Pencil className="h-4 w-4" />
                              </Link>

                              <button
                                type="button"
                                onClick={() => void handleDelete(employee)}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                                title="Delete Employee"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={9}
                          className="px-6 py-16 text-center"
                        >
                          <div className="flex flex-col items-center">
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                              <Search className="h-6 w-6 text-gray-400" />
                            </div>

                            <h3 className="mt-4 text-base font-semibold text-gray-900">
                              No employees found
                            </h3>

                            <p className="mt-1 text-sm text-gray-500">
                              Try changing the branch filter.
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      )}
            {/* CHANGE MANAGER MODAL */}
      {managerModalOpen && managerBranch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {managerBranch.managerEmployeeId
                    ? "Change Branch Manager"
                    : "Assign Branch Manager"}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {managerBranch.name}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setManagerModalOpen(false)}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                aria-label="Close dialog"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6">
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Select Manager
              </label>

              

<select
  value={selectedManagerId}
  onChange={(event) =>
    setSelectedManagerId(event.target.value)
  }
  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-700 outline-none focus:border-[#f5b942] focus:ring-2 focus:ring-[#f5b942]/20"
>
  <option value="">No manager assigned</option>

  {managerOptions.map((employee) => (
    <option key={employee.id} value={employee.id}>
      {employee.name} — {employee.jobPosition}
    </option>
  ))}
</select>

{managerOptions.length === 0 && (
  <p className="mt-2 text-sm text-amber-700">
    Is branch mein abhi koi employee available nahi hai.
  </p>
)}

<p className="mt-2 text-xs text-gray-500">
  Only employees belonging to {managerBranch.name} are shown.
</p>


<p className="mt-2 text-xs text-gray-500">
  All employees are listed. Selecting an employee assigns them
  as this branch's manager without changing their current branch.
</p>


              {managerOptions.length === 0 && (
                <p className="mt-2 text-sm text-amber-700">
                  This branch has no employee with Job Position
                  &quot;Salon Manager&quot;. Add or edit an employee first.
                </p>
              )}

              <p className="mt-2 text-xs text-gray-500">
                Only employees in this branch whose Job Position is exactly
                &quot;Salon Manager&quot; are listed.
              </p>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setManagerModalOpen(false)}
                disabled={savingManager}
                className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => void handleSaveManager()}
                disabled={savingManager}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#17191d] px-5 py-2.5 text-sm font-semibold text-white hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {savingManager ? "Saving..." : "Save Manager"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function SummaryCard({
  title,
  value,
  subtitle,
  icon,
  iconClass,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  iconClass: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>

          <p className="mt-2 text-2xl font-bold tracking-tight text-[#17191d]">
            {value}
          </p>

          <p className="mt-1 text-xs text-gray-400">{subtitle}</p>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${iconClass}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}