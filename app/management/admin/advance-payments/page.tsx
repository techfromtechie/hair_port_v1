"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import ExportTable from "@/app/components/ExportTable";
import FormSelect from "@/app/components/forms/FormSelect";

import { advances, branches } from "@/app/data/advanceData";

import {
  Plus,
  Search,
  SlidersHorizontal,
  Wallet,
  Building2,
  UserRound,
  IndianRupee,
  RotateCcw,
} from "lucide-react";

type PeriodFilter = "all" | "day" | "week" | "month" | "year";

export default function AdvancePaymentsPage() {
  const [search, setSearch] = useState("");
  const [period, setPeriod] = useState<PeriodFilter>("all");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const today = new Date();

  const getStartDate = (filter: PeriodFilter) => {
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

  const filteredAdvances = useMemo(() => {
    const startDate = getStartDate(period);

    return advances
      .filter((advance) => {
        /*
         * SEARCH
         * Employee name
         * Employee number
         * Advance amount
         */
        const searchValue = search.trim().toLowerCase();

        const totalAmount = advance.cash + advance.online;

        const matchesSearch =
          !searchValue ||
          advance.employee.toLowerCase().includes(searchValue) ||
          advance.employeeNumber
            .toLowerCase()
            .includes(searchValue) ||
          String(totalAmount).includes(searchValue);

        /*
         * BRANCH FILTER
         */
        const matchesBranch =
          !selectedBranch || advance.branch === selectedBranch;

        /*
         * PERIOD FILTER
         */
        const advanceDate = new Date(`${advance.date}T00:00:00`);

        const matchesPeriod =
          !startDate || advanceDate >= startDate;

        return (
          matchesSearch &&
          matchesBranch &&
          matchesPeriod
        );
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [search, period, selectedBranch]);

  /*
   * =========================
   * TOTALS
   * =========================
   */

  const totalAdvance = filteredAdvances.reduce(
    (total, advance) =>
      total + advance.cash + advance.online,
    0
  );

  const totalCash = filteredAdvances.reduce(
    (total, advance) =>
      total + advance.cash,
    0
  );

  const totalOnline = filteredAdvances.reduce(
    (total, advance) =>
      total + advance.online,
    0
  );

  /*
   * =========================
   * EXPORT DATA
   * =========================
   */

  const exportData = filteredAdvances.map((advance) => ({
    employee: advance.employee,
    employeeNumber: advance.employeeNumber,
    branch: advance.branch,
    date: advance.date,
    cash: advance.cash,
    online: advance.online,
    total: advance.cash + advance.online,
  }));

  /*
   * =========================
   * RESET
   * =========================
   */

  const resetFilters = () => {
    setSearch("");
    setPeriod("all");
    setSelectedBranch("");
  };

  return (
    <main className="min-h-screen bg-[#f5f6f8]">

      {/* ================= NAVBAR ================= */}

      <div className="relative bg-[#17191d]">
        <Navbar />
        <div className="h-24" />
      </div>

      {/* ================= PAGE ================= */}

      <section className="px-5 py-8 md:px-8">

        <div className="mx-auto max-w-7xl">

          {/* ================= HEADER ================= */}

          <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            <div>

              <div className="flex items-center gap-3">

                <div className="h-8 w-1 rounded-full bg-[#f5b942]" />

                <h1 className="text-3xl font-bold tracking-tight text-[#17191d]">
                  Advance Payments
                </h1>

              </div>

              <p className="mt-2 ml-4 text-sm text-gray-500">
                View and manage recent employee advance payments.
              </p>

            </div>

            {/* ADD ADVANCE */}

            <Link
              href="/advance/add"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#17191d] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-black"
            >
              <Plus className="h-4 w-4" />

              Add Advance
            </Link>

          </div>

          {/* ================= SEARCH + FILTER ================= */}

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

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
                  placeholder="Search employee name, employee number or amount..."
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
                    setSelectedBranch(e.target.value)
                  }
                  options={[
                    {
                      label: "All Branches",
                      value: "",
                    },

                    ...branches.map((branch) => ({
                      label: branch,
                      value: branch,
                    })),
                  ]}
                />

              </div>
            )}

          </div>

          {/* ================= SUMMARY CARDS ================= */}

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

            <SummaryCard
              icon={<Wallet className="h-5 w-5" />}
              title="Recent Advances"
              value={filteredAdvances.length.toString()}
              subtitle="Payments found"
              iconClass="bg-amber-50 text-amber-600"
            />

            <SummaryCard
              icon={<IndianRupee className="h-5 w-5" />}
              title="Total Advance"
              value={`₹${totalAdvance.toLocaleString("en-IN")}`}
              subtitle="Filtered amount"
              iconClass="bg-emerald-50 text-emerald-600"
            />

            <SummaryCard
              icon={<Wallet className="h-5 w-5" />}
              title="Cash"
              value={`₹${totalCash.toLocaleString("en-IN")}`}
              subtitle="Cash advances"
              iconClass="bg-blue-50 text-blue-600"
            />

            <SummaryCard
              icon={<Building2 className="h-5 w-5" />}
              title="Online"
              value={`₹${totalOnline.toLocaleString("en-IN")}`}
              subtitle="Online advances"
              iconClass="bg-violet-50 text-violet-600"
            />

          </div>

          {/* ================= TABLE HEADER ================= */}

          <div className="mt-8 mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <h2 className="text-lg font-bold text-[#17191d]">
                Recent Advance Payments
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Latest employee advance payment records.
              </p>

            </div>

            {/* EXISTING EXPORT COMPONENT */}

            <ExportTable
              data={exportData}
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
                  header: "Cash",
                  key: "cash",
                },
                {
                  header: "Online",
                  key: "online",
                },
                {
                  header: "Total",
                  key: "total",
                },
              ]}
              fileName="advance-payments"
              disabled={!filteredAdvances.length}
            />

          </div>

          {/* ================= TABLE ================= */}

          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

            <div className="overflow-x-auto">

              <table className="w-full min-w-[850px] text-left">

                <thead className="border-b border-gray-200 bg-[#fafafa]">

                  <tr>

                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-500">
                      Employee
                    </th>

                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-500">
                      Employee No
                    </th>

                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-500">
                      Branch
                    </th>

                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-500">
                      Date
                    </th>

                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-500">
                      Cash
                    </th>

                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-500">
                      Online
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wide text-gray-500">
                      Total
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-gray-100">

                  {filteredAdvances.length > 0 ? (

                    filteredAdvances.map(
                      (advance, index) => (

                        <tr
                          key={`${advance.employeeNumber}-${advance.date}-${index}`}
                          className="transition hover:bg-[#fffaf0]"
                        >

                          {/* EMPLOYEE */}

                          <td className="px-6 py-4">

                            <div className="flex items-center gap-3">

                              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
                                <UserRound className="h-4 w-4" />
                              </div>

                              <span className="text-sm font-semibold text-[#17191d]">
                                {advance.employee}
                              </span>

                            </div>

                          </td>

                          {/* EMPLOYEE NUMBER */}

                          <td className="px-6 py-4 text-sm text-gray-600">
                            {advance.employeeNumber}
                          </td>

                          {/* BRANCH */}

                          <td className="px-6 py-4">

                            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                              {advance.branch}
                            </span>

                          </td>

                          {/* DATE */}

                          <td className="px-6 py-4 text-sm text-gray-600">
                            {new Date(
                              `${advance.date}T00:00:00`
                            ).toLocaleDateString("en-IN")}
                          </td>

                          {/* CASH */}

                          <td className="px-6 py-4 text-sm font-medium text-gray-700">
                            ₹
                            {advance.cash.toLocaleString(
                              "en-IN"
                            )}
                          </td>

                          {/* ONLINE */}

                          <td className="px-6 py-4 text-sm font-medium text-gray-700">
                            ₹
                            {advance.online.toLocaleString(
                              "en-IN"
                            )}
                          </td>

                          {/* TOTAL */}

                          <td className="px-6 py-4 text-right text-sm font-bold text-[#17191d]">
                            ₹
                            {(
                              advance.cash +
                              advance.online
                            ).toLocaleString("en-IN")}
                          </td>

                        </tr>

                      )
                    )

                  ) : (

                    <tr>

                      <td
                        colSpan={7}
                        className="px-6 py-16 text-center"
                      >

                        <Wallet className="mx-auto h-10 w-10 text-gray-300" />

                        <p className="mt-3 text-sm font-semibold text-gray-600">
                          No advance payments found
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                          Try changing your search or filters.
                        </p>

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

/* =========================================================
   REUSABLE SUMMARY CARD
========================================================= */

function SummaryCard({
  icon,
  title,
  value,
  subtitle,
  iconClass,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  subtitle: string;
  iconClass: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

      <div className="flex items-start justify-between">

        <div>

          <p className="text-sm font-medium text-gray-500">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold text-[#17191d]">
            {value}
          </p>

          <p className="mt-1 text-xs text-gray-400">
            {subtitle}
          </p>

        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}
        >
          {icon}
        </div>

      </div>

    </div>
  );
}