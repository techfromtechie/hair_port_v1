"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import Navbar from "@/app/components/Navbar";
import ExportTable from "@/app/components/ExportTable";
import FormSelect from "@/app/components/forms/FormSelect";

import { supabase } from "@/app/lib/supabase";
import { toast } from "react-toastify";

import {
  Plus,
  Search,
  SlidersHorizontal,
  Wallet,
  Building2,
  UserRound,
  IndianRupee,
  RotateCcw,
  ArrowLeft,
} from "lucide-react";

// =========================================================
// TYPES
// =========================================================

type PeriodFilter =
  | "all"
  | "day"
  | "week"
  | "month"
  | "year";

type Employee = {
  id: string;
  name: string;
};

type Branch = {
  id: string;
  name: string;
};

type Transaction = {
  id: string;
  employeeId: string;
  branchId: string;
  employee: string;
  branch: string;
  cash: number;
  online: number;
  date: string;
};

// =========================================================
// PAGE
// =========================================================

export default function DailyTransactionsPage() {
  // =======================================================
  // FILTER STATES
  // =======================================================

  const [search, setSearch] = useState("");

  const [period, setPeriod] =
    useState<PeriodFilter>("all");

  const [selectedBranch, setSelectedBranch] =
    useState("");

  const [showFilters, setShowFilters] =
    useState(false);

  // =======================================================
  // SUPABASE DATA
  // =======================================================

  const [employees, setEmployees] =
    useState<Employee[]>([]);

  const [branches, setBranches] =
    useState<Branch[]>([]);

  const [transactions, setTransactions] =
    useState<Transaction[]>([]);

  const [loading, setLoading] =
    useState(true);

  // =======================================================
  // FETCH DATA FROM SUPABASE
  // =======================================================

  useEffect(() => {
    const fetchTransactionData = async () => {
      try {
        setLoading(true);

        // =================================================
        // FETCH EMPLOYEES
        // =================================================

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
          console.error(
            "Employee fetch error:",
            employeeError
          );

          toast.error(
            "Failed to load employees."
          );

          return;
        }

        const formattedEmployees: Employee[] =
          (employeeData ?? []).map(
            (employee) => ({
              id: employee.id,
              name: employee.name,
            })
          );

        setEmployees(formattedEmployees);

        // =================================================
        // FETCH BRANCHES
        // =================================================

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
          console.error(
            "Branch fetch error:",
            branchError
          );

          toast.error(
            "Failed to load branches."
          );

          return;
        }

        const formattedBranches: Branch[] =
          (branchData ?? []).map(
            (branch) => ({
              id: branch.id,
              name: branch.name,
            })
          );

        setBranches(formattedBranches);

        // =================================================
        // CREATE EMPLOYEE MAP
        // =================================================

        const employeeMap =
          new Map<string, Employee>();

        formattedEmployees.forEach(
          (employee) => {
            employeeMap.set(
              employee.id,
              employee
            );
          }
        );

        // =================================================
        // CREATE BRANCH MAP
        // =================================================

        const branchMap =
          new Map<string, Branch>();

        formattedBranches.forEach(
          (branch) => {
            branchMap.set(
              branch.id,
              branch
            );
          }
        );

        // =================================================
        // FETCH TRANSACTIONS
        // =================================================

        const {
          data: transactionData,
          error: transactionError,
        } = await supabase
          .from("transactions")
          .select("*");

        if (transactionError) {
          console.error(
            "Transaction fetch error:",
            transactionError
          );

          toast.error(
            "Failed to load transactions."
          );

          return;
        }

        console.log(
          "SUPABASE TRANSACTIONS:",
          transactionData
        );

        // =================================================
        // FORMAT TRANSACTIONS
        // =================================================

        const formattedTransactions: Transaction[] =
          (transactionData ?? []).map(
            (transaction: any) => {
              const employee =
                employeeMap.get(
                  transaction.employee_id
                );

              const branch =
                branchMap.get(
                  transaction.branch_id
                );

              // =================================================
              // DATE
              // =================================================

              const transactionDate =
                transaction.transaction_date ??
                transaction.date ??
                transaction.created_at
                  ? String(
                      transaction.transaction_date ??
                        transaction.date ??
                        transaction.created_at
                    ).split("T")[0]
                  : "";

              // =================================================
              // PAYMENT AMOUNT
              //
              // Supports:
              // 1. cash + online
              // 2. amount + payment_mode
              // =================================================

              let cash = 0;
              let online = 0;

              // -----------------------------------------------
              // CASE 1:
              // Backend has cash / online
              // -----------------------------------------------

              if (
                transaction.cash !== undefined &&
                transaction.cash !== null
              ) {
                cash =
                  Number(transaction.cash) || 0;
              }

              if (
                transaction.online !== undefined &&
                transaction.online !== null
              ) {
                online =
                  Number(transaction.online) || 0;
              }

              // -----------------------------------------------
              // CASE 2:
              // Backend has amount + payment_mode
              // -----------------------------------------------

              const amount =
                Number(transaction.amount) || 0;

              const paymentMode =
                String(
                  transaction.payment_mode ??
                    transaction.paymentMode ??
                    ""
                ).toLowerCase();

              // Only use amount when cash/online
              // fields don't contain a value.
              if (
                cash === 0 &&
                online === 0 &&
                amount > 0
              ) {
                if (
                  paymentMode === "cash"
                ) {
                  cash = amount;
                } else if (
                  paymentMode === "online"
                ) {
                  online = amount;
                } else {
                  // If payment mode is missing,
                  // show amount as total.
                  cash = amount;
                }
              }

              return {
                id: transaction.id,

                employeeId:
                  transaction.employee_id ?? "",

                branchId:
                  transaction.branch_id ?? "",

                employee:
                  employee?.name ??
                  "Unknown Employee",

                branch:
                  branch?.name ??
                  "Unknown Branch",

                cash,

                online,

                date:
                  transactionDate || "",
              };
            }
          );

        // =================================================
        // SORT LATEST FIRST
        // =================================================

        formattedTransactions.sort(
          (a, b) =>
            b.date.localeCompare(
              a.date
            )
        );

        console.log(
          "FORMATTED TRANSACTIONS:",
          formattedTransactions
        );

        setTransactions(
          formattedTransactions
        );
      } catch (error) {
        console.error(
          "Unexpected transaction error:",
          error
        );

        toast.error(
          "Something went wrong while loading transactions."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTransactionData();
  }, []);

  // =======================================================
  // TODAY
  // =======================================================

  const today = new Date();

  const todayString =
    today.toISOString().split("T")[0];

  // =======================================================
  // PERIOD FILTER
  // =======================================================

  const getStartDate = (
    filter: PeriodFilter
  ) => {
    const date =
      new Date(today);

    if (filter === "day") {
      return date;
    }

    if (filter === "week") {
      date.setDate(
        date.getDate() - 6
      );

      return date;
    }

    if (filter === "month") {
      date.setMonth(
        date.getMonth() - 1
      );

      return date;
    }

    if (filter === "year") {
      date.setFullYear(
        date.getFullYear() - 1
      );

      return date;
    }

    return null;
  };

  // =======================================================
  // BRANCH COLORS
  // =======================================================

  const branchColorClasses = [
    "bg-blue-100 text-blue-700",
    "bg-green-100 text-green-700",
    "bg-purple-100 text-purple-700",
    "bg-orange-100 text-orange-700",
    "bg-pink-100 text-pink-700",
    "bg-cyan-100 text-cyan-700",
    "bg-yellow-100 text-yellow-700",
    "bg-indigo-100 text-indigo-700",
  ];

  const getBranchColor = (
    branchId: string
  ) => {
    const index =
      branches.findIndex(
        (branch) =>
          branch.id === branchId
      );

    return branchColorClasses[
      index >= 0
        ? index %
          branchColorClasses.length
        : 0
    ];
  };

  // =======================================================
  // FILTER TRANSACTIONS
  // =======================================================

  const filteredTransactions =
    useMemo(() => {
      const startDate =
        getStartDate(period);

      const searchValue =
        search
          .trim()
          .toLowerCase();

      return transactions
        .filter((transaction) => {
          // ===============================================
          // TOTAL
          // ===============================================

          const totalAmount =
            transaction.cash +
            transaction.online;

          // ===============================================
          // SEARCH
          // ===============================================

          const matchesSearch =
            !searchValue ||
            transaction.employee
              .toLowerCase()
              .includes(searchValue) ||
            String(
              totalAmount
            ).includes(searchValue);

          // ===============================================
          // BRANCH
          // ===============================================

          const matchesBranch =
            !selectedBranch ||
            transaction.branchId ===
              selectedBranch;

          // ===============================================
          // PERIOD
          // ===============================================

          const transactionDate =
            transaction.date
              ? new Date(
                  `${transaction.date}T00:00:00`
                )
              : null;

          const matchesPeriod =
            !startDate ||
            (
              period === "day"
                ? transaction.date ===
                  todayString
                : transactionDate
                  ? transactionDate >=
                    startDate
                  : false
            );

          return (
            matchesSearch &&
            matchesBranch &&
            matchesPeriod
          );
        })
        .sort((a, b) =>
          b.date.localeCompare(
            a.date
          )
        );
    }, [
      transactions,
      search,
      period,
      selectedBranch,
      todayString,
    ]);

  // =======================================================
  // TOTAL CASH
  // =======================================================

  const totalCash =
    filteredTransactions.reduce(
      (total, transaction) =>
        total +
        transaction.cash,
      0
    );

  // =======================================================
  // TOTAL ONLINE
  // =======================================================

  const totalOnline =
    filteredTransactions.reduce(
      (total, transaction) =>
        total +
        transaction.online,
      0
    );

  // =======================================================
  // TOTAL AMOUNT
  // =======================================================

  const totalAmount =
    totalCash +
    totalOnline;

  // =======================================================
  // EXPORT DATA
  // =======================================================

  const transactionExportData =
    filteredTransactions.map(
      (transaction) => ({
        employee:
          transaction.employee,

        branch:
          transaction.branch,

        date:
          transaction.date,

        cash:
          transaction.cash,

        online:
          transaction.online,

        total:
          transaction.cash +
          transaction.online,
      })
    );

  // =======================================================
  // RESET FILTERS
  // =======================================================

  const resetFilters = () => {
    setSearch("");
    setPeriod("all");
    setSelectedBranch("");
  };

  // =======================================================
  // UI
  // =======================================================

  return (
    <main className="min-h-screen bg-[#f5f6f8]">

      {/* ===================================================
          NAVBAR
      =================================================== */}

      <div className="relative bg-[#17191d]">
        <Navbar />

        <div className="h-24" />
      </div>

      {/* ===================================================
          PAGE CONTENT
      =================================================== */}

      <section className="px-5 py-10 md:px-8">

        <div className="mx-auto max-w-7xl">

          {/* =================================================
              HEADER
          ================================================= */}

          <div className="mb-8">

            <div className="flex items-center gap-3">

              {/* BACK BUTTON */}

              <Link
                href="/management/admin"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition hover:border-[#f5b942] hover:bg-[#fff9eb] hover:text-[#a86f00]"
                title="Back to Admin Dashboard"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>

              {/* GOLD LINE */}

              <div className="h-8 w-1 rounded-full bg-[#f5b942]" />

              {/* TITLE */}

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
                    setSearch(
                      e.target.value
                    )
                  }
                  placeholder="Search employee name or amount..."
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

              {/* RESET BUTTON */}

              <button
                type="button"
                onClick={
                  resetFilters
                }
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

                <div>

                  <FormSelect
                    label="Branch"
                    value={
                      selectedBranch
                    }
                    onChange={(e) =>
                      setSelectedBranch(
                        e.target.value
                      )
                    }
                    options={[
                      {
                        label:
                          "All Branches",
                        value: "",
                      },

                      ...branches.map(
                        (branch) => ({
                          label:
                            branch.name,
                          value:
                            branch.id,
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
                  data={
                    transactionExportData
                  }
                  columns={[
                    {
                      header:
                        "Employee",
                      key:
                        "employee",
                    },
                    {
                      header:
                        "Branch",
                      key:
                        "branch",
                    },
                    {
                      header:
                        "Date",
                      key:
                        "date",
                    },
                    {
                      header:
                        "Cash",
                      key:
                        "cash",
                    },
                    {
                      header:
                        "Online",
                      key:
                        "online",
                    },
                    {
                      header:
                        "Total",
                      key:
                        "total",
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

            {/* TABLE */}

            <div className="overflow-x-auto">

              <table className="w-full min-w-[850px]">

                {/* TABLE HEAD */}

                <thead>

                  <tr className="bg-[#17191d] text-left text-sm text-white">

                    <th className="px-6 py-4 font-semibold">
                      Employee
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

                {/* TABLE BODY */}

                <tbody>

                  {/* LOADING */}

                  {loading ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-16 text-center"
                      >
                        <div className="flex flex-col items-center">

                          <div className="h-9 w-9 animate-spin rounded-full border-4 border-gray-200 border-t-[#f5b942]" />

                          <p className="mt-4 text-sm font-medium text-gray-500">
                            Loading transactions...
                          </p>

                        </div>
                      </td>
                    </tr>
                  ) : filteredTransactions.length > 0 ? (

                    /* TRANSACTIONS */

                    filteredTransactions.map(
                      (transaction) => {

                        const total =
                          transaction.cash +
                          transaction.online;

                        return (
                          <tr
                            key={
                              transaction.id
                            }
                            className="border-b border-gray-100 transition last:border-b-0 hover:bg-[#fffaf0]"
                          >

                            {/* EMPLOYEE */}

                            <td className="px-6 py-4">

                              <div className="flex items-center gap-3">

                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
                                  <UserRound className="h-4 w-4" />
                                </div>

                                <div className="font-semibold text-gray-800">
                                  {
                                    transaction.employee
                                  }
                                </div>

                              </div>

                            </td>

                            {/* BRANCH */}

                            <td className="px-6 py-4">

                              <span
                                className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${getBranchColor(
                                  transaction.branchId
                                )}`}
                              >

                                <Building2 className="h-3.5 w-3.5" />

                                {
                                  transaction.branch
                                }

                              </span>

                            </td>

                            {/* DATE */}

                            <td className="px-6 py-4 text-sm font-medium text-gray-700">

                              {transaction.date
                                ? new Date(
                                    `${transaction.date}T00:00:00`
                                  ).toLocaleDateString(
                                    "en-IN"
                                  )
                                : "-"}

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
                        colSpan={6}
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

            {/* TABLE FOOTER */}

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