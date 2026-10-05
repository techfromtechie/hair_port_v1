"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  SlidersHorizontal,
  RotateCcw,
  Building2,
  UserRound,
  Phone,
  IndianRupee,
} from "lucide-react";

import Navbar from "@/app/components/Navbar";
import FormSelect from "@/app/components/forms/FormSelect";

// ============================================================
// TYPES
// ============================================================

type Employee = {
  id: number;
  name: string;
  contactNumber: string;
  branch: string;
  dateOfBirth: string;
  aadharCard: string;
  gender: string;
  salary: number;
  address: string;
};

// ============================================================
// DUMMY EMPLOYEE DATA
// ============================================================

const employees: Employee[] = [
  {
    id: 1,
    name: "Rahul Sharma",
    contactNumber: "9876543210",
    branch: "Main Branch",
    dateOfBirth: "1998-05-12",
    aadharCard: "XXXX XXXX 1234",
    gender: "Male",
    salary: 18000,
    address: "Vijay Nagar, Indore",
  },
  {
    id: 2,
    name: "Priya Verma",
    contactNumber: "9876543211",
    branch: "Main Branch",
    dateOfBirth: "1999-08-20",
    aadharCard: "XXXX XXXX 5678",
    gender: "Female",
    salary: 22000,
    address: "Palasia, Indore",
  },
  {
    id: 3,
    name: "Aman Khan",
    contactNumber: "9876543212",
    branch: "Ujjain Branch",
    dateOfBirth: "1997-03-15",
    aadharCard: "XXXX XXXX 9012",
    gender: "Male",
    salary: 20000,
    address: "Freeganj, Ujjain",
  },
  {
    id: 4,
    name: "Neha Singh",
    contactNumber: "9876543213",
    branch: "Vijay Nagar Branch",
    dateOfBirth: "2000-11-05",
    aadharCard: "XXXX XXXX 3456",
    gender: "Female",
    salary: 19000,
    address: "Scheme No. 54, Indore",
  },
  {
    id: 5,
    name: "Rohit Patel",
    contactNumber: "9876543214",
    branch: "Main Branch",
    dateOfBirth: "1996-01-25",
    aadharCard: "XXXX XXXX 7890",
    gender: "Male",
    salary: 25000,
    address: "Rau, Indore",
  },
];

// ============================================================
// BRANCHES
// ============================================================

const branches = [
  "Main Branch",
  "Ujjain Branch",
  "Vijay Nagar Branch",
];

export default function EmployeesPage() {
  const [search, setSearch] = useState("");
  const [selectedBranch, setSelectedBranch] =
    useState("");
  const [showFilters, setShowFilters] =
    useState(false);

  // ==========================================================
  // FILTER EMPLOYEES
  // ==========================================================

  const filteredEmployees = useMemo(() => {
    const searchValue =
      search.trim().toLowerCase();

    return employees.filter((employee) => {
      const matchesSearch =
        !searchValue ||
        employee.name
          .toLowerCase()
          .includes(searchValue) ||
        employee.contactNumber.includes(
          searchValue
        );

      const matchesBranch =
        !selectedBranch ||
        employee.branch === selectedBranch;

      return (
        matchesSearch &&
        matchesBranch
      );
    });
  }, [search, selectedBranch]);

  // ==========================================================
  // RESET
  // ==========================================================

  const resetFilters = () => {
    setSearch("");
    setSelectedBranch("");
  };

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
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder="Search employee name or contact number..."
                  className="h-11 w-full rounded-lg border border-gray-200 bg-gray-50 pl-11 pr-4 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-[#d59618] focus:bg-white focus:ring-2 focus:ring-[#f5b942]/20"
                />

              </div>

              {/* FILTER */}

              <button
                type="button"
                onClick={() =>
                  setShowFilters(!showFilters)
                }
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
                    setSelectedBranch(
                      e.target.value
                    )
                  }
                  options={[
                    {
                      label: "All Branches",
                      value: "",
                    },
                    ...branches.map(
                      (branch) => ({
                        label: branch,
                        value: branch,
                      })
                    ),
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
              value={`₹${filteredEmployees
                .reduce(
                  (total, employee) =>
                    total + employee.salary,
                  0
                )
                .toLocaleString("en-IN")}`}
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

            {/* TABLE */}

            <div className="overflow-x-auto">

              <table className="w-full min-w-[1200px]">

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

                  </tr>

                </thead>

                <tbody>

                  {filteredEmployees.length > 0 ? (
                    filteredEmployees.map(
                      (employee) => (
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
                            {employee.dateOfBirth}
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
                            {employee.address}
                          </td>

                        </tr>
                      )
                    )
                  ) : (
                    <tr>

                      <td
                        colSpan={8}
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