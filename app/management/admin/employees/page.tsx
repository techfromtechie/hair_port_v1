"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import {
  ArrowLeft,
  Plus,
  Search,
  SlidersHorizontal,
  RotateCcw,
  Building2,
  UserRound,
  Phone,
  IndianRupee,
  CalendarDays,
  Pencil,
  Trash2,
} from "lucide-react";

import Navbar from "@/app/components/Navbar";
import FormSelect from "@/app/components/forms/FormSelect";
import { supabase } from "@/app/lib/supabase";

// ============================================================
// TYPES
// ============================================================

type Employee = {
  id: string;
  name: string;
  contactNumber: string;
  branchId: string;
  branch: string;
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
};

// ============================================================
// PAGE
// ============================================================

export default function EmployeesPage() {
  // ==========================================================
  // STATES
  // ==========================================================

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // ==========================================================
  // FETCH DATA
  // ==========================================================

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      // ------------------------------------------------------
      // FETCH BRANCHES
      // ------------------------------------------------------

      const {
        data: branchData,
        error: branchError,
      } = await supabase
        .from("branches")
        .select("id, name, location")
        .order("name", { ascending: true });

      if (branchError) {
        console.error("Branch fetch error:", branchError);
        setError(branchError.message);
        return;
      }

      // ------------------------------------------------------
      // FETCH EMPLOYEES
      // ------------------------------------------------------

      const {
        data: employeeData,
        error: employeeError,
      } = await supabase
        .from("employees")
        .select(`
          id,
          name,
          contact_number,
          branch_id,
          date_of_birth,
          joining_date,
          aadhar_card,
          gender,
          salary,
          address
        `)
        .order("created_at", { ascending: false });

      if (employeeError) {
        console.error("Employee fetch error:", employeeError);
        setError(employeeError.message);
        return;
      }

      // ------------------------------------------------------
      // MAP BRANCH NAME
      // ------------------------------------------------------

      const branchMap = new Map<string, string>();

      (branchData || []).forEach((branch) => {
        branchMap.set(branch.id, branch.name);
      });

      // ------------------------------------------------------
      // FORMAT EMPLOYEES
      // ------------------------------------------------------

      const formattedEmployees: Employee[] = (employeeData || []).map(
        (employee) => ({
          id: employee.id,
          name: employee.name,
          contactNumber: employee.contact_number,
          branchId: employee.branch_id,
          branch:
            branchMap.get(employee.branch_id) || "Unknown Branch",
          dateOfBirth: employee.date_of_birth || "-",
          joiningDate: employee.joining_date || "-",
          aadharCard: employee.aadhar_card || "-",
          gender: employee.gender || "-",
          salary: Number(employee.salary || 0),
          address: employee.address || "-",
        })
      );

      setBranches(branchData || []);
      setEmployees(formattedEmployees);
    } catch (error) {
      console.error("Fetch error:", error);
      setError("Something went wrong while loading employees.");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // FILTER EMPLOYEES
  // ==========================================================

  const filteredEmployees = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return employees.filter((employee) => {
      const matchesSearch =
        !searchValue ||
        employee.name.toLowerCase().includes(searchValue) ||
        employee.contactNumber
          .toLowerCase()
          .includes(searchValue) ||
        employee.branch.toLowerCase().includes(searchValue);

      const matchesBranch =
        !selectedBranch ||
        employee.branchId === selectedBranch;

      return matchesSearch && matchesBranch;
    });
  }, [employees, search, selectedBranch]);

  // ==========================================================
  // RESET
  // ==========================================================

  const resetFilters = () => {
    setSearch("");
    setSelectedBranch("");
  };

  // ==========================================================
  // DELETE EMPLOYEE
  // ==========================================================

  const handleDelete = async (employee: Employee) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${employee.name}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      const { error } = await supabase
        .from("employees")
        .delete()
        .eq("id", employee.id);

      if (error) {
        console.error("Delete employee error:", error);
        alert(error.message);
        return;
      }

      alert("Employee deleted successfully.");

      // Refresh employee list
      await fetchData();
    } catch (error) {
      console.error("Delete error:", error);
      alert("Something went wrong while deleting employee.");
    }
  };

  // ==========================================================
  // FORMAT DATE
  // ==========================================================

  const formatDate = (date: string) => {
    if (!date || date === "-") {
      return "-";
    }

    const [year, month, day] = date.split("-");

    if (!year || !month || !day) {
      return date;
    }

    return `${day}-${month}-${year}`;
  };

  // ==========================================================
  // SUMMARY
  // ==========================================================

  const totalSalary = filteredEmployees.reduce(
    (total, employee) => total + employee.salary,
    0
  );

  // ==========================================================
  // RETURN
  // ==========================================================

  return (
    <main className="min-h-screen bg-[#f5f6f8]">

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <div className="relative bg-[#17191d]">
        <Navbar />
        <div className="h-24" />
      </div>

      {/* =====================================================
          PAGE CONTENT
      ===================================================== */}

      <section className="px-5 py-10 md:px-8">
        <div className="mx-auto max-w-7xl">

          {/* =================================================
              HEADER
          ================================================= */}

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
                View and manage all salon employees.
              </p>
            </div>

            {/* ADD EMPLOYEE */}

            <Link
              href="/management/admin/employees/add"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#17191d] px-5 text-sm font-semibold text-white transition hover:bg-black"
            >
              <Plus className="h-4 w-4" />
              Add Employee
            </Link>

          </div>

          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
              <p className="font-semibold">
                Failed to load employee data.
              </p>

              <p className="mt-1">
                {error}
              </p>
            </div>
          )}

          {/* =================================================
              FILTER SECTION
          ================================================= */}

          <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">

              {/* SEARCH */}

              <div className="relative flex-1">

                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search employee name, contact or branch..."
                  className="h-11 w-full rounded-lg border border-gray-200 bg-gray-50 pl-11 pr-4 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-[#d59618] focus:bg-white focus:ring-2 focus:ring-[#f5b942]/20"
                />

              </div>

              {/* FILTER */}

              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex h-11 items-center justify-center gap-2 rounded-lg border px-5 text-sm font-semibold transition ${
                  showFilters
                    ? "border-[#d59618] bg-[#fff9eb] text-[#a86f00]"
                    : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
              </button>

              {/* RESET */}

              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </button>

            </div>

            {/* FILTER OPTIONS */}

            {showFilters && (
              <div className="mt-5 grid grid-cols-1 gap-4 border-t border-gray-100 pt-5 md:grid-cols-2">

                <FormSelect
                  label="Branch"
                  value={selectedBranch}
                  onChange={(e) =>
                    setSelectedBranch(e.target.value)
                  }
                  options={[
                    {
                      label: "All Branches",
                      value: "",
                    },
                    ...branches.map((branch) => ({
                      label: branch.name,
                      value: branch.id,
                    })),
                  ]}
                />

              </div>
            )}

          </div>

          {/* =================================================
              SUMMARY
          ================================================= */}

          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

            <SummaryCard
              title="Total Employees"
              value={filteredEmployees.length.toString()}
              subtitle="Employees shown"
              icon={
                <UserRound className="h-5 w-5" />
              }
              iconClass="bg-blue-50 text-blue-600"
            />

            <SummaryCard
              title="Branches"
              value={branches.length.toString()}
              subtitle="Available branches"
              icon={
                <Building2 className="h-5 w-5" />
              }
              iconClass="bg-amber-50 text-[#d59618]"
            />

            <SummaryCard
              title="Total Salary"
              value={`₹${totalSalary.toLocaleString("en-IN")}`}
              subtitle="Monthly salary"
              icon={
                <IndianRupee className="h-5 w-5" />
              }
              iconClass="bg-green-50 text-green-600"
            />

          </div>

          {/* =================================================
              EMPLOYEE TABLE
          ================================================= */}

          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

            {/* TABLE HEADER */}

            <div className="flex flex-col gap-4 border-b border-gray-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <h2 className="text-lg font-bold text-[#17191d]">
                  All Employees
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Employee details and branch information.
                </p>

              </div>

              <p className="text-sm text-gray-500">
                Showing{" "}
                <span className="font-semibold text-gray-800">
                  {filteredEmployees.length}
                </span>{" "}
                employees
              </p>

            </div>

            {/* LOADING */}

            {loading ? (
              <div className="flex min-h-[300px] items-center justify-center">

                <div className="flex flex-col items-center">

                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#d59618]" />

                  <p className="mt-4 text-sm text-gray-500">
                    Loading employees...
                  </p>

                </div>

              </div>
            ) : (

              /* TABLE */

              <div className="overflow-x-auto">

                <table className="w-full min-w-[1500px]">

                  <thead>

                    <tr className="bg-[#17191d] text-left text-sm text-white">

                      <th className="px-6 py-4 font-semibold">
                        Name
                      </th>

                      <th className="px-6 py-4 font-semibold">
                        Contact Number
                      </th>

                      <th className="px-6 py-4 font-semibold">
                        Branch
                      </th>

                      <th className="px-6 py-4 font-semibold">
                        Date of Birth
                      </th>

                      <th className="px-6 py-4 font-semibold">
                        Joining Date
                      </th>

                      <th className="px-6 py-4 font-semibold">
                        Aadhar Card
                      </th>

                      <th className="px-6 py-4 font-semibold">
                        Gender
                      </th>

                      <th className="px-6 py-4 text-right font-semibold">
                        Salary
                      </th>

                      <th className="px-6 py-4 font-semibold">
                        Address
                      </th>

                      <th className="px-6 py-4 text-center font-semibold">
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

                          {/* NAME */}

                          <td className="px-6 py-4">

                            <div className="flex items-center gap-3">

                              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#fff9eb] text-[#a86f00]">
                                <UserRound className="h-4 w-4" />
                              </div>

                              <div className="font-semibold text-gray-800">
                                {employee.name}
                              </div>

                            </div>

                          </td>

                          {/* CONTACT */}

                          <td className="px-6 py-4">

                            <span className="inline-flex items-center gap-2 text-sm text-gray-700">

                              <Phone className="h-4 w-4 text-gray-400" />

                              {employee.contactNumber}

                            </span>

                          </td>

                          {/* BRANCH */}

                          <td className="px-6 py-4">

                            <span className="inline-flex items-center gap-2 text-sm text-gray-700">

                              <Building2 className="h-4 w-4 text-gray-400" />

                              {employee.branch}

                            </span>

                          </td>

                          {/* DOB */}

                          <td className="px-6 py-4 text-sm text-gray-700">

                            <span className="inline-flex items-center gap-2">

                              <CalendarDays className="h-4 w-4 text-gray-400" />

                              {formatDate(employee.dateOfBirth)}

                            </span>

                          </td>

                          {/* JOINING DATE */}

                          <td className="px-6 py-4 text-sm text-gray-700">

                            {formatDate(employee.joiningDate)}

                          </td>

                          {/* AADHAR */}

                          <td className="px-6 py-4 text-sm text-gray-600">
                            {employee.aadharCard}
                          </td>

                          {/* GENDER */}

                          <td className="px-6 py-4 text-sm text-gray-700">
                            {employee.gender}
                          </td>

                          {/* SALARY */}

                          <td className="px-6 py-4 text-right text-sm font-semibold text-gray-800">

                            ₹
                            {employee.salary.toLocaleString(
                              "en-IN"
                            )}

                          </td>

                          {/* ADDRESS */}

                          <td className="max-w-[220px] px-6 py-4 text-sm text-gray-600">

                            <span
                              className="block truncate"
                              title={employee.address}
                            >
                              {employee.address}
                            </span>

                          </td>

                          {/* ACTION */}

                          <td className="px-6 py-4">

                            <div className="flex items-center justify-center gap-2">

                              {/* EDIT */}

                              <Link
                                href={`/management/admin/employees/edit/${employee.id}`}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                                title="Edit Employee"
                              >
                                <Pencil className="h-4 w-4" />
                              </Link>

                              {/* DELETE */}

                              <button
                                type="button"
                                onClick={() =>
                                  handleDelete(employee)
                                }
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
                          colSpan={10}
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
                              Try changing your search or branch filter.
                            </p>

                          </div>

                        </td>

                      </tr>

                    )}

                  </tbody>

                </table>

              </div>

            )}

          </div>

        </div>
      </section>

    </main>
  );
}

// ============================================================
// SUMMARY CARD
// ============================================================

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

          <p className="text-sm font-medium text-gray-500">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold tracking-tight text-[#17191d]">
            {value}
          </p>

          <p className="mt-1 text-xs text-gray-400">
            {subtitle}
          </p>

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