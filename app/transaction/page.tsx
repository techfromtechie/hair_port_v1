"use client";

import { useEffect, useMemo, useState } from "react";
import Navbar from "@/app/components/Navbar";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ExportTable from "@/app/components/ExportTable";
import { supabase } from "@/app/lib/supabase";
import { toast } from "react-toastify";
export default function TransactionReportPage() {
  type Employee = {
  id: string;
  name: string;
  branchId: string;
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
  service: string;
  amount: number;
  paymentMode: "Cash" | "Online";
  description: string;
  date: string;
  cash: number;
  online: number;
};

const [employees, setEmployees] = useState<Employee[]>([]);
const [branches, setBranches] = useState<string[]>([]);
const [transactions, setTransactions] = useState<Transaction[]>([]);

const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchTransactionData = async () => {
    try {
      setLoading(true);

      // =========================
      // FETCH EMPLOYEES
      // =========================

   // =========================
// FETCH EMPLOYEES
// =========================

const { data: employeeData, error: employeeError } =
  await supabase
    .from("employees")
    .select(`
      id,
      name,
      branch_id
    `)
    .order("name", { ascending: true });

if (employeeError) {
  throw employeeError;
}

const formattedEmployees: Employee[] = (employeeData || []).map(
  (employee: any) => ({
    id: employee.id,
    name: employee.name,
    branchId: employee.branch_id,
  })
);

setEmployees(formattedEmployees);
      // =========================
      // FETCH BRANCHES
      // =========================

      const { data: branchData, error: branchError } =
        await supabase
          .from("branches")
          .select("id, name")
          .order("name", { ascending: true });

      if (branchError) {
        throw branchError;
      }

      setBranches(
        (branchData || []).map((branch: any) => branch.name)
      );
// =========================
// FETCH TRANSACTIONS
// =========================

const {
  data: transactionData,
  error: transactionError,
} = await supabase
  .from("transactions")
  .select(`
    id,
    employee_id,
    branch_id,
    service,
    amount,
    payment_mode,
    description,
    transaction_date,
    created_at
  `)
  .order("created_at", {
    ascending: false,
  });
  
if (transactionError) {
  throw transactionError;
}

// =========================
// FORMAT TRANSACTIONS
// =========================

const formattedTransactions: Transaction[] = (
  transactionData || []
).map((transaction: any) => {
  const employee = formattedEmployees.find(
    (emp) => emp.id === transaction.employee_id
  );

  const branch = (branchData || []).find(
    (branch: any) => branch.id === transaction.branch_id
  );

  const amount = Number(transaction.amount || 0);

  return {
    id: transaction.id,
    employeeId: transaction.employee_id,
    branchId: transaction.branch_id,

    employee: employee?.name || "Unknown Employee",

    branch: branch?.name || "Unknown Branch",

    service: transaction.service || "",

    amount,

    paymentMode: transaction.payment_mode,

    description: transaction.description || "",

    date: transaction.transaction_date,

    cash:
      transaction.payment_mode === "Cash"
        ? amount
        : 0,

    online:
      transaction.payment_mode === "Online"
        ? amount
        : 0,
  };
});

console.log("Transactions from Supabase:", transactionData);
console.log("Formatted transactions:", formattedTransactions);

setTransactions(formattedTransactions);
    } catch (error: any) {
      console.error("Transaction fetch error:", error);

      toast.error(
        error?.message || "Failed to load transaction data."
      );
    } finally {
      setLoading(false);
    }
  };

  fetchTransactionData();
}, []);
  const [reportType, setReportType] = useState<"employee" | "branch">(
    "employee"
  );

  const [selectedEmployee, setSelectedEmployee] = useState("");
const [selectedBranch, setSelectedBranch] = useState("");

const [fromDate, setFromDate] = useState("");
const [toDate, setToDate] = useState("");

const [search, setSearch] = useState("");


const resetFilters = () => {
  setSelectedEmployee("");
  setSelectedBranch("");
  setFromDate("");
  setToDate("");
  setSearch("");
};
const today = new Date().toISOString().split("T")[0];

