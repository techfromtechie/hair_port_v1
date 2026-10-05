"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import Navbar from "@/app/components/Navbar";
import ExportTable from "@/app/components/ExportTable";
import FormSelect from "@/app/components/forms/FormSelect";

import {
  leaves,
  employees,
} from "@/app/data/leaveData";

import {
  Plus,
  Search,
  SlidersHorizontal,
  RotateCcw,
  UserRound,
  Building2,
  CalendarDays,
  FileText,
} from "lucide-react";

// ============================================================
// TYPES
// ============================================================

type PeriodFilter =
  | "all"
  | "day"
  | "week"
  | "month"
  | "year";

type LeaveTypeFilter =
  | "all"
  | "Full"
  | "Half";

// ============================================================
// PAGE
// ============================================================

export default function AdminLeavesPage() {
     const branches = [
    ...new Set(employees.map((employee) => employee.branch)),
  ];
  // ==========================================================
  // FILTER STATES
  // ==========================================================

  const [search, setSearch] = useState("");
  const [period, setPeriod] =
    useState<PeriodFilter>("all");

  const [selectedBranch, setSelectedBranch] =
    useState("");

  const [selectedLeaveType, setSelectedLeaveType] =
    useState<LeaveTypeFilter>("all");

  const [showFilters, setShowFilters] =
    useState(false);

  // ==========================================================
  // TODAY
  // ==========================================================

  const today = new Date();

  const todayString =
    today.toISOString().split("T")[0];

  // ==========================================================
  // PERIOD START DATE
  // ==========================================================

  const getStartDate = (
    filter: PeriodFilter
  ) => {
    const date = new Date(today);

    if (filter === "day") {
      return date;
    }

    if (filter === "week") {
      date.setDate(date.getDate() - 6);
      return date;
    }

    if (filter === "month") {
      date.setMonth(date.getMonth() - 1);
      return date;
    }

    if (filter === "year") {
      date.setFullYear(date.getFullYear() - 1);
      return date;
    }

    return null;
  };

  // ==========================================================
  // FILTER LEAVES
  // ==========================================================

  const filteredLeaves = useMemo(() => {
    const startDate =
      getStartDate(period);

    const searchValue =
      search.trim().toLowerCase();

    return leaves
      .filter((leave) => {
        // ----------------------------------------------------
        // SEARCH
        // ----------------------------------------------------

        const matchesSearch =
          !searchValue ||
          leave.employee
            .toLowerCase()
            .includes(searchValue) ||
          leave.employeeNumber
            .toLowerCase()
            .includes(searchValue);

        // ----------------------------------------------------
        // BRANCH
        // ----------------------------------------------------

        const matchesBranch =
          !selectedBranch ||
          leave.branch === selectedBranch;

        // ----------------------------------------------------
        // LEAVE TYPE
        // ----------------------------------------------------

        const matchesLeaveType =
          selectedLeaveType === "all" ||
          leave.leaveType ===
            selectedLeaveType;

        // ----------------------------------------------------
        // PERIOD
        // ----------------------------------------------------

        const leaveDate = new Date(
          `${leave.date}T00:00:00`
        );

        const matchesPeriod =
          !startDate ||
          (period === "day"
            ? leave.date === todayString
            : leaveDate >= startDate);

        return (
          matchesSearch &&
          matchesBranch &&
          matchesLeaveType &&
          matchesPeriod
        );
      })
      .sort((a, b) =>
        b.date.localeCompare(a.date)
      );
  }, [
    search,
    period,
    selectedBranch,
    selectedLeaveType,
    todayString,
  ]);

  // ==========================================================
  // TOTAL CALCULATIONS
  // ==========================================================

  const fullLeaveCount =
    filteredLeaves.filter(
      (leave) =>
        leave.leaveType === "Full"
    ).length;

  const halfLeaveCount =
    filteredLeaves.filter(
      (leave) =>
        leave.leaveType === "Half"
    ).length;

  const totalLeaveCount =
    fullLeaveCount +
    halfLeaveCount * 0.5;

  // ==========================================================
  // EXPORT DATA
  // ==========================================================

  const leaveExportData =
    filteredLeaves.map((leave) => ({
      employee: leave.employee,
      employeeNumber:
        leave.employeeNumber,
      branch: leave.branch,
      date: leave.date,
      leaveType: leave.leaveType,
    }));

  // ==========================================================
  // RESET FILTERS
  // ==========================================================

  const resetFilters = () => {
    setSearch("");
    setPeriod("all");
    setSelectedBranch("");
    setSelectedLeaveType("all");
  };

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <main className="min-h-screen bg-[#f5f6f8]">

      {/* ====================================================
          NAVBAR
      ==================================================== */}

      <div className="relative bg-[#17191d]">
        <Navbar />
        <div className="h-24" />
      </div>

      {/* ====================================================
          PAGE CONTENT
      ==================================================== */}

      <section className="px-5 py-10 md:px-8">
        <div className="mx-auto max-w-7xl">

          {/* ==================================================
              HEADER
          ================================================== */}

          <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">

            <div>

              <div className="flex items-center gap-3">

                <div className="h-8 w-1 rounded-full bg-[#f5b942]" />

                <h1 className="text-3xl font-bold tracking-tight text-[#17191d] md:text-4xl">
                  Leaves
                </h1>

              </div>

              <p className="ml-4 mt-3 text-base text-gray-500">
                View and manage employee leave records.
              </p>

            </div>

          </div>

          {/* ==================================================
              SEARCH + FILTERS
          ================================================== */}

          <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

            {/* TOP ROW */}

            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">

              {/* SEARCH */}

              <div className="relative flex-1">

                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                <input
                  type="text"
                  value={search}
                  onChange={(e) =>
                    setSearch(
                      e.target.value
                    )
                  }
                  placeholder="Search employee name or employee number..."
                  className="h-11 w-full rounded-lg border border-gray-200 bg-gray-50 pl-11 pr-4 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-[#d59618] focus:bg-white focus:ring-2 focus:ring-[#f5b942]/20"
                />

              </div>

              {/* FILTER BUTTON */}

              <button
                type="button"
                onClick={() =>
                  setShowFilters(
                    !showFilters
                  )
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

            {/* =================================================
                FILTER OPTIONS
            ================================================= */}

            {showFilters && (
              <div className="mt-5 grid grid-cols-1 gap-4 border-t border-gray-100 pt-5 md:grid-cols-3">

                {/* PERIOD */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Period
                  </label>

                  <select
                    value={period}
                    onChange={(e) =>
                      setPeriod(
                        e.target.value as PeriodFilter
                      )
                    }
                    className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-[#d59618] focus:ring-2 focus:ring-[#f5b942]/20"
                  >

                    <option value="all">
                      All Time
                    </option>

                    <option value="day">
                      Last 1 Day
                    </option>

                    <option value="week">
                      Last 7 Days
                    </option>

                    <option value="month">
                      Last 1 Month
                    </option>

                    <option value="year">
                      Last 1 Year
                    </option>

                  </select>

                </div>

                {/* BRANCH */}

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

                {/* LEAVE TYPE */}

                <FormSelect
                  label="Leave Type"
                  value={selectedLeaveType}
                  onChange={(e) =>
                    setSelectedLeaveType(
                      e.target.value as LeaveTypeFilter
                    )
                  }
                  options={[
                    {
                      label: "All Leave Types",
                      value: "all",
                    },
                    {
                      label: "Full Leave",
                      value: "Full",
                    },
                    {
                      label: "Half Leave",
                      value: "Half",
                    },
                  ]}
                />

              </div>
            )}

          </div>

          {/* ==================================================
              SUMMARY CARDS
          ================================================== */}

          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

            <SummaryCard
              title="Recent Leaves"
              value={filteredLeaves.length.toString()}
              subtitle="Filtered records"
              icon={
                <FileText className="h-5 w-5" />
              }
              iconClass="bg-blue-50 text-blue-600"
            />

            <SummaryCard
              title="Full Leave"
              value={fullLeaveCount.toString()}
              subtitle="Full day leaves"
              icon={
                <CalendarDays className="h-5 w-5" />
              }
              iconClass="bg-amber-50 text-[#d59618]"
            />

            <SummaryCard
              title="Half Leave"
              value={halfLeaveCount.toString()}
              subtitle="Half day leaves"
              icon={
                <UserRound className="h-5 w-5" />
              }
              iconClass="bg-violet-50 text-violet-600"
            />

            <SummaryCard
              title="Total Leave"
              value={totalLeaveCount.toString()}
              subtitle="Full = 1, Half = 0.5"
              icon={
                <Building2 className="h-5 w-5" />
              }
              iconClass="bg-green-50 text-green-600"
            />

          </div>

          {/* ==================================================
              RECENT LEAVES TABLE
          ================================================== */}

          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

            {/* TABLE HEADER */}

            <div className="flex flex-col gap-4 border-b border-gray-200 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">

              <div>

                <h2 className="text-lg font-bold text-[#17191d]">
                  Recent Leaves
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Employee leave history based on the selected filters.
                </p>

              </div>

              {/* ACTIONS */}

              <div className="flex flex-wrap gap-3">

                {/* EXPORT */}

                <ExportTable
                  data={leaveExportData}
                  columns={[
                    {
                      header: "Employee",
                      key: "employee",
                    },
                    {
                      header: "Employee No",
                      key: "employeeNumber",
                    },
                    {
                      header: "Branch",
                      key: "branch",
                    },
                    {
                      header: "Date",
                      key: "date",
                    },
                    {
                      header: "Leave Type",
                      key: "leaveType",
                    },
                  ]}
                  fileName="Employee-Leaves"
                  disabled={
                    !filteredLeaves.length
                  }
                />

                {/* ADD LEAVE */}

                <Link
                  href="/leave/add"
                  className="inline-flex h-11 items-center gap-2 rounded-lg bg-[#17191d] px-5 text-sm font-semibold text-white transition hover:bg-black"
                >
                  <Plus className="h-4 w-4" />

                  Add Leave
                </Link>

              </div>

            </div>

            {/* =================================================
                TABLE
            ================================================= */}

            <div className="overflow-x-auto">

              <table className="w-full min-w-[850px]">

                <thead>

                  <tr className="bg-[#17191d] text-left text-sm text-white">

                    <th className="px-6 py-4 font-semibold">
                      Employee
                    </th>

                    <th className="px-6 py-4 font-semibold">
                      Employee No
                    </th>

                    <th className="px-6 py-4 font-semibold">
                      Branch
                    </th>

                    <th className="px-6 py-4 font-semibold">
                      Leave Date
                    </th>

                    <th className="px-6 py-4 font-semibold">
                      Leave Type
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {filteredLeaves.length > 0 ? (
                    filteredLeaves.map(
                      (leave) => (
                        <tr
                          key={leave.id}
                          className="border-b border-gray-100 transition last:border-b-0 hover:bg-[#fffaf0]"
                        >

                          {/* EMPLOYEE */}

                          <td className="px-6 py-4">

                            <div className="flex items-center gap-3">

                              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#fff9eb] text-[#a86f00]">

                                <UserRound className="h-4 w-4" />

                              </div>

                              <div className="font-semibold text-gray-800">
                                {leave.employee}
                              </div>

                            </div>

                          </td>

                          {/* EMPLOYEE NUMBER */}

                          <td className="px-6 py-4 text-sm text-gray-600">
                            {leave.employeeNumber}
                          </td>

                          {/* BRANCH */}

                          <td className="px-6 py-4">

                            <span className="inline-flex items-center gap-2 text-sm text-gray-700">

                              <Building2 className="h-4 w-4 text-gray-400" />

                              {leave.branch}

                            </span>

                          </td>

                          {/* DATE */}

                          <td className="px-6 py-4 text-sm font-medium text-gray-700">

                            <span className="inline-flex items-center gap-2">

                              <CalendarDays className="h-4 w-4 text-gray-400" />

                              {leave.date}

                            </span>

                          </td>

                          {/* LEAVE TYPE */}

                          <td className="px-6 py-4">

                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                leave.leaveType ===
                                "Full"
                                  ? "bg-blue-50 text-blue-700"
                                  : "bg-amber-50 text-amber-700"
                              }`}
                            >
                              {leave.leaveType}
                            </span>

                          </td>

                        </tr>
                      )
                    )
                  ) : (

                    /* NO DATA */

                    <tr>

                      <td
                        colSpan={5}
                        className="px-6 py-16 text-center"
                      >

                        <div className="flex flex-col items-center">

                          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">

                            <Search className="h-6 w-6 text-gray-400" />

                          </div>

                          <h3 className="mt-4 text-base font-semibold text-gray-900">
                            No leaves found
                          </h3>

                          <p className="mt-1 text-sm text-gray-500">
                            Try changing your search or filters.
                          </p>

                        </div>

                      </td>

                    </tr>

                  )}

                </tbody>

              </table>

            </div>

            {/* =================================================
                TABLE FOOTER
            ================================================= */}

            <div className="border-t border-gray-200 bg-[#fafafa] px-6 py-4">

              <p className="text-sm text-gray-500">

                Total leave:{" "}

                <span className="font-bold text-gray-800">
                  {totalLeaveCount}
                </span>

              </p>

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