"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Loader from "@/app/components/Loader";

import Navbar from "@/app/components/Navbar";
import ExportTable from "@/app/components/ExportTable";
import FormSelect from "@/app/components/forms/FormSelect";
import { supabase } from "@/app/lib/supabase";

import { toast } from "react-toastify";

import {
  Search,
  RotateCcw,
  UserRound,
  Building2,
  CalendarDays,
  IndianRupee,
  ArrowLeft,
} from "lucide-react";

type PeriodFilter = "all" | "day" | "week" | "month" | "year";

type Employee = {
  id: string;
  name: string;
  employeeNumber: string;
  branchId: string;
  branch: string;
  salary: number;
};

type Branch = {
  id: string;
  name: string;
};

type Transaction = {
  id: string;
  employeeId: string;
  branchId: string;
  amount: number;
  paymentMode: string;
  transactionDate: string;
};

type IncentiveRule = {
  id: string;
  name: string;
  minBusiness: number;
  maxBusiness: number;
  incentivePercentage: number;
  status: "Active" | "Inactive";
};

type IncentiveEmployee = {
  id: string;
  employeeId: string;
  employee: string;
  employeeNumber: string;
  branch: string;
  branchId: string;
  month: string;
  business: number;
  salary: number;
  incentivePercentage: number;
  incentiveAmount: number;
  ruleName: string;
};