const getBranchColor = (branch: string) => {
  const colors: Record<string, string> = {
    Indore: "bg-blue-100 text-blue-700",
    Ujjain: "bg-green-100 text-green-700",
    Bhopal: "bg-purple-100 text-purple-700",
  };

  return colors[branch] || "bg-gray-100 text-gray-700";
};
  // =========================
  // FILTER TRANSACTIONS
  // =========================
 const filteredTransactions = useMemo(() => {
  const filtered = transactions
    .filter((transaction) => {
      // =========================
      // EMPLOYEE FILTER
      // =========================
      const matchesEmployee =
  reportType === "employee"
    ? !selectedEmployee ||
      transaction.employeeId === selectedEmployee
    : true;

      // =========================
      // BRANCH FILTER
      // =========================
      const matchesBranch =
        reportType === "branch"
          ? !selectedBranch ||
            transaction.branch === selectedBranch
          : true;

      // =========================
      // DATE FILTER
      // =========================
      // Date filter is optional now.
      // If dates are selected, apply them.
      const matchesFromDate =
        !fromDate || transaction.date >= fromDate;

      const matchesToDate =
  !toDate || transaction.date <= toDate;

const searchText = search.trim().toLowerCase();

const matchesSearch =
  !searchText ||
  transaction.employee.toLowerCase().includes(searchText) ||
  transaction.branch.toLowerCase().includes(searchText);

return (
  matchesEmployee &&
  matchesBranch &&
  matchesFromDate &&
  matchesToDate &&
  matchesSearch
);
    })
    .sort((a, b) =>
      b.date.localeCompare(a.date)
    );

  // =========================
// DEFAULT VIEW
// =========================

if (!fromDate && !toDate && !search.trim()) {
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
  search,
]);


  // =========================
  // TOTAL CALCULATIONS
  // =========================
  const totalCash = filteredTransactions.reduce(
    (total, transaction) => total + transaction.cash,
    0
  );

  const totalOnline = filteredTransactions.reduce(
    (total, transaction) => total + transaction.online,
    0
  );

  const totalPayment = totalCash + totalOnline;

  const transactionExportData = filteredTransactions.map(
  (transaction) => ({
    employee: transaction.employee,
    
    date: transaction.date,
    cash: transaction.cash,
    online: transaction.online,
    total: transaction.cash + transaction.online,
  })
);

const branchTotalEmployees = new Set(
  filteredTransactions.map(
    (transaction) => transaction.employeeId
  )
).size;

const selectedPeriod =
  fromDate && toDate
    ? `${fromDate.split("-").reverse().join("/")} - ${toDate
        .split("-")
        .reverse()
        .join("/")}`
    : "Select Period";

  // =========================
  // SELECTED EMPLOYEE
  // =========================
  const selectedEmployeeData = employees.find(
  (employee) => employee.id === selectedEmployee
);

  // =========================
  // DATE VALIDATION
  // =========================
  const isInvalidDateRange =
    Boolean(fromDate && toDate && fromDate > toDate);

 const isReportReady =
  !isInvalidDateRange &&
  (
    reportType === "employee"
      ? true
      : true
  );

  return (
    <main className="min-h-screen bg-[#f5f6f8]">

      {/* ================= NAVBAR ================= */}
      <div className="relative bg-[#17191d]">
        <Navbar />
        <div className="h-24" />
      </div>

      {/* ================= PAGE CONTENT ================= */}
      <section className="px-5 py-10 md:px-8">
        <div className="mx-auto max-w-7xl">

          {/* ================= PAGE HEADER ================= */}
          <div className="mb-8">
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
    Transaction Report
  </h1>
</div>
            <p className="mt-3 ml-4 text-base text-gray-500">
              View and analyze transaction payments by employee or branch.
            </p>
          </div>

          {/* ================= REPORT TYPE ================= */}
          <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="mb-4 text-sm font-semibold text-gray-700">
              Select Report Type
            </p>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

              {/* Employee Wise */}
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
                      View transaction history of an employee
                    </p>
                  </div>

                </div>
              </button>

              {/* Branch Wise */}
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
                      View transactions of a particular branch
                    </p>
                  </div>

                </div>
              </button>

            </div>
          </div>

          {/* ================= FILTER CARD ================= */}
          <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

            <div className="mb-5">
              <h2 className="text-lg font-bold text-gray-900">
                Report Filters
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Select the required details to generate the report.
              </p>
            </div>

            <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-end">
  <div className="flex-1">
    <label className="mb-2 block text-sm font-semibold text-gray-700">
      Search
    </label>

    <input
      type="text"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      placeholder="Search employee name or branch..."
      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-[#f5b942] focus:ring-2 focus:ring-[#f5b942]/20"
    />
  </div>

  <button
    type="button"
    onClick={resetFilters}
    className="rounded-lg bg-[#17191d] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#2a2d32]"
  >
    Reset
  </button>
</div>

            {/* ================= EMPLOYEE FILTER ================= */}
            {reportType === "employee" && (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-3">

                {/* Employee */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Employee
                  </label>

                 <select
  value={selectedEmployee}
  onChange={(e) => setSelectedEmployee(e.target.value)}
>
  <option value="">Select Employee</option>

  {employees.map((employee) => (
   <option key={employee.id} value={employee.id}>
  {employee.name}
</option>
  ))}
</select>
                </div>

                {/* From Date */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    From Date
                  </label>

                  <input
  type="date"
  value={fromDate}
  max={today}
  onChange={(e) => setFromDate(e.target.value)}
  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-[#f5b942] focus:ring-2 focus:ring-[#f5b942]/20"
/>
                </div>

                {/* To Date */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    To Date
                  </label>

                  <input
  type="date"
  value={toDate}
  min={fromDate || undefined}
  max={today}
  onChange={(e) => setToDate(e.target.value)}
  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-[#f5b942] focus:ring-2 focus:ring-[#f5b942]/20"
/>
                </div>

              </div>
            )}

            {/* ================= BRANCH FILTER ================= */}
            {reportType === "branch" && (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-3">

                {/* Branch */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Branch
                  </label>

                  <select
                    value={selectedBranch}
                    onChange={(e) => setSelectedBranch(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-[#f5b942] focus:ring-2 focus:ring-[#f5b942]/20"
                  >
                    <option value="">All Branch</option>

                    {branches.map((branch) => (
                      <option key={branch} value={branch}>
                        {branch}
                      </option>
                    ))}
                  </select>
                </div>

                {/* From Date */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    From Date
                  </label>

                 <input
  type="date"
  value={fromDate}
  max={today}
  onChange={(e) => setFromDate(e.target.value)}
  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-[#f5b942] focus:ring-2 focus:ring-[#f5b942]/20"
/>
                </div>

                {/* To Date */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    To Date
                  </label>

                  <input
  type="date"
  value={toDate}
  min={fromDate || undefined}
  max={today}
  onChange={(e) => setToDate(e.target.value)}
  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-[#f5b942] focus:ring-2 focus:ring-[#f5b942]/20"
/>
                </div>

              </div>
            )}

            {/* ================= VALIDATION MESSAGE ================= */}
            <div className="mt-5 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
  <p className="text-sm text-gray-600">
    {!fromDate && !toDate && !search.trim()
  ? "Showing latest transactions. Use search or filters to view specific transaction history."
  : "Showing transactions based on the selected search and filters."}
  </p>
</div>

          </div>


          {/* ================= SELECTED EMPLOYEE ================= */}
{reportType === "employee" && selectedEmployeeData && (
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
  Transaction history of selected employee
</p>
      </div>

      {/* TRANSACTION COUNT */}
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

{/* ================= BRANCH WISE DASHBOARD ================= */}
{reportType === "branch" && isReportReady && (
  <>
    {/* Branch Report Summary Cards */}
    <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">

      {/* Total Employees */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-4">

          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-100 text-2xl">
            👥
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">
              Total Employees
            </p>

            <p className="mt-1 text-2xl font-bold text-gray-900">
              {branchTotalEmployees}
            </p>
          </div>

        </div>
      </div>

      {/* Total Transactions */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-4">

          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-green-100 text-2xl">
            💼
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">
              Total Transactions
            </p>

            <p className="mt-1 text-2xl font-bold text-gray-900">
              {filteredTransactions.length.toLocaleString("en-IN")}
            </p>
          </div>

        </div>
      </div>

      {/* Total Sales */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-4">

          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-purple-100 text-2xl">
            ₹
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">
              Total Sales Amount
            </p>

            <p className="mt-1 text-2xl font-bold text-gray-900">
              ₹{totalPayment.toLocaleString("en-IN")}
            </p>
          </div>

        </div>
      </div>

      {/* Selected Period */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-4">

          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-red-100 text-2xl">
            📅
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">
              Selected Period
            </p>

            <p className="mt-1 text-sm font-bold text-gray-900">
              {selectedPeriod}
            </p>
          </div>

        </div>
      </div>

    </div>

    {/* Branch Wise Employee Transactions */}
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

      {/* Table Header */}
      <div className="flex flex-col gap-4 border-b border-gray-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-xl">
              📊
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Branch Wise Employee Transactions
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Daily transaction details of employees by branch
              </p>
            </div>

          </div>
        </div>

        {/* Export Dropdown */}
        <ExportTable
          data={transactionExportData}
          columns={[
            {
              header: "Date",
              key: "date",
            },
            {
              header: "Branch",
              key: "branch" as keyof (typeof transactionExportData)[number],
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
              header: "Total Amount",
              key: "total",
            },
          ]}
          fileName="Branch-Wise-Employee-Transactions"
          disabled={!isReportReady || !filteredTransactions.length}
        />

      </div>

      {/* Table */}
      <div className="overflow-x-auto">

        <table className="w-full min-w-[1000px]">

          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-left">

              <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                Date
              </th>

              <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                Branch
              </th>

              <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                Employee Name
              </th>

             
              <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                Cash
              </th>

              <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                Online
              </th>

              <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                Total Amount
              </th>

            </tr>
          </thead>

          <tbody>

            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((transaction) => {

                const total =
                  transaction.cash + transaction.online;

                return (
                  <tr
                    key={transaction.id}
                    className="border-b border-gray-100 transition hover:bg-gray-50"
                  >

                    <td className="px-6 py-4 text-sm font-medium text-gray-800">
                      {new Date(
                        `${transaction.date}T00:00:00`
                      ).toLocaleDateString("en-IN")}
                    </td>

                    <td className="px-6 py-4">

                     <span
  className={`inline-flex rounded-full px-4 py-1.5 text-xs font-semibold ${getBranchColor(
    transaction.branch
  )}`}
>
  {transaction.branch}
</span>

                    </td>

                    <td className="px-6 py-4 text-sm font-semibold text-gray-800">
                      {transaction.employee}
                    </td>

                    

                    <td className="px-6 py-4 text-right text-sm text-gray-700">
                      ₹{transaction.cash.toLocaleString("en-IN")}
                    </td>

                    <td className="px-6 py-4 text-right text-sm text-gray-700">
                      ₹{transaction.online.toLocaleString("en-IN")}
                    </td>

                    <td className="px-6 py-4 text-right text-sm font-bold text-gray-900">
                      ₹{total.toLocaleString("en-IN")}
                    </td>

                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-12 text-center"
                >
                  <div className="text-3xl">
                    📋
                  </div>

                  <p className="mt-3 font-semibold text-gray-700">
                    No Transactions Found
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    No transactions are available for the selected filters.
                  </p>
                </td>
              </tr>
            )}

          </tbody>

        </table>

      </div>

    </div>
  </>
)}
          {/* ================= TRANSACTION TABLE ================= */}
         {reportType === "employee" && ( <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

            <div className="flex flex-col gap-4 border-b border-gray-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
  <div>
    <h2 className="text-lg font-bold text-gray-900">
      Transaction History
    </h2>

    <p className="mt-1 text-sm text-gray-500">
      {filteredTransactions.length} transaction
      {filteredTransactions.length !== 1 ? "s" : ""} found
    </p>
  </div>

  <ExportTable
    data={transactionExportData}
    columns={[
      ...(reportType === "branch"
        ? [
            {
              header: "Employee",
              key: "employee" as keyof (typeof transactionExportData)[number],
            },
            {
              header: "Employee No",
              key: "employeeNumber" as keyof (typeof transactionExportData)[number],
            },
          ]
        : []),

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
    fileName={
      reportType === "employee"
        ? "Employee-Transaction-Report"
        : "Branch-Transaction-Report"
    }
    disabled={!isReportReady}
  />
</div>

            <div className="overflow-x-auto">

              <table className="w-full min-w-[700px]">

                <thead>
                  <tr className="bg-[#17191d] text-left text-sm text-white">

                   <th className="px-6 py-4 font-semibold">
  Employee Name
</th>

{reportType === "branch" && (
  <th className="px-6 py-4 font-semibold">
    Employee No
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
                      Total
                    </th>

                  </tr>
                </thead>

                <tbody>

                  {filteredTransactions.length > 0 ? (

                    filteredTransactions.map((transaction) => {

                      const total =
                        transaction.cash + transaction.online;

                      return (
                        <tr
                          key={transaction.id}
                          className="border-b border-gray-100 transition hover:bg-[#fffaf0]"
                        >

                          <td className="px-6 py-4 text-sm font-semibold text-gray-800">
  {transaction.employee}
</td>

{reportType === "branch" && (
  <td className="px-6 py-4 text-sm text-gray-600">
    {transaction.employeeNumber}
  </td>
)}

                          <td className="px-6 py-4 text-sm font-medium text-gray-800">
                            {transaction.date}
                          </td>

                          <td className="px-6 py-4 text-right text-sm font-medium text-gray-700">
                            ₹{transaction.cash.toLocaleString("en-IN")}
                          </td>

                          <td className="px-6 py-4 text-right text-sm font-medium text-gray-700">
                            ₹{transaction.online.toLocaleString("en-IN")}
                          </td>

                          <td className="px-6 py-4 text-right text-sm font-bold text-gray-900">
                            ₹{total.toLocaleString("en-IN")}
                          </td>

                        </tr>
                      );
                    })

                  ) : (

                    <tr>

                      <td
                        colSpan={reportType === "branch" ? 6 : 4}
                        className="px-6 py-12 text-center"
                      >

                        <div className="text-3xl">
                          📋
                        </div>

                        <p className="mt-3 font-semibold text-gray-700">

                          {!fromDate || !toDate
                            ? "Select Date Range"
                            : "No Transactions Found"}

                        </p>

                        <p className="mt-1 text-sm text-gray-500">

                          {search.trim()
  ? `No transactions found for "${search}".`
  : isInvalidDateRange
  ? "Please select a valid date range."
  : "No transactions are available for the selected filters."}

                        </p>

                      </td>

                    </tr>

                  )}

                </tbody>

              </table>

            </div>
          </div>
         )}

          {/* ================= TOTAL CALCULATION ================= */}
          <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

            <div className="border-b border-gray-200 bg-[#17191d] px-6 py-5">

              <h2 className="text-lg font-bold text-white">

                {reportType === "employee" && selectedEmployeeData
                  ? `${selectedEmployeeData.name} - Total Transaction Payment Calculation`
                  : reportType === "branch" && selectedBranch
                  ? `${selectedBranch} - Total Transaction Payment Calculation`
                  : "Total Transaction Payment Calculation"}

              </h2>

              <p className="mt-1 text-sm text-gray-400">

                {reportType === "employee"
                  ? "Employee wise payment summary"
                  : "Branch wise payment summary"}

              </p>

            </div>

            <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-3">

              {/* Total Cash */}
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">

                <p className="text-sm font-medium text-gray-500">
                  Cash Payment
                </p>

                <p className="mt-2 text-2xl font-bold text-gray-900">
                  ₹{totalCash.toLocaleString("en-IN")}
                </p>

              </div>

              {/* Total Online */}
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">

                <p className="text-sm font-medium text-gray-500">
                  Online Payment
                </p>

                <p className="mt-2 text-2xl font-bold text-gray-900">
                  ₹{totalOnline.toLocaleString("en-IN")}
                </p>

              </div>

              {/* Total Payment */}
              <div className="rounded-xl border border-[#f5b942] bg-[#fff9eb] p-5">

                <p className="text-sm font-medium text-gray-600">
                  Total Payment
                </p>

                <p className="mt-2 text-3xl font-bold text-gray-900">
                  ₹{totalPayment.toLocaleString("en-IN")}
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Cash + Online
                </p>

              </div>

            </div>
          </div>

        </div>
      </section>
    </main>
  );
}