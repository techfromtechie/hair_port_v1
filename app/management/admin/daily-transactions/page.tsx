"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import Navbar from "@/app/components/Navbar";
import ExportTable from "@/app/components/ExportTable";
import FormSelect from "@/app/components/forms/FormSelect";

import { branches, transactions } from "@/app/data/transactionData";

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

export default function DailyTransactionsPage() {
  // =========================================================
  // FILTER STATES
  // =========================================================

  const [search, setSearch] = useState("");
  const [period, setPeriod] = useState<PeriodFilter>("all");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // =========================================================
  // TODAY
  // =========================================================

  const today = new Date();
  const todayString = today.toISOString().split("T")[0];

  // =========================================================
  // PERIOD FILTER
  // =========================================================

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

  // =========================================================
  // FILTER TRANSACTIONS
  // =========================================================

  const filteredTransactions = useMemo(() => {
    const startDate = getStartDate(period);
    const searchValue = search.trim().toLowerCase();

    return transactions
      .filter((transaction) => {
        const totalAmount =
          transaction.cash + transaction.online;

        // SEARCH
        const matchesSearch =
          !searchValue ||
          transaction.employee
            .toLowerCase()
            .includes(searchValue) ||
          transaction.employeeNumber
            .toLowerCase()
            .includes(searchValue) ||
          String(totalAmount).includes(searchValue);

        // BRANCH
        const matchesBranch =
          !selectedBranch ||
          transaction.branch === selectedBranch;

        // PERIOD
        const transactionDate = new Date(
          `${transaction.date}T00:00:00`
        );

        const matchesPeriod =
          !startDate ||
          (period === "day"
            ? transaction.date === todayString
            : transactionDate >= startDate);

        return (
          matchesSearch &&
          matchesBranch &&
          matchesPeriod
        );
      })
      .sort((a, b) =>
        b.date.localeCompare(a.date)
      );
  }, [search, period, selectedBranch, todayString]);

  // =========================================================
  // TOTAL CALCULATIONS
  // =========================================================

  const totalCash = filteredTransactions.reduce(
    (total, transaction) =>
      total + transaction.cash,
    0
  );

  const totalOnline = filteredTransactions.reduce(
    (total, transaction) =>
      total + transaction.online,
    0
  );

  const totalAmount = totalCash + totalOnline;

  // =========================================================
  // EXPORT DATA
  // =========================================================

  const transactionExportData =
    filteredTransactions.map((transaction) => ({
      employee: transaction.employee,
      employeeNumber:
        transaction.employeeNumber,
      branch: transaction.branch,
      date: transaction.date,
      cash: transaction.cash,
      online: transaction.online,
      total:
        transaction.cash +
        transaction.online,
    }));

  // =========================================================
  // RESET FILTERS
  // =========================================================

  const resetFilters = () => {
    setSearch("");
    setPeriod("all");
    setSelectedBranch("");
  };

  // =========================================================
  // UI
  // =========================================================

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

          <div className="mb-8">
            <div className="flex items-center gap-3">

              <div className="h-8 w-1 rounded-full bg-[#f5b942]" />

              <h1 className="text-3xl font-bold tracking-tight text-[#17191d] md:text-4xl">
                Daily Transactions
              </h1>

            </div>

            <p className="ml-4 mt-3 text-base text-gray-500">
              View and manage employee transaction payments.
            </p>
          </div>

          {/* =================================================
              FILTER SECTION
          ================================================= */}

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
                    setSearch(e.target.value)
                  }
                  placeholder="Search employee name, employee number or amount..."
                  className="h-11 w-full rounded-lg border border-gray-200 bg-gray-50 pl-11 pr-4 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-[#d59618] focus:bg-white focus:ring-2 focus:ring-[#f5b942]/20"
                />

              </div>

              {/* FILTER BUTTON */}

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

              {/* RESET BUTTON */}

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

                <div>

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

              </div>
            )}

          </div>

          {/* =================================================
              SUMMARY CARDS
          ================================================= */}

          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

            {/* RECENT TRANSACTIONS */}

            <SummaryCard
              title="Recent Transactions"
              value={filteredTransactions.length.toString()}
              subtitle="Filtered records"
              icon={
                <UserRound className="h-5 w-5" />
              }
              iconClass="bg-blue-50 text-blue-600"
            />

            {/* TOTAL AMOUNT */}

            <SummaryCard
              title="Total Amount"
              value={`₹${totalAmount.toLocaleString(
                "en-IN"
              )}`}
              subtitle="Cash + Online"
              icon={
                <Wallet className="h-5 w-5" />
              }
              iconClass="bg-amber-50 text-[#d59618]"
            />

            {/* CASH */}

            <SummaryCard
              title="Cash"
              value={`₹${totalCash.toLocaleString(
                "en-IN"
              )}`}
              subtitle="Cash payments"
              icon={
                <IndianRupee className="h-5 w-5" />
              }
              iconClass="bg-green-50 text-green-600"
            />

            {/* ONLINE */}

            <SummaryCard
              title="Online"
              value={`₹${totalOnline.toLocaleString(
                "en-IN"
              )}`}
              subtitle="Online payments"
              icon={
                <Wallet className="h-5 w-5" />
              }
              iconClass="bg-violet-50 text-violet-600"
            />

          </div>

          {/* =================================================
              TRANSACTION TABLE
          ================================================= */}

          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

            {/* TABLE HEADER */}

            <div className="flex flex-col gap-4 border-b border-gray-200 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">

              <div>

                <h2 className="text-lg font-bold text-[#17191d]">
                  Recent Daily Transactions
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Transaction payment history based on the selected filters.
                </p>

              </div>

              {/* ACTIONS */}

              <div className="flex flex-wrap gap-3">

                {/* EXPORT */}

                <ExportTable
                  data={transactionExportData}
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
                  fileName="Daily-Transactions"
                  disabled={
                    !filteredTransactions.length
                  }
                />

                {/* ADD TRANSACTION */}

                <Link
                  href="/transaction/add"
                  className="inline-flex h-11 items-center gap-2 rounded-lg bg-[#17191d] px-5 text-sm font-semibold text-white transition hover:bg-black"
                >
                  <Plus className="h-4 w-4" />

                  Add Transaction
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
                      Date
                    </th>

                    <th className="px-6 py-4 text-right font-semibold">
                      Cash
                    </th>

                    <th className="px-6 py-4 text-right font-semibold">
                      Online
                    </th>

                    <th className="px-6 py-4 text-right font-semibold">
                      Total
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {filteredTransactions.length > 0 ? (
                    filteredTransactions.map(
                      (transaction) => {

                        const total =
                          transaction.cash +
                          transaction.online;

                        return (
                          <tr
                            key={transaction.id}
                            className="border-b border-gray-100 transition last:border-b-0 hover:bg-[#fffaf0]"
                          >

                            {/* EMPLOYEE */}

                            <td className="px-6 py-4">

                              <div className="font-semibold text-gray-800">
                                {transaction.employee}
                              </div>

                            </td>

                            {/* EMPLOYEE NUMBER */}

                            <td className="px-6 py-4 text-sm text-gray-600">
                              {transaction.employeeNumber}
                            </td>

                            {/* BRANCH */}

                            <td className="px-6 py-4">

                              <span className="inline-flex items-center gap-2 text-sm text-gray-700">

                                <Building2 className="h-4 w-4 text-gray-400" />

                                {transaction.branch}

                              </span>

                            </td>

                            {/* DATE */}

                            <td className="px-6 py-4 text-sm font-medium text-gray-700">
                              {transaction.date}
                            </td>

                            {/* CASH */}

                            <td className="px-6 py-4 text-right text-sm font-medium text-gray-700">
                              ₹
                              {transaction.cash.toLocaleString(
                                "en-IN"
                              )}
                            </td>

                            {/* ONLINE */}

                            <td className="px-6 py-4 text-right text-sm font-medium text-gray-700">
                              ₹
                              {transaction.online.toLocaleString(
                                "en-IN"
                              )}
                            </td>

                            {/* TOTAL */}

                            <td className="px-6 py-4 text-right text-sm font-bold text-[#17191d]">
                              ₹
                              {total.toLocaleString(
                                "en-IN"
                              )}
                            </td>

                          </tr>
                        );
                      }
                    )
                  ) : (

                    /* NO DATA */

                    <tr>

                      <td
                        colSpan={7}
                        className="px-6 py-16 text-center"
                      >

                        <div className="flex flex-col items-center">

                          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">

                            <Search className="h-6 w-6 text-gray-400" />

                          </div>

                          <h3 className="mt-4 text-base font-semibold text-gray-900">
                            No transactions found
                          </h3>

                          <p className="mt-1 text-sm text-gray-500">
                            Try changing your search or filter.
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

                Total transaction amount:{" "}

                <span className="font-bold text-gray-800">
                  ₹
                  {totalAmount.toLocaleString(
                    "en-IN"
                  )}
                </span>

              </p>

            </div>

          </div>

        </div>
      </section>
    </main>
  );
}

// =============================================================
// SUMMARY CARD COMPONENT
// =============================================================

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