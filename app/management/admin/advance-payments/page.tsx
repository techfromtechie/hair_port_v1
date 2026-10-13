"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import Navbar from "@/app/components/Navbar";
import ExportTable from "@/app/components/ExportTable";
import FormSelect from "@/app/components/forms/FormSelect";
import Loader from "@/app/components/Loader";

import { supabase } from "@/app/lib/supabase";
import { toast } from "react-toastify";

import {
  Plus,
  Wallet,
  Building2,
  UserRound,
  IndianRupee,
  RotateCcw,
  ArrowLeft,
} from "lucide-react";

type PeriodFilter = "all" | "day" | "week" | "month" | "year";

type Employee = {
  id: string;
  name: string;
};

type Branch = {
  id: string;
  name: string;
};

type Advance = {
  id: string;
  employeeId: string;
  branchId: string;
  employee: string;
  branch: string;
  cash: number;
  online: number;
  description: string;
  date: string;
};

export default function AdvancePaymentsPage() {
  const [period, setPeriod] = useState<PeriodFilter>("all");
  const [selectedBranch, setSelectedBranch] = useState("");

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [advances, setAdvances] = useState<Advance[]>([]);

  const [loading, setLoading] = useState(true);

  // =========================================================
  // FETCH DATA FROM SUPABASE
  // =========================================================

  useEffect(() => {
  let cancelled = false;

  const fetchAdvanceData = async () => {
    setLoading(true);

    try {
      // 1. Fetch employees
      const {
        data: employeeData,
        error: employeeError,
      } = await supabase
        .from("employees")
        .select("id, name");

      if (employeeError) {
        throw new Error(
          `Employees fetch failed: ${employeeError.message}`
        );
      }

      // 2. Fetch branches
      const {
        data: branchData,
        error: branchError,
      } = await supabase
        .from("branches")
        .select("id, name");

      if (branchError) {
        throw new Error(
          `Branches fetch failed: ${branchError.message}`
        );
      }

      // 3. Fetch advance payments
      // Select all columns to avoid assuming the date column name.
      // 3. Fetch advance payments from Supabase
const {
  data: advanceData,
  error: advanceError,
  count: advanceCount,
} = await supabase
  .from("advance_payments")
  .select(
    "id, employee_id, branch_id, cash, online, description, advance_date",
    { count: "exact" }
  )
  .order("advance_date", { ascending: false });

console.log("[Advance Payments] Supabase row count:", advanceCount);
console.log("[Advance Payments] Fetch error:", advanceError);
console.log("[Advance Payments] First row:", advanceData?.[0]);

if (advanceError) {
  throw new Error(
    `Advance payments fetch failed: ${advanceError.message}`
  );
}

      // 4. Create employee lookup map
      const employeeMap = new Map<string, string>(
        (employeeData ?? []).map((employee: any) => [
          String(employee.id),
          employee.name ?? "Unknown Employee",
        ])
      );

      // 5. Create branch lookup map
      const branchMap = new Map<string, string>(
        (branchData ?? []).map((branch: any) => [
          String(branch.id),
          branch.name ?? "Unknown Branch",
        ])
      );

      // 6. Format advance payments
      const formattedAdvances: Advance[] = (
        advanceData ?? []
      ).map((row: any) => {
        const employeeId = String(
          row.employee_id ?? row.employeeId ?? ""
        );

        const branchId = String(
          row.branch_id ?? row.branchId ?? ""
        );

        // Support common date-column naming conventions.
        const rawDate =
          row.advance_date ??
          row.date ??
          row.payment_date ??
          row.created_at ??
          "";

        const normalizedDate = rawDate
          ? String(rawDate).slice(0, 10)
          : "";

        return {
          id: String(row.id),

          employeeId,
          branchId,

          employee:
            employeeMap.get(employeeId) ??
            row.employee_name ??
            row.employee ??
            "Unknown Employee",

          branch:
            branchMap.get(branchId) ??
            row.branch_name ??
            row.branch ??
            "Unknown Branch",

          cash: Number(row.cash ?? 0),

          online: Number(
            row.online ??
            row.online_amount ??
            0
          ),

          description: String(
            row.description ??
            row.remarks ??
            ""
          ),

          date: normalizedDate,
        };
      });

      if (cancelled) return;

      // 7. Update state
      setEmployees(
        (employeeData ?? []).map((employee: any) => ({
          id: String(employee.id),
          name: employee.name ?? "",
        }))
      );

      setBranches(
        (branchData ?? []).map((branch: any) => ({
          id: String(branch.id),
          name: branch.name ?? "",
        }))
      );

      setAdvances(formattedAdvances);

      console.log(
        `Total advance payment records: ${formattedAdvances.length}`
      );
    } catch (error: any) {
      console.error(
        "Advance payments loading error:",
        error
      );

      if (!cancelled) {
        toast.error(
          error?.message ??
            "Failed to load advance payments."
        );
      }
    } finally {
      if (!cancelled) {
        setLoading(false);
      }
    }
  };

  fetchAdvanceData();

  return () => {
    cancelled = true;
  };
}, []);



  // =========================================================
  // TODAY
  // =========================================================

  const today = new Date();

  // =========================================================
  // GET START DATE
  // =========================================================

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

  // =========================================================
  // BRANCH COLORS
  // =========================================================

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
    const index = branches.findIndex(
      (branch) => branch.id === branchId
    );

    return branchColorClasses[
      index >= 0
        ? index % branchColorClasses.length
        : 0
    ];
  };

  // =========================================================
  // FILTER ADVANCES
  // =========================================================


const filteredAdvances = useMemo(() => {
  const startDate = getStartDate(period);

  return advances
    .filter((advance) => {
      const matchesBranch =
        !selectedBranch ||
        advance.branchId === selectedBranch;

      const advanceDate = advance.date
        ? new Date(`${advance.date}T00:00:00`)
        : null;

      const matchesPeriod =
        !startDate ||
        (advanceDate !== null &&
          !Number.isNaN(advanceDate.getTime()) &&
          advanceDate >= new Date(
            startDate.getFullYear(),
            startDate.getMonth(),
            startDate.getDate()
          ));

      return matchesBranch && matchesPeriod;
    })
    .sort((a, b) => b.date.localeCompare(a.date));
}, [advances, period, selectedBranch]);


  // =========================================================
  // TOTAL ADVANCE
  // =========================================================

  const totalAdvance =
    filteredAdvances.reduce(
      (total, advance) =>
        total +
        advance.cash +
        advance.online,
      0
    );

  // =========================================================
  // TOTAL CASH
  // =========================================================

  const totalCash =
    filteredAdvances.reduce(
      (total, advance) =>
        total + advance.cash,
      0
    );

  // =========================================================
  // TOTAL ONLINE
  // =========================================================

  const totalOnline =
    filteredAdvances.reduce(
      (total, advance) =>
        total + advance.online,
      0
    );

  // =========================================================
  // EXPORT DATA
  // =========================================================

  const exportData =
    filteredAdvances.map((advance) => ({
      employee: advance.employee,
      description: advance.description,
      branch: advance.branch,
      date: advance.date,
      cash: advance.cash,
      online: advance.online,
      total:
        advance.cash +
        advance.online,
    }));

  // =========================================================
  // RESET FILTERS
  // =========================================================

  const resetFilters = () => {
    setPeriod("all");
    setSelectedBranch("");
  };

  // =========================================================
  // PAGE
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
          LOADER
      ===================================================== */}

      {loading ? (
        <Loader
          text="Loading advance payments..."
          fullScreen
        />
      ) : (
        <section className="px-5 py-8 md:px-8">

          <div className="mx-auto max-w-7xl">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

              <div>

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

                  {/* PAGE TITLE */}

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

            {/* =================================================
                FILTERS
            ================================================= */}

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

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
                    className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none transition focus:border-[#d59618] focus:ring-2 focus:ring-[#f5b942]/20"
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
                          label: branch.name,
                          value: branch.id,
                        })
                      ),
                    ]}
                  />

                </div>

              </div>

            </div>

            {/* =================================================
                SUMMARY CARDS
            ================================================= */}

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

              <SummaryCard
                icon={
                  <Wallet className="h-5 w-5" />
                }
                title="Recent Advances"
                value={filteredAdvances.length.toString()}
                subtitle="Payments found"
                iconClass="bg-amber-50 text-amber-600"
              />

              <SummaryCard
                icon={
                  <IndianRupee className="h-5 w-5" />
                }
                title="Total Advance"
                value={`₹${totalAdvance.toLocaleString(
                  "en-IN"
                )}`}
                subtitle="Filtered amount"
                iconClass="bg-emerald-50 text-emerald-600"
              />

              <SummaryCard
                icon={
                  <Wallet className="h-5 w-5" />
                }
                title="Cash"
                value={`₹${totalCash.toLocaleString(
                  "en-IN"
                )}`}
                subtitle="Cash advances"
                iconClass="bg-blue-50 text-blue-600"
              />

              <SummaryCard
                icon={
                  <Building2 className="h-5 w-5" />
                }
                title="Online"
                value={`₹${totalOnline.toLocaleString(
                  "en-IN"
                )}`}
                subtitle="Online advances"
                iconClass="bg-violet-50 text-violet-600"
              />

            </div>

            {/* =================================================
                TABLE HEADER
            ================================================= */}

            <div className="mt-8 mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <h2 className="text-lg font-bold text-[#17191d]">
                  Recent Advance Payments
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Latest employee advance payment records.
                </p>

              </div>

              {/* RESET + EXPORT */}

              <div className="flex items-center gap-3">

                {/* RESET */}

                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-[#f5b942] hover:bg-[#fff9eb] hover:text-gray-900"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </button>

                {/* EXPORT */}

                <ExportTable
                  data={exportData}
                  columns={[
                    {
                      header: "Employee",
                      key: "employee",
                    },
                    {
                      header: "Description",
                      key: "description",
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

            </div>

            {/* =================================================
                TABLE
            ================================================= */}

            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

              <div className="overflow-x-auto">

                <table className="w-full min-w-[850px] text-left">

                  {/* =================================================
                      TABLE HEAD
                  ================================================= */}

                  <thead className="border-b border-gray-200 bg-[#fafafa]">

                    <tr>

                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-500">
                        Employee
                      </th>

                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-500">
                        Description
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

                  {/* =================================================
                      TABLE BODY
                  ================================================= */}

                  <tbody className="divide-y divide-gray-100">

                    {filteredAdvances.length > 0 ? (

                      filteredAdvances.map(
                        (advance, index) => (

                          <tr
                            key={`${advance.id}-${advance.date}-${index}`}
                            className="transition hover:bg-[#fffaf0]"
                          >

                            {/* =================================================
                                EMPLOYEE
                            ================================================= */}

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

                            {/* =================================================
                                DESCRIPTION
                            ================================================= */}

                            <td className="px-6 py-4 text-sm text-gray-600">
                              {advance.description || "-"}
                            </td>

                            {/* =================================================
                                BRANCH
                            ================================================= */}

                            <td className="px-6 py-4">

                              <span
                                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getBranchColor(
                                  advance.branchId
                                )}`}
                              >
                                {advance.branch}
                              </span>

                            </td>

                            {/* =================================================
                                DATE
                            ================================================= */}

                            <td className="px-6 py-4 text-sm text-gray-600">

                              
{advance.date &&
!Number.isNaN(
  Date.parse(`${advance.date}T00:00:00`)
)
  ? new Date(
      `${advance.date}T00:00:00`
    ).toLocaleDateString("en-IN")
  : "-"}


                            </td>

                            {/* =================================================
                                CASH
                            ================================================= */}

                            <td className="px-6 py-4 text-sm font-medium text-gray-700">

                              ₹
                              {advance.cash.toLocaleString(
                                "en-IN"
                              )}

                            </td>

                            {/* =================================================
                                ONLINE
                            ================================================= */}

                            <td className="px-6 py-4 text-sm font-medium text-gray-700">

                              ₹
                              {advance.online.toLocaleString(
                                "en-IN"
                              )}

                            </td>

                            {/* =================================================
                                TOTAL
                            ================================================= */}

                            <td className="px-6 py-4 text-right text-sm font-bold text-[#17191d]">

                              ₹
                              {(
                                advance.cash +
                                advance.online
                              ).toLocaleString(
                                "en-IN"
                              )}

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
                            Try changing your filters.
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
      )}

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