export default function IncentiveEmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [rules, setRules] = useState<IncentiveRule[]>([]);

  const [loading, setLoading] = useState(true);

  

  const [selectedMonth, setSelectedMonth] =
    useState(
      new Date().toISOString().slice(0, 7)
    );

  const [selectedBranch, setSelectedBranch] =
    useState("");

  const [selectedEmployee, setSelectedEmployee] =
    useState("");

  

  // =========================================================
  // FETCH SUPABASE DATA
  // =========================================================

  const fetchData = async () => {
    try {
      setLoading(true);

      const [
        employeesResponse,
        branchesResponse,
        transactionsResponse,
        rulesResponse,
      ] = await Promise.all([
        supabase
          .from("employees")
          .select(
            "id, name, employee_number, branch_id, salary"
          )
          .order("name"),

        supabase
          .from("branches")
          .select("id, name")
          .order("name"),

        supabase
          .from("transactions")
          .select(
            "id, employee_id, branch_id, amount, payment_mode, transaction_date"
          ),

        supabase
          .from("incentive_rules")
          .select(
            "id, name, min_business, max_business, incentive_percentage, status"
          )
          .eq("status", "Active")
          .order("min_business"),
      ]);

      // =======================================================
      // ERROR CHECK
      // =======================================================

      if (employeesResponse.error) {
        console.error(
          "Employees error:",
          employeesResponse.error
        );

        toast.error(
          employeesResponse.error.message
        );

        return;
      }

      if (branchesResponse.error) {
        console.error(
          "Branches error:",
          branchesResponse.error
        );

        toast.error(
          branchesResponse.error.message
        );

        return;
      }

      if (transactionsResponse.error) {
        console.error(
          "Transactions error:",
          transactionsResponse.error
        );

        toast.error(
          transactionsResponse.error.message
        );

        return;
      }

      if (rulesResponse.error) {
        console.error(
          "Incentive rules error:",
          rulesResponse.error
        );

        toast.error(
          rulesResponse.error.message
        );

        return;
      }

      // =======================================================
      // BRANCHES
      // =======================================================

      const branchData: Branch[] =
        (branchesResponse.data || []).map(
          (branch) => ({
            id: String(branch.id),
            name: branch.name,
          })
        );

      setBranches(branchData);

      // =======================================================
      // EMPLOYEES
      // =======================================================

      const employeeData: Employee[] =
        (employeesResponse.data || []).map(
          (employee) => {
            const branch =
              branchData.find(
                (item) =>
                  item.id ===
                  String(employee.branch_id)
              );

            return {
              id: String(employee.id),

              name:
                employee.name ||
                "Unknown Employee",

              employeeNumber:
                employee.employee_number ||
                "",

              branchId:
                String(employee.branch_id),

              branch:
                branch?.name ||
                "Unknown Branch",

              salary:
                Number(employee.salary) || 0,
            };
          }
        );

      setEmployees(employeeData);

      // =======================================================
      // TRANSACTIONS
      // =======================================================

      const transactionData: Transaction[] =
        (transactionsResponse.data || []).map(
          (transaction) => ({
            id: String(transaction.id),

            employeeId:
              String(transaction.employee_id),

            branchId:
              String(transaction.branch_id),

            amount:
              Number(transaction.amount) || 0,

            paymentMode:
              transaction.payment_mode || "",

            transactionDate:
              String(
                transaction.transaction_date || ""
              ),
          })
        );

      setTransactions(transactionData);

      // =======================================================
      // INCENTIVE RULES
      // =======================================================

      const ruleData: IncentiveRule[] =
        (rulesResponse.data || []).map(
          (rule) => ({
            id: String(rule.id),

            name: rule.name,

            minBusiness:
              Number(rule.min_business) || 0,

            maxBusiness:
              Number(rule.max_business) || 0,

            incentivePercentage:
              Number(
                rule.incentive_percentage
              ) || 0,

            status:
              rule.status === "Inactive"
                ? "Inactive"
                : "Active",
          })
        );

      setRules(ruleData);

      console.log(
        "EMPLOYEES:",
        employeeData
      );

      console.log(
        "TRANSACTIONS:",
        transactionData
      );

      console.log(
        "INCENTIVE RULES:",
        ruleData
      );
    } catch (error) {
      console.error(
        "Fetch incentive data error:",
        error
      );

      toast.error(
        "Failed to load incentive data."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    fetchData();
  }, []);

  // =========================================================
  // CALCULATE MONTHLY BUSINESS
  // =========================================================

  const getEmployeeMonthlyBusiness = (
    employeeId: string,
    month: string
  ) => {
    return transactions
      .filter((transaction) => {
        if (
          transaction.employeeId !==
          employeeId
        ) {
          return false;
        }

        if (!transaction.transactionDate) {
          return false;
        }

        return (
          transaction.transactionDate.startsWith(
            month
          )
        );
      })
      .reduce(
        (total, transaction) =>
          total + transaction.amount,
        0
      );
  };

  // =========================================================
  // FIND INCENTIVE RULE
  // =========================================================

  const getIncentiveRule = (
    business: number
  ) => {
    return rules.find(
      (rule) =>
        rule.status === "Active" &&
        business >= rule.minBusiness &&
        business <= rule.maxBusiness
    );
  };

  // =========================================================
  // BUILD INCENTIVE RECORDS
  // =========================================================

  const incentives: IncentiveEmployee[] =
    useMemo(() => {
      return employees.map(
        (employee) => {
          const business =
            getEmployeeMonthlyBusiness(
              employee.id,
              selectedMonth
            );

          const matchedRule =
            getIncentiveRule(
              business
            );

          const incentivePercentage =
            matchedRule
              ? matchedRule.incentivePercentage
              : 0;

          const incentiveAmount =
            (employee.salary *
              incentivePercentage) /
            100;

          return {
            id: `${employee.id}-${selectedMonth}`,

            employeeId:
              employee.id,

            employee:
              employee.name,

            employeeNumber:
              employee.employeeNumber,

            branch:
              employee.branch,

            branchId:
              employee.branchId,

            month:
              selectedMonth,

            business,

            salary:
              employee.salary,

            incentivePercentage,

            incentiveAmount,

            ruleName:
              matchedRule
                ? matchedRule.name
                : "No Rule",
          };
        }
      );
    }, [
      employees,
      transactions,
      rules,
      selectedMonth,
    ]);

  // =========================================================
  // FILTER
  // =========================================================

  const filteredIncentives = useMemo(() => {
  return incentives.filter((item) => {
    const matchesBranch =
      !selectedBranch ||
      item.branchId === selectedBranch;

    const matchesEmployee =
      !selectedEmployee ||
      item.employeeId === selectedEmployee;

    return matchesBranch && matchesEmployee;
  });
}, [
  incentives,
  selectedBranch,
  selectedEmployee,
]);

  // =========================================================
  // SUMMARY
  // =========================================================

  const totalBusiness =
    filteredIncentives.reduce(
      (sum, item) =>
        sum + item.business,
      0
    );

  const totalIncentive =
    filteredIncentives.reduce(
      (sum, item) =>
        sum + item.incentiveAmount,
      0
    );

  // =========================================================
  // FORMAT CURRENCY
  // =========================================================

  const formatCurrency = (
    amount: number
  ) => {
    return `₹${amount.toLocaleString(
      "en-IN",
      {
        maximumFractionDigits: 2,
      }
    )}`;
  };

  // =========================================================
  // RESET FILTER
  // =========================================================

 const resetFilters = () => {
  setSelectedBranch("");
  setSelectedEmployee("");
  setSelectedMonth(
    new Date()
      .toISOString()
      .slice(0, 7)
  );
};

  // =========================================================
  // EXPORT
  // =========================================================

  const incentiveExportData =
    filteredIncentives.map(
      (item) => ({
        employee:
          item.employee,

        employeeNumber:
          item.employeeNumber,

        branch:
          item.branch,

        month:
          item.month,

        business:
          item.business,

        salary:
          item.salary,

        incentivePercentage:
          `${item.incentivePercentage}%`,

        incentiveAmount:
          item.incentiveAmount,

        rule:
          item.ruleName,
      })
    );

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
          CONTENT
      ===================================================== */}

     {loading ? (
  <Loader
    text="Loading incentive data..."
    fullScreen
  />
) : (
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
                  title="Back"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Link>

                <div className="h-8 w-1 rounded-full bg-[#f5b942]" />

                <h1 className="text-3xl font-bold tracking-tight text-[#17191d] md:text-4xl">
                  Incentive Employees
                </h1>

              </div>

              <p className="ml-4 mt-3 text-base text-gray-500">
                Employee monthly business and
                incentive calculation.
              </p>

            </div>

            <button
              type="button"
              onClick={fetchData}
              disabled={loading}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#17191d] px-5 text-sm font-semibold text-white transition hover:bg-black disabled:opacity-50"
            >

              <RotateCcw className="h-4 w-4" />

              Refresh

            </button>

          </div>

{/* =================================================
    FILTERS
================================================= */}

<div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

    {/* MONTH */}

    <div>
      <label className="mb-2 block text-sm font-semibold text-gray-700">
        Month
      </label>

      <input
        type="month"
        value={selectedMonth}
        onChange={(e) =>
          setSelectedMonth(e.target.value)
        }
        className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none transition focus:border-[#d59618] focus:ring-2 focus:ring-[#f5b942]/20"
      />
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
          label: branch.name,
          value: branch.id,
        })),
      ]}
    />

    {/* EMPLOYEE */}

    <FormSelect
      label="Employee"
      value={selectedEmployee}
      onChange={(e) =>
        setSelectedEmployee(e.target.value)
      }
      options={[
        {
          label: "All Employees",
          value: "",
        },
        ...employees.map((employee) => ({
          label: employee.name,
          value: employee.id,
        })),
      ]}
    />

  </div>

