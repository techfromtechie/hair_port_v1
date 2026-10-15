"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import Navbar from "@/app/components/Navbar";
import { ArrowLeft } from "lucide-react";
import EditButton from "@/app/components/EditButton";
import ExportTable from "@/app/components/ExportTable";
import Loader from "@/app/components/Loader";
import { supabase } from "@/app/lib/supabase";
import { toast } from "react-toastify";

type Employee = {
  id: string;
  name: string;
  branchId: string;
};

type Branch = {
  id: string;
  name: string;
};

type PaymentMode = "Cash" | "Online" | "Other";

type Transaction = {
  id: string;
  employeeId: string;
  branchId: string;
  employee: string;
  branch: string;
  service: string;
  amount: number;
  paymentMode: PaymentMode;
  description: string;
  date: string;
  cash: number;
  online: number;
  other: number;
};

export default function TransactionReportPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [userRole, setUserRole] = useState<"admin" | "branch_manager" | null>(null);
const [managerBranchId, setManagerBranchId] = useState("");

  const [loading, setLoading] = useState(true);

  const [reportType, setReportType] = useState<"employee" | "branch">(
    "employee"
  );

  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // =========================
  // FETCH ALL DATA
  // =========================

  
const fetchTransactionData = async () => {
  try {
    setLoading(true);

    // 1. Get logged-in user's role
    const { data: roles, error: roleError } =
      await supabase.rpc("get_my_role");

    if (roleError) throw roleError;

    const profile = roles?.[0];

    if (!profile) {
      throw new Error("User role not found. Please contact Admin.");
    }

    if (
      profile.role !== "admin" &&
      profile.role !== "branch_manager"
    ) {
      throw new Error("You are not authorized to view transactions.");
    }

    setUserRole(profile.role);

    let branchId = "";

    // 2. Find Branch Manager's assigned branch
    if (profile.role === "branch_manager") {
      if (!profile.employee_id) {
        throw new Error("Manager employee record not found.");
      }

      const { data: manager, error: managerError } =
        await supabase
          .from("employees")
          .select("branch_id")
          .eq("id", profile.employee_id)
          .single();

      if (managerError) throw managerError;

      if (!manager?.branch_id) {
        throw new Error("Manager branch not found.");
      }

      branchId = manager.branch_id;

      setManagerBranchId(branchId);
      setSelectedBranch(branchId);
    } else {
      setManagerBranchId("");
    }

    // 3. Prepare queries according to role
    let employeeQuery = supabase
      .from("employees")
      .select("id, name, branch_id")
      .order("name", { ascending: true });

    let branchQuery = supabase
      .from("branches")
      .select("id, name")
      .order("name", { ascending: true });

    let transactionQuery = supabase
      .from("transactions")
      .select(`
        id,
        employee_id,
        branch_id,
        service,
        amount,
        payment_mode,
        cash,
        online,
        other,
        description,
        transaction_date,
        created_at
      `)
      .order("created_at", { ascending: false });

    // 4. Restrict queries to the manager's branch
    if (profile.role === "branch_manager") {
      employeeQuery = employeeQuery.eq("branch_id", branchId);
      branchQuery = branchQuery.eq("id", branchId);
      transactionQuery = transactionQuery.eq("branch_id", branchId);
    }

    // 5. Fetch only permitted data
    const [
      { data: employeeData, error: employeeError },
      { data: branchData, error: branchError },
      { data: transactionData, error: transactionError },
    ] = await Promise.all([
      employeeQuery,
      branchQuery,
      transactionQuery,
    ]);

    if (employeeError) throw employeeError;
    if (branchError) throw branchError;
    if (transactionError) throw transactionError;

    const formattedEmployees: Employee[] = (employeeData || []).map(
      (employee) => ({
        id: employee.id,
        name: employee.name,
        branchId: employee.branch_id,
      })
    );

    const formattedBranches: Branch[] = (branchData || []).map(
      (branch) => ({
        id: branch.id,
        name: branch.name,
      })
    );

    const formattedTransactions: Transaction[] = (
      transactionData || []
    ).map((transaction) => {
      const employee = formattedEmployees.find(
        (item) => item.id === transaction.employee_id
      );

      const branch = formattedBranches.find(
        (item) => item.id === transaction.branch_id
      );

      const amount = Number(transaction.amount || 0);
      const paymentMode = transaction.payment_mode || "Other";

      return {
        id: transaction.id,
        employeeId: transaction.employee_id,
        branchId: transaction.branch_id,
        employee: employee?.name || "Unknown Employee",
        branch: branch?.name || "Unknown Branch",
        service: transaction.service || "",
        amount,
        paymentMode: paymentMode as PaymentMode,
        description: transaction.description || "",
        date: transaction.transaction_date,
        cash: paymentMode === "Cash" ? amount : 0,
        online: paymentMode === "Online" ? amount : 0,
        other: paymentMode === "Other" ? amount : 0,
      };
    });

    setEmployees(formattedEmployees);
    setBranches(formattedBranches);
    setTransactions(formattedTransactions);
  } catch (error: unknown) {
    console.error("Transaction fetch error:", error);

    toast.error(
      error instanceof Error
        ? error.message
        : "Failed to load transaction data."
    );
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    fetchTransactionData();
  }, []);
    // =========================
  // RESET FILTERS
  // =========================

  const resetFilters = () => {
  setSelectedEmployee("");
  setSelectedBranch(
    userRole === "branch_manager" ? managerBranchId : ""
  );
  setFromDate("");
  setToDate("");
};

  const today = new Date().toISOString().split("T")[0];

  // =========================
  // BRANCH COLORS
  // =========================

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

  const getBranchColor = (branchName: string) => {
    const index = branches.findIndex(
      (branch) => branch.name === branchName
    );

    return branchColorClasses[
      index >= 0
        ? index % branchColorClasses.length
        : 0
    ];
  };

  // =========================
  // FILTER TRANSACTIONS
  // =========================

  const filteredTransactions = useMemo(() => {
    const filtered = transactions
      .filter((transaction) => {
        const matchesEmployee =
          reportType === "employee"
            ? !selectedEmployee ||
              transaction.employeeId === selectedEmployee
            : true;

        const matchesBranch =
          reportType === "branch"
            ? !selectedBranch ||
              transaction.branchId === selectedBranch
            : true;

        const matchesFromDate =
          !fromDate ||
          transaction.date >= fromDate;

        const matchesToDate =
          !toDate ||
          transaction.date <= toDate;

        return (
          matchesEmployee &&
          matchesBranch &&
          matchesFromDate &&
          matchesToDate
        );
      })
      .sort((a, b) =>
        b.date.localeCompare(a.date)
      );

    if (
      !selectedEmployee &&
      !selectedBranch &&
      !fromDate &&
      !toDate
    ) {
      return filtered.slice(0, 10);
    }

    return filtered;
  }, [
    transactions,
    reportType,
    selectedEmployee,
    selectedBranch,
    fromDate,
    toDate,
  ]);

  // =========================
  // TOTAL CALCULATIONS
  // =========================

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

  const totalOther = filteredTransactions.reduce(
    (total, transaction) =>
      total + transaction.other,
    0
  );

  const totalPayment =
    totalCash +
    totalOnline +
    totalOther;

  // =========================
  // EXPORT DATA
  // =========================

  const transactionExportData =
    filteredTransactions.map((transaction) => ({
      date: transaction.date,
      branch: transaction.branch,
      employee: transaction.employee,
      cash: transaction.cash,
      online: transaction.online,
      other: transaction.other,
      total:
        transaction.cash +
        transaction.online +
        transaction.other,
    }));

  // =========================
  // SELECTED DATA
  // =========================

  const selectedEmployeeData =
    employees.find(
      (employee) =>
        employee.id === selectedEmployee
    );

  const selectedBranchData =
    branches.find(
      (branch) =>
        branch.id === selectedBranch
    );

  const branchTotalEmployees =
    new Set(
      filteredTransactions.map(
        (transaction) =>
          transaction.employeeId
      )
    ).size;

  const selectedPeriod =
    fromDate && toDate
      ? `${fromDate
          .split("-")
          .reverse()
          .join("/")} - ${toDate
          .split("-")
          .reverse()
          .join("/")}`
      : "Select Period";

  const isInvalidDateRange =
    Boolean(
      fromDate &&
      toDate &&
      fromDate > toDate
    );

  const isReportReady =
    !isInvalidDateRange;

  // =========================
  // UI
  // =========================

    return (
    <main className="min-h-screen bg-[#f5f6f8]">

      {/* NAVBAR */}
      <div className="relative bg-[#17191d]">
        <Navbar />
        <div className="h-24" />
      </div>

      {/* LOADING */}
      {loading ? (
        <Loader
          text="Loading transactions..."
          fullScreen
        />
      ) : (
        <section className="px-5 py-10 md:px-8">
          <div className="mx-auto max-w-7xl">

            {/* PAGE HEADER */}
            <div className="mb-8">
              <div className="flex items-center gap-3">

                <Link
                  href="/management/admin"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition hover:border-[#f5b942] hover:bg-[#fff9eb] hover:text-[#a86f00]"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Link>

                <div className="h-8 w-1 rounded-full bg-[#f5b942]" />

                <h1 className="text-3xl font-bold tracking-tight text-[#17191d] md:text-4xl">
                  Transaction Report
                </h1>

              </div>

              <p className="mt-3 ml-4 text-base text-gray-500">
                View, filter, export and edit
                transaction payments.
              </p>
            </div>

            {/* REPORT TYPE */}
            <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

              <p className="mb-4 text-sm font-semibold text-gray-700">
                Select Report Type
              </p>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                {/* EMPLOYEE */}
                <button
                  type="button"
                  onClick={() => {
                    setReportType("employee");
                    setSelectedBranch("");
                  }}
                  className={`rounded-xl border p-5 text-left transition ${
                    reportType === "employee"
                      ? "border-[#f5b942] bg-[#fff9eb] shadow-sm"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-3">

                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-lg ${
                        reportType === "employee"
                          ? "bg-[#f5b942] text-black"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      👤
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Employee Wise Report
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        View transaction history
                        of an employee
                      </p>
                    </div>

                  </div>
                </button>

                {/* BRANCH */}
                <button
                  type="button"
                  onClick={() => {
                    setReportType("branch");
                    setSelectedEmployee("");
                  }}
                  className={`rounded-xl border p-5 text-left transition ${
                    reportType === "branch"
                      ? "border-[#f5b942] bg-[#fff9eb] shadow-sm"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-3">

                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-lg ${
                        reportType === "branch"
                          ? "bg-[#f5b942] text-black"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      🏢
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Branch Wise Report
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        View transactions of a
                        particular branch
                      </p>
                    </div>

                  </div>
                </button>

              </div>
            </div>

            {/* FILTER CARD */}
            <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

              <div className="mb-5">
                <h2 className="text-lg font-bold text-gray-900">
                  Report Filters
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Select the required details
                  to generate the report.
                </p>
              </div>

              {/* EMPLOYEE FILTER */}
              {reportType === "employee" && (
                <div className="grid grid-cols-1 gap-5 md:grid-cols-3">

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Employee
                    </label>

                    <select
                      value={selectedEmployee}
                      onChange={(e) =>
                        setSelectedEmployee(e.target.value)
                      }
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-[#f5b942] focus:ring-2 focus:ring-[#f5b942]/20"
                    >
                      <option value="">
                        All Employees
                      </option>

                      {employees.map((employee) => (
                        <option
                          key={employee.id}
                          value={employee.id}
                        >
                          {employee.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      From Date
                    </label>

                    <input
                      type="date"
                      value={fromDate}
                      max={today}
                      onChange={(e) =>
                        setFromDate(e.target.value)
                      }
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-[#f5b942] focus:ring-2 focus:ring-[#f5b942]/20"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      To Date
                    </label>

                    <input
                      type="date"
                      value={toDate}
                      min={fromDate || undefined}
                      max={today}
                      onChange={(e) =>
                        setToDate(e.target.value)
                      }
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-[#f5b942] focus:ring-2 focus:ring-[#f5b942]/20"
                    />
                  </div>

                </div>
              )}

              {/* BRANCH FILTER */}
              {reportType === "branch" && (
                <div className="grid grid-cols-1 gap-5 md:grid-cols-3">

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Branch
                    </label>

                    <select
                      value={selectedBranch}
                      disabled={userRole === "branch_manager"}
                      onChange={(e) =>
                        setSelectedBranch(e.target.value)
                      }
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-[#f5b942] focus:ring-2 focus:ring-[#f5b942]/20"
                    >
                      {userRole === "admin" && (
  <option value="">All Branches</option>
)}

                      {branches.map((branch) => (
                        <option
                          key={branch.id}
                          value={branch.id}
                        >
                          {branch.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      From Date
                    </label>

                    <input
                      type="date"
                      value={fromDate}
                      max={today}
                      onChange={(e) =>
                        setFromDate(e.target.value)
                      }
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-[#f5b942] focus:ring-2 focus:ring-[#f5b942]/20"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      To Date
                    </label>

                    <input
                      type="date"
                      value={toDate}
                      min={fromDate || undefined}
                      max={today}
                      onChange={(e) =>
                        setToDate(e.target.value)
                      }
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-[#f5b942] focus:ring-2 focus:ring-[#f5b942]/20"
                    />
                  </div>

                </div>
              )}

              <div className="mt-5 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                <p className="text-sm text-gray-600">
                  {!selectedEmployee &&
                  !selectedBranch &&
                  !fromDate &&
                  !toDate
                    ? "Showing latest transactions. Use filters to view specific transaction history."
                    : "Showing transactions based on the selected filters."}
                </p>
              </div>

            </div>

            {/* SELECTED EMPLOYEE */}
            {reportType === "employee" &&
              selectedEmployeeData && (
                <div className="mb-6 rounded-2xl border border-[#f5b942]/40 bg-[#fff9eb] p-5">

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                    <div>
                      <p className="text-sm text-gray-500">
                        Employee Transaction Report
                      </p>

                      <h2 className="mt-1 text-2xl font-bold text-gray-900">
                        {selectedEmployeeData.name}
                      </h2>

                      <p className="mt-1 text-sm text-gray-600">
                        Transaction history of
                        selected employee
                      </p>
                    </div>

                    <div className="rounded-xl bg-white px-6 py-4 text-center shadow-sm">
                      <p className="text-xs uppercase tracking-wide text-gray-500">
                        Transactions
                      </p>

                      <p className="mt-1 text-xl font-bold text-gray-900">
                        {filteredTransactions.length}
                      </p>
                    </div>

                  </div>
                </div>
              )}

            {/* BRANCH SUMMARY */}
            {reportType === "branch" && (
              <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">

                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                  <p className="text-sm font-medium text-gray-500">
                    Total Employees
                  </p>

                  <p className="mt-1 text-2xl font-bold text-gray-900">
                    {branchTotalEmployees}
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                  <p className="text-sm font-medium text-gray-500">
                    Total Transactions
                  </p>

                  <p className="mt-1 text-2xl font-bold text-gray-900">
                    {filteredTransactions.length.toLocaleString(
                      "en-IN"
                    )}
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                  <p className="text-sm font-medium text-gray-500">
                    Total Sales Amount
                  </p>

                  <p className="mt-1 text-2xl font-bold text-gray-900">
                    ₹
                    {totalPayment.toLocaleString(
                      "en-IN"
                    )}
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                  <p className="text-sm font-medium text-gray-500">
                    Selected Period
                  </p>

                  <p className="mt-1 text-sm font-bold text-gray-900">
                    {selectedPeriod}
                  </p>
                </div>

              </div>
            )}

            {/* TRANSACTION TABLE */}
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

              <div className="flex flex-col gap-4 border-b border-gray-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">

                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    {reportType === "employee"
                      ? "Transaction History"
                      : "Branch Wise Employee Transactions"}
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    {filteredTransactions.length}{" "}
                    transaction
                    {filteredTransactions.length !== 1
                      ? "s"
                      : ""}{" "}
                    found
                  </p>
                </div>

                {/* EXPORT + RESET */}
                <div className="flex flex-wrap items-center gap-3">

                  <button
                    type="button"
                    onClick={resetFilters}
                    className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-[#f5b942] hover:bg-[#fff9eb] hover:text-gray-900"
                  >
                    Reset Filters
                  </button>

                  <ExportTable
                    data={transactionExportData}
                    columns={[
                      {
                        header: "Date",
                        key: "date",
                      },
                      {
                        header: "Branch",
                        key: "branch",
                      },
                      {
                        header: "Employee Name",
                        key: "employee",
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
                        header: "Other",
                        key: "other",
                      },
                      {
                        header: "Total",
                        key: "total",
                      },
                    ]}
                    fileName={
                      reportType === "employee"
                        ? "Employee-Transaction-Report"
                        : "Branch-Wise-Employee-Transactions"
                    }
                    disabled={!isReportReady}
                  />

                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[1100px]">

                  <thead>
                    <tr className="bg-[#17191d] text-left text-sm text-white">

                      <th className="px-6 py-4 font-semibold">
                        Employee Name
                      </th>

                      {reportType === "branch" && (
                        <th className="px-6 py-4 font-semibold">
                          Branch
                        </th>
                      )}

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
                        Other
                      </th>

                      <th className="px-6 py-4 text-right font-semibold">
                        Total
                      </th>

                      <th className="px-6 py-4 text-center font-semibold">
                        Action
                      </th>

                    </tr>
                  </thead>

                  <tbody>
                    {filteredTransactions.length > 0 ? (
                      filteredTransactions.map((transaction) => {

                        const total =
                          transaction.cash +
                          transaction.online +
                          transaction.other;

                        return (
                          <tr
                            key={transaction.id}
                            className="border-b border-gray-100 transition hover:bg-[#fffaf0]"
                          >

                            <td className="px-6 py-4 text-sm font-semibold text-gray-800">
                              {transaction.employee}
                            </td>

                            {reportType === "branch" && (
                              <td className="px-6 py-4">
                                <span
                                  className={`inline-flex rounded-full px-4 py-1.5 text-xs font-semibold ${getBranchColor(
                                    transaction.branch
                                  )}`}
                                >
                                  {transaction.branch}
                                </span>
                              </td>
                            )}

                            <td className="px-6 py-4 text-sm font-medium text-gray-800">
                              {new Date(
                                `${transaction.date}T00:00:00`
                              ).toLocaleDateString("en-IN")}
                            </td>

                            <td className="bg-blue-200 px-6 py-4 text-right text-sm text-blue-900">
                              ₹
                              {transaction.cash.toLocaleString(
                                "en-IN"
                              )}
                            </td>

                            <td className="bg-red-200 px-6 py-4 text-right text-sm text-red-900">
                              ₹
                              {transaction.online.toLocaleString(
                                "en-IN"
                              )}
                            </td>

                            <td className="bg-gray-200 px-6 py-4 text-right text-sm text-gray-900">
                              ₹
                              {transaction.other.toLocaleString(
                                "en-IN"
                              )}
                            </td>

                            <td className="px-6 py-4 text-right text-sm font-bold text-gray-900">
                              ₹
                              {total.toLocaleString(
                                "en-IN"
                              )}
                            </td>

                            <td className="px-6 py-4 text-center">
                              <EditButton
                                href={`/transaction/edit/${transaction.id}`}
                              />
                            </td>

                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan={
                            reportType === "branch"
                              ? 8
                              : 7
                          }
                          className="px-6 py-12 text-center"
                        >

                          <div className="text-3xl">
                            📋
                          </div>

                          <p className="mt-3 font-semibold text-gray-700">
                            No Transactions Found
                          </p>

                          <p className="mt-1 text-sm text-gray-500">
                            No transactions are
                            available for the
                            selected filters.
                          </p>

                        </td>
                      </tr>
                    )}
                  </tbody>

                </table>
              </div>

            </div>

            {/* TOTAL CALCULATION */}
            <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

              <div className="border-b border-gray-200 bg-[#17191d] px-6 py-5">

                <h2 className="text-lg font-bold text-white">
                  {reportType === "employee" &&
                  selectedEmployeeData
                    ? `${selectedEmployeeData.name} - Total Transaction Payment Calculation`
                    : reportType === "branch" &&
                      selectedBranchData
                    ? `${selectedBranchData.name} - Total Transaction Payment Calculation`
                    : "Total Transaction Payment Calculation"}
                </h2>

                <p className="mt-1 text-sm text-gray-400">
                  {reportType === "employee"
                    ? "Employee wise payment summary"
                    : "Branch wise payment summary"}
                </p>

              </div>

              <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2 xl:grid-cols-4">

                {/* CASH */}
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                  <p className="text-sm font-medium text-gray-500">
                    Cash Payment
                  </p>

                  <p className="mt-2 text-2xl font-bold text-gray-900">
                    ₹
                    {totalCash.toLocaleString(
                      "en-IN"
                    )}
                  </p>
                </div>

                {/* ONLINE */}
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                  <p className="text-sm font-medium text-gray-500">
                    Online Payment
                  </p>

                  <p className="mt-2 text-2xl font-bold text-gray-900">
                    ₹
                    {totalOnline.toLocaleString(
                      "en-IN"
                    )}
                  </p>
                </div>

                {/* OTHER */}
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                  <p className="text-sm font-medium text-gray-500">
                    Other Payment
                  </p>

                  <p className="mt-2 text-2xl font-bold text-gray-900">
                    ₹
                    {totalOther.toLocaleString(
                      "en-IN"
                    )}
                  </p>
                </div>

                {/* TOTAL */}
                <div className="rounded-xl border border-[#f5b942] bg-[#fff9eb] p-5">
                  <p className="text-sm font-medium text-gray-600">
                    Total Payment
                  </p>

                  <p className="mt-2 text-3xl font-bold text-gray-900">
                    ₹
                    {totalPayment.toLocaleString(
                      "en-IN"
                    )}
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    Cash + Online + Other
                  </p>
                </div>

              </div>
            </div>

          </div>
        </section>
      )}

    </main>
  );
}