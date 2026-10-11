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
  Search,
  Wallet,
  Building2,
  UserRound,
  IndianRupee,
  RotateCcw,
  ArrowLeft,
} from "lucide-react";



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
  other: number;
  date: string;
};

export default function DailyTransactionsPage() {
  

const [selectedBranch, setSelectedBranch] = useState("");
const [fromDate, setFromDate] = useState("");
const [toDate, setToDate] = useState("");

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch data from Supabase
  useEffect(() => {
    const fetchTransactionData = async () => {
      try {
        setLoading(true);

        const { data: employeeData, error: employeeError } =
          await supabase
            .from("employees")
            .select("id, name")
            .order("name", { ascending: true });

        if (employeeError) throw employeeError;

        const formattedEmployees: Employee[] = (employeeData ?? []).map(
          (employee) => ({
            id: employee.id,
            name: employee.name,
          })
        );

        setEmployees(formattedEmployees);

        const { data: branchData, error: branchError } =
          await supabase
            .from("branches")
            .select("id, name")
            .order("name", { ascending: true });

        if (branchError) throw branchError;

        const formattedBranches: Branch[] = (branchData ?? []).map(
          (branch) => ({
            id: branch.id,
            name: branch.name,
          })
        );

        setBranches(formattedBranches);

        const employeeMap = new Map<string, Employee>();
        formattedEmployees.forEach((employee) => {
          employeeMap.set(employee.id, employee);
        });

        const branchMap = new Map<string, Branch>();
        formattedBranches.forEach((branch) => {
          branchMap.set(branch.id, branch);
        });

        const { data: transactionData, error: transactionError } =
          await supabase
            .from("transactions")
            .select(
              "id, employee_id, branch_id, service, amount, payment_mode, description, transaction_date, created_at, cash, online, other"
            )
            .order("created_at", { ascending: false });

        if (transactionError) throw transactionError;

        const formattedTransactions: Transaction[] = (
          transactionData ?? []
        ).map((transaction: any) => {
          const employee = employeeMap.get(transaction.employee_id);
          const branch = branchMap.get(transaction.branch_id);

          const rawDate =
            transaction.transaction_date ??
            transaction.date ??
            transaction.created_at;

          const transactionDate = rawDate
            ? String(rawDate).split("T")[0]
            : "";

          const amount = Number(transaction.amount) || 0;
          const paymentMode = String(
            transaction.payment_mode ?? ""
          )
            .trim()
            .toLowerCase();

          const storedCash = Number(transaction.cash) || 0;
          const storedOnline = Number(transaction.online) || 0;
          const storedOther = Number(transaction.other) || 0;

          const hasSplitAmounts =
            storedCash > 0 ||
            storedOnline > 0 ||
            storedOther > 0;

          const cash = hasSplitAmounts
            ? storedCash
            : paymentMode === "cash"
              ? amount
              : 0;

          const online = hasSplitAmounts
            ? storedOnline
            : paymentMode === "online"
              ? amount
              : 0;

          const other = hasSplitAmounts
            ? storedOther
            : paymentMode === "other"
              ? amount
              : 0;

          return {
            id: transaction.id,
            employeeId: transaction.employee_id ?? "",
            branchId: transaction.branch_id ?? "",
            employee: employee?.name ?? "Unknown Employee",
            branch: branch?.name ?? "Unknown Branch",
            cash,
            online,
            other,
            date: transactionDate,
          };
        });

        formattedTransactions.sort((a, b) =>
          b.date.localeCompare(a.date)
        );

        setTransactions(formattedTransactions);
      } catch (error) {
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

    fetchTransactionData();
  }, []);

  
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

  const getBranchColor = (branchId: string) => {
    const index = branches.findIndex(
      (branch) => branch.id === branchId
    );

    return branchColorClasses[
      index >= 0 ? index % branchColorClasses.length : 0
    ];
  };



const filteredTransactions = useMemo(() => {
  return transactions
    .filter((transaction) => {
      const transactionDate = transaction.date;

      const matchesBranch =
        !selectedBranch ||
        transaction.branchId === selectedBranch;

      const matchesFromDate =
        !fromDate || transactionDate >= fromDate;

      const matchesToDate =
        !toDate || transactionDate <= toDate;

      return (
        matchesBranch &&
        matchesFromDate &&
        matchesToDate
      );
    })
    .sort((a, b) => b.date.localeCompare(a.date));
}, [transactions, selectedBranch, fromDate, toDate]);




  const totalCash = filteredTransactions.reduce(
    (total, transaction) => total + transaction.cash,
    0
  );

  const totalOnline = filteredTransactions.reduce(
    (total, transaction) => total + transaction.online,
    0
  );

  const totalOther = filteredTransactions.reduce(
    (total, transaction) => total + transaction.other,
    0
  );

  const totalAmount = totalCash + totalOnline + totalOther;

  const transactionExportData = filteredTransactions.map(
    (transaction) => ({
      employee: transaction.employee,
      branch: transaction.branch,
      date: transaction.date,
      cash: transaction.cash,
      online: transaction.online,
      other: transaction.other,
      total:
        transaction.cash +
        transaction.online +
        transaction.other,
    })
  );

  
const resetFilters = () => {
  
  setSelectedBranch("");
  setFromDate("");
  setToDate("");
};


  return (
    <main className="min-h-screen bg-[#f5f6f8]">
      <div className="relative bg-[#17191d]">
        <Navbar />
        <div className="h-24" />
      </div>

      {loading ? (
        <Loader text="Loading transactions..." fullScreen />
      ) : (
        <section className="px-5 py-10 md:px-8">
          <div className="mx-auto max-w-7xl">
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
                  Daily Transactions
                </h1>
              </div>

              <p className="ml-4 mt-3 text-base text-gray-500">
                View and manage employee transaction payments.
              </p>
            </div>

            <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
             
<div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">


  {/* BRANCH FILTER */}
  <div>
    <FormSelect
      label="Branch"
      value={selectedBranch}
      onChange={(e) => setSelectedBranch(e.target.value)}
      options={[
        { label: "All Branches", value: "" },
        ...branches.map((branch) => ({
          label: branch.name,
          value: branch.id,
        })),
      ]}
    />
  </div>

  {/* FROM DATE FILTER */}
  <div>
    <label className="mb-2 block text-sm font-semibold text-gray-700">
      From Date
    </label>

    <input
      type="date"
      value={fromDate}
      max={toDate || undefined}
      onChange={(e) => setFromDate(e.target.value)}
      className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-[#d59618] focus:ring-2 focus:ring-[#f5b942]/20"
    />
  </div>

  {/* TO DATE FILTER */}
  <div>
    <label className="mb-2 block text-sm font-semibold text-gray-700">
      To Date
    </label>

    <input
      type="date"
      value={toDate}
      min={fromDate || undefined}
      onChange={(e) => setToDate(e.target.value)}
      className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-[#d59618] focus:ring-2 focus:ring-[#f5b942]/20"
    />
  </div>
</div>

            </div>
                        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              <SummaryCard
                title="Recent Transactions"
                value={filteredTransactions.length.toString()}
                subtitle="Filtered records"
                icon={<UserRound className="h-5 w-5" />}
                iconClass="bg-blue-50 text-blue-600"
              />

              <SummaryCard
                title="Total Amount"
                value={`₹${totalAmount.toLocaleString("en-IN")}`}
                subtitle="Cash + Online + Other"
                icon={<Wallet className="h-5 w-5" />}
                iconClass="bg-amber-50 text-[#d59618]"
              />

              <SummaryCard
                title="Cash"
                value={`₹${totalCash.toLocaleString("en-IN")}`}
                subtitle="Cash payments"
                icon={<IndianRupee className="h-5 w-5" />}
                iconClass="bg-green-50 text-green-600"
              />

              <SummaryCard
                title="Online"
                value={`₹${totalOnline.toLocaleString("en-IN")}`}
                subtitle="Online payments"
                icon={<Wallet className="h-5 w-5" />}
                iconClass="bg-violet-50 text-violet-600"
              />

              <SummaryCard
                title="Other"
                value={`₹${totalOther.toLocaleString("en-IN")}`}
                subtitle="Other payments"
                icon={<Wallet className="h-5 w-5" />}
                iconClass="bg-orange-50 text-orange-600"
              />
            </div>

            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="flex flex-col gap-4 border-b border-gray-200 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-[#17191d]">
                    Recent Daily Transactions
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Transaction payment history based on the selected filters.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="inline-flex h-11 items-center gap-2 rounded-lg border border-gray-300 bg-white px-5 text-sm font-semibold text-gray-700 transition hover:border-[#f5b942] hover:bg-[#fff9eb] hover:text-gray-900"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reset
                  </button>

                  <ExportTable
                    data={transactionExportData}
                    columns={[
                      { header: "Employee", key: "employee" },
                      { header: "Branch", key: "branch" },
                      { header: "Date", key: "date" },
                      { header: "Cash", key: "cash" },
                      { header: "Online", key: "online" },
                      { header: "Other", key: "other" },
                      { header: "Total", key: "total" },
                    ]}
                    fileName="Daily-Transactions"
                    disabled={!filteredTransactions.length}
                  />

                  <Link
                    href="/transaction/add"
                    className="inline-flex h-11 items-center gap-2 rounded-lg bg-[#17191d] px-5 text-sm font-semibold text-white transition hover:bg-black"
                  >
                    <Plus className="h-4 w-4" />
                    Add Transaction
                  </Link>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[950px]">
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
                        Other
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
                          transaction.cash +
                          transaction.online +
                          transaction.other;

                        return (
                          <tr
                            key={transaction.id}
                            className="border-b border-gray-100 transition last:border-b-0 hover:bg-[#fffaf0]"
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
                                  <UserRound className="h-4 w-4" />
                                </div>

                                <div className="font-semibold text-gray-800">
                                  {transaction.employee}
                                </div>
                              </div>
                            </td>

                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${getBranchColor(transaction.branchId)}`}
                              >
                                <Building2 className="h-3.5 w-3.5" />
                                {transaction.branch}
                              </span>
                            </td>

                            <td className="px-6 py-4 text-sm font-medium text-gray-700">
                              {transaction.date
                                ? new Date(
                                    `${transaction.date}T00:00:00`
                                  ).toLocaleDateString("en-IN")
                                : "-"}
                            </td>

                            <td className="px-6 py-4 text-right text-sm font-medium text-gray-700">
                              ₹{transaction.cash.toLocaleString("en-IN")}
                            </td>

                            <td className="px-6 py-4 text-right text-sm font-medium text-gray-700">
                              ₹{transaction.online.toLocaleString("en-IN")}
                            </td>

                            <td className="px-6 py-4 text-right text-sm font-medium text-gray-700">
                              ₹{transaction.other.toLocaleString("en-IN")}
                            </td>

                            <td className="px-6 py-4 text-right text-sm font-bold text-[#17191d]">
                              ₹{total.toLocaleString("en-IN")}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
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
                              Try changing your filter.
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="border-t border-gray-200 bg-[#fafafa] px-6 py-4">
                <p className="text-sm text-gray-500">
                  Total transaction amount:{" "}
                  <span className="font-bold text-gray-800">
                    ₹{totalAmount.toLocaleString("en-IN")}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </section>
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