</div>         

          {/* =================================================
              SUMMARY
          ================================================= */}

          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">

            <SummaryCard
              title="Employees"
              value={String(
                filteredIncentives.length
              )}
              subtitle="Employees"
              icon={
                <UserRound className="h-5 w-5" />
              }
              iconClass="bg-blue-50 text-blue-600"
            />

            <SummaryCard
              title="Total Business"
              value={formatCurrency(
                totalBusiness
              )}
              subtitle={`Business for ${selectedMonth}`}
              icon={
                <IndianRupee className="h-5 w-5" />
              }
              iconClass="bg-amber-50 text-[#d59618]"
            />

            <SummaryCard
              title="Total Incentive"
              value={formatCurrency(
                totalIncentive
              )}
              subtitle="Total incentive payable"
              icon={
                <IndianRupee className="h-5 w-5" />
              }
              iconClass="bg-green-50 text-green-600"
            />

          </div>

          {/* =================================================
              TABLE
          ================================================= */}

          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

            {/* TABLE HEADER */}

            <div className="flex flex-col gap-4 border-b border-gray-200 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">

              <div>

                <h2 className="text-lg font-bold text-[#17191d]">
                  Employee Incentive Records
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Salary, monthly business and
                  calculated incentive.
                </p>

              </div>

              <div className="flex flex-wrap gap-3">

  {/* RESET */}

  <button
    type="button"
    onClick={resetFilters}
    className="inline-flex h-11 items-center gap-2 rounded-lg border border-gray-300 bg-white px-5 text-sm font-semibold text-gray-700 transition hover:border-[#f5b942] hover:bg-[#fff9eb] hover:text-gray-900"
  >
    <RotateCcw className="h-4 w-4" />
    Reset
  </button>

  {/* EXPORT */}

  <ExportTable
    data={incentiveExportData}
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
        header: "Month",
        key: "month",
      },
      {
        header: "Business",
        key: "business",
      },
      {
        header: "Salary",
        key: "salary",
      },
      {
        header: "Incentive %",
        key: "incentivePercentage",
      },
      {
        header: "Incentive Amount",
        key: "incentiveAmount",
      },
      {
        header: "Rule",
        key: "rule",
      },
    ]}
    fileName="Employee-Incentive-Report"
    disabled={!filteredIncentives.length}
  />

</div>

            </div>

            {/* TABLE */}

            <div className="overflow-x-auto">

              <table className="w-full min-w-[1350px]">

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
                      Month
                    </th>

                    <th className="px-6 py-4 font-semibold">
                      Business
                    </th>

                    <th className="px-6 py-4 font-semibold">
                      Salary
                    </th>

                    <th className="px-6 py-4 font-semibold">
                      Incentive %
                    </th>

                    <th className="px-6 py-4 font-semibold">
                      Incentive Amount
                    </th>

                    <th className="px-6 py-4 font-semibold">
                      Rule
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {loading ? (

                    <tr>

                      <td
                        colSpan={9}
                        className="px-6 py-16 text-center"
                      >

                        <div className="flex flex-col items-center">

                          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#f5b942]" />

                          <p className="mt-3 text-sm text-gray-500">
                            Loading incentive data...
                          </p>

                        </div>

                      </td>

                    </tr>

                  ) : filteredIncentives.length > 0 ? (

                    filteredIncentives.map(
                      (item) => (

                        <tr
                          key={item.id}
                          className="border-b border-gray-100 transition last:border-b-0 hover:bg-[#fffaf0]"
                        >

                          {/* EMPLOYEE */}

                          <td className="px-6 py-4">

                            <div className="flex items-center gap-3">

                              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#fff9eb] text-[#a86f00]">

                                <UserRound className="h-4 w-4" />

                              </div>

                              <span className="font-semibold text-gray-800">
                                {item.employee}
                              </span>

                            </div>

                          </td>

                          {/* EMPLOYEE NUMBER */}

                          <td className="px-6 py-4 text-sm text-gray-600">
                            {item.employeeNumber || "-"}
                          </td>

                          {/* BRANCH */}

                          <td className="px-6 py-4">

                            <span className="inline-flex items-center gap-2 text-sm text-gray-700">

                              <Building2 className="h-4 w-4 text-gray-400" />

                              {item.branch}

                            </span>

                          </td>

                          {/* MONTH */}

                          <td className="px-6 py-4">

                            <span className="inline-flex items-center gap-2 text-sm font-medium text-gray-700">

                              <CalendarDays className="h-4 w-4 text-gray-400" />

                              {item.month}

                            </span>

                          </td>

                          {/* BUSINESS */}

                          <td className="px-6 py-4 text-sm font-semibold text-gray-700">
                            {formatCurrency(
                              item.business
                            )}
                          </td>

                          {/* SALARY */}

                          <td className="px-6 py-4 text-sm font-semibold text-gray-600">
                            {formatCurrency(
                              item.salary
                            )}
                          </td>

                          {/* INCENTIVE % */}

                          <td className="px-6 py-4">

                            <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">

                              {
                                item.incentivePercentage
                              }
                              %

                            </span>

                          </td>

                          {/* INCENTIVE AMOUNT */}

                          <td className="px-6 py-4">

                            <span className="font-bold text-green-700">

                              {formatCurrency(
                                item.incentiveAmount
                              )}

                            </span>

                          </td>

                          {/* RULE */}

                          <td className="px-6 py-4">

                            <span
                              className={
                                item.incentivePercentage >
                                0
                                  ? "inline-flex rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700"
                                  : "inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600"
                              }
                            >
                              {item.ruleName}
                            </span>

                          </td>

                        </tr>

                      )
                    )

                  ) : (

                    <tr>

                      <td
                        colSpan={9}
                        className="px-6 py-16 text-center"
                      >

                        <div className="flex flex-col items-center">

                          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">

                            <Search className="h-6 w-6 text-gray-400" />

                          </div>

                          <h3 className="mt-4 text-base font-semibold text-gray-900">
                            No incentive records found
                          </h3>

                          <p className="mt-1 text-sm text-gray-500">
                            No employee matched an
                            incentive rule for this month.
                          </p>

                        </div>

                      </td>

                    </tr>

                  )}

                </tbody>

              </table>

            </div>

            {/* FOOTER */}

            <div className="border-t border-gray-200 bg-[#fafafa] px-6 py-4">

              <div className="flex flex-col gap-2 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">

                <p>

                  Total Business:{" "}

                  <span className="font-bold text-gray-800">

                    {formatCurrency(
                      totalBusiness
                    )}

                  </span>

                </p>

                <p>

                  Total Incentive:{" "}

                  <span className="font-bold text-green-700">

                    {formatCurrency(
                      totalIncentive
                    )}

                  </span>

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

// =============================================================
// SUMMARY CARD
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