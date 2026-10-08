"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/app/components/Navbar";
import EditButton from "@/app/components/EditButton";
import Loader from "@/app/components/Loader";

import { supabase } from "@/app/lib/supabase";
import { toast } from "react-toastify";

import ExportTable from "../components/ExportTable";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type Employee = {
  id: string;
  name: string;
  branchId: string;
  salary: number;
  contactNumber: string;
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
  createdAt: string;

  contactNumber: string;
};

export default function AdvancePaymentReportPage() {
  const router = useRouter();
  const [reportType, setReportType] = useState<
    "employee" | "branch"
  >("employee");

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [advances, setAdvances] = useState<Advance[]>([]);

  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  

  useEffect(() => {
    const fetchAdvanceReportData = async () => {
      try {
        setLoading(true);

        // =========================
        // FETCH EMPLOYEES
        // =========================
        const {
          data: employeeData,
          error: employeeError,
        } = await supabase
          .from("employees")
          .select(`
          id,
          name,
          branch_id,
          salary,
          contact_number
        `)
          .order("name", {
            ascending: true,
          });

        if (employeeError) {
          console.error(
            "Employee fetch error:",
            employeeError
          );

          toast.error("Failed to load employees.");
          return;
        }

        // =========================
        // FETCH BRANCHES
        // =========================
        const {
          data: branchData,
          error: branchError,
        } = await supabase
          .from("branches")
          .select(`
          id,
          name
        `)
          .order("name", {
            ascending: true,
          });

        if (branchError) {
          console.error(
            "Branch fetch error:",
            branchError
          );

          toast.error("Failed to load branches.");
          return;
        }

        // =========================
        // FORMAT EMPLOYEES
        // =========================
        const formattedEmployees: Employee[] = (
          employeeData ?? []
        ).map((employee) => ({
          id: employee.id,
          name: employee.name,
          branchId: employee.branch_id,
          salary: Number(employee.salary ?? 0),
          contactNumber:
            employee.contact_number ?? "",
        }));

        // =========================
        // FORMAT BRANCHES
        // =========================
        const formattedBranches: Branch[] = (
          branchData ?? []
        ).map((branch) => ({
          id: branch.id,
          name: branch.name,
        }));

        // =========================
        // FETCH ADVANCE PAYMENTS
        // =========================
        const {
          data: advanceData,
          error: advanceError,
        } = await supabase
          .from("advance_payments")
          .select(`
          id,
          employee_id,
          branch_id,
          cash,
          online,
          description,
          advance_date,
          created_at
        `)
          .order("created_at", {
            ascending: false,
          });

        if (advanceError) {
          console.error(
            "Advance fetch error:",
            advanceError
          );

          toast.error(
            "Failed to load advance payments."
          );

          return;
        }

        // =========================
        // CREATE LOOKUP MAPS
        // =========================

        const employeeMap = new Map(
          formattedEmployees.map((employee) => [
            employee.id,
            employee,
          ])
        );

        const branchMap = new Map(
          formattedBranches.map((branch) => [
            branch.id,
            branch,
          ])
        );

        // =========================
        // FORMAT ADVANCES
        // =========================

        const formattedAdvances: Advance[] = (
          advanceData ?? []
        ).map((advance) => {
          const employee = employeeMap.get(
            advance.employee_id
          );

          const branch = branchMap.get(
            advance.branch_id
          );

          return {
            id: advance.id,

            employeeId: advance.employee_id,

            branchId: advance.branch_id,

            employee:
              employee?.name ?? "Unknown Employee",

            branch:
              branch?.name ?? "Unknown Branch",

            cash: Number(advance.cash ?? 0),

            online: Number(advance.online ?? 0),

            description:
              advance.description ?? "",

            date: advance.advance_date,

            createdAt: advance.created_at,

            contactNumber:
              employee?.contactNumber ?? "",
          };
        });

        // =========================
        // SET STATE
        // =========================

        setEmployees(formattedEmployees);

        setBranches(formattedBranches);

        setAdvances(formattedAdvances);

      } catch (error) {
        console.error(
          "Unexpected report error:",
          error
        );

        toast.error(
          "Something went wrong while loading advance report."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAdvanceReportData();
  }, []);

  // =========================
  // TODAY DATE
  // =========================
  const today = new Date().toISOString().split("T")[0];

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

 const filteredAdvances = useMemo(() => {
  const filtered = advances
    .filter((advance) => {
      // =========================
      // EMPLOYEE FILTER
      // =========================
      const matchesEmployee =
        reportType === "employee"
          ? !selectedEmployee ||
            advance.employeeId === selectedEmployee
          : true;

      // =========================
      // BRANCH FILTER
      // =========================
      const matchesBranch =
        reportType === "branch"
          ? !selectedBranch ||
            advance.branchId === selectedBranch
          : true;

      // =========================
      // FROM DATE
      // =========================
      const matchesFromDate =
        !fromDate || advance.date >= fromDate;

      // =========================
      // TO DATE
      // =========================
      const matchesToDate =
        !toDate || advance.date <= toDate;

      return (
        matchesEmployee &&
        matchesBranch &&
        matchesFromDate &&
        matchesToDate
      );
    })
    .sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt)
    );

  // =========================
  // DEFAULT
  // RECENT 10 ADVANCES
  // =========================
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
  advances,
  reportType,
  selectedEmployee,
  selectedBranch,
  fromDate,
  toDate,
]);

  const resetFilters = () => {
  setSelectedEmployee("");
  setSelectedBranch("");
  setFromDate("");
  setToDate("");
};

  // =========================
  // TOTAL CALCULATIONS
  // =========================
  const totalCash = filteredAdvances.reduce(
    (total, advance) => total + advance.cash,
    0
  );

  const totalOnline = filteredAdvances.reduce(
    (total, advance) => total + advance.online,
    0
  );

  const totalAdvance = totalCash + totalOnline;

  // =========================
  // BRANCH EMPLOYEE ADVANCE CHART
  // =========================

  type BranchEmployeeAdvanceChartData = {
    branch: string;
    employee: string;
    salary: number;
    totalAdvance: number;
    advancePercentage: number;
    isOverLimit: boolean;
  };

  const branchEmployeeAdvanceData =
    useMemo<BranchEmployeeAdvanceChartData[]>(() => {
      if (reportType !== "branch") {
        return [];
      }

      // =========================
      // ALL BRANCHES
      // =========================

      if (!selectedBranch) {
        const branchMap: Record<
          string,
          BranchEmployeeAdvanceChartData
        > = {};

        advances.forEach((advance) => {
          if (!branchMap[advance.branch]) {
            branchMap[advance.branch] = {
              branch: advance.branch,
              employee: "",
              salary: 0,
              totalAdvance: 0,
              advancePercentage: 0,
              isOverLimit: false,
            };
          }

          branchMap[advance.branch].totalAdvance +=
            advance.cash + advance.online;
        });

        return Object.values(branchMap);
      }

      // =========================
      // SELECTED BRANCH
      // EMPLOYEE WISE
      // =========================

      const employeeMap: Record<
        string,
        BranchEmployeeAdvanceChartData
      > = {};

      filteredAdvances.forEach((advance) => {
        const employeeId = advance.employeeId;

        if (!employeeMap[employeeId]) {
          const employeeData = employees.find(
            (employee) => employee.id === employeeId
          );

          employeeMap[employeeId] = {
            branch: advance.branch,
            employee:
              employeeData?.name ??
              advance.employee ??
              "Unknown Employee",
            salary: employeeData?.salary ?? 0,
            totalAdvance: 0,
            advancePercentage: 0,
            isOverLimit: false,
          };
        }

        employeeMap[employeeId].totalAdvance +=
          advance.cash + advance.online;
      });

      Object.values(employeeMap).forEach((employee) => {
        if (employee.salary > 0) {
          employee.advancePercentage =
            (employee.totalAdvance / employee.salary) * 100;
        } else {
          employee.advancePercentage = 0;
        }

        employee.isOverLimit =
          employee.advancePercentage > 50;
      });

      return Object.values(employeeMap);
    }, [
      advances,
      filteredAdvances,
      employees,
      reportType,
      selectedBranch,
    ]);

  const advanceExportData = filteredAdvances.map((advance) => ({
    employee: advance.employee,
    date: advance.date,
    cash: advance.cash,
    online: advance.online,
    total: advance.cash + advance.online,
  }));

  // =========================
  // SELECTED EMPLOYEE
  // =========================
  const selectedEmployeeData = employees.find(
    (employee) =>
      employee.id === selectedEmployee
  );

  // =========================
  // SELECTED BRANCH
  // =========================

  const selectedBranchData = branches.find(
    (branch) => branch.id === selectedBranch
  );

  // =========================
  // DATE VALIDATION
  // =========================
  const isInvalidDateRange =
    Boolean(fromDate && toDate && fromDate > toDate);

  const isReportReady = !isInvalidDateRange;

 if (loading) {
  return (
    <main className="min-h-screen bg-[#f5f6f8]">
      {/* ================= NAVBAR ================= */}
      <div className="relative bg-[#17191d]">
        <Navbar />
        <div className="h-24" />
      </div>

      {/* ================= LOADER ================= */}
      <section className="px-5 py-10 md:px-8">
        <div className="mx-auto max-w-7xl">
          <Loader text="Loading advance payment report..." />
        </div>
      </section>
    </main>
  );
}

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
            <div className="flex items-center gap-4">

              {/* Back Button */}
              <button
                type="button"
                onClick={() => router.back()}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-700 shadow-sm transition hover:bg-gray-100 hover:text-black"
                aria-label="Go back"
              >
                <ArrowLeft size={20} />
              </button>

              {/* Page Title */}
              <div className="flex items-center gap-3">
                <div className="h-8 w-1 rounded-full bg-[#f5b942]" />

                <h1 className="text-3xl font-bold tracking-tight text-[#17191d] md:text-4xl">
                  Advance Payment Report
                </h1>
              </div>

            </div>

            <p className="mt-3 ml-14 text-base text-gray-500">
              View and analyze advance payments by employee or branch.
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
                className={`rounded-xl border p-5 text-left transition ${reportType === "employee"
                    ? "border-[#f5b942] bg-[#fff9eb] shadow-sm"
                    : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
              >
                <div className="flex items-center gap-3">

                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-lg ${reportType === "employee"
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
                      View advance payment history of an employee
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
                className={`rounded-xl border p-5 text-left transition ${reportType === "branch"
                    ? "border-[#f5b942] bg-[#fff9eb] shadow-sm"
                    : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
              >
                <div className="flex items-center gap-3">

                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-lg ${reportType === "branch"
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
                      View advance payments of a particular branch
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
                    onChange={(e) =>
                      setSelectedEmployee(e.target.value)
                    }
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-[#f5b942] focus:ring-2 focus:ring-[#f5b942]/20"
                  >
                    <option value="">
                      Select Employee
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

                {/* From Date */}
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
                    onChange={(e) =>
                      setToDate(e.target.value)
                    }
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
                    onChange={(e) =>
                      setSelectedBranch(e.target.value)
                    }
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-[#f5b942] focus:ring-2 focus:ring-[#f5b942]/20"
                  >
                    <option value="">
                      Select Branch
                    </option>

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

                {/* From Date */}
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
                    onChange={(e) =>
                      setToDate(e.target.value)
                    }
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-[#f5b942] focus:ring-2 focus:ring-[#f5b942]/20"
                  />
                </div>

              </div>
            )}

            {/* ================= VALIDATION MESSAGE ================= */}
            {!isReportReady && (
              <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
                <p className="text-sm font-medium text-blue-700">
                  {!fromDate || !toDate
                    ? "Please select both From Date and To Date to view advance payments."
                    : isInvalidDateRange
                      ? "To Date cannot be earlier than From Date."
                      : reportType === "employee"
                        ? "Please select an employee to generate the report."
                        : "Please select a branch to generate the report."}
                </p>
              </div>
            )}
          </div>

          {/* ================= SELECTED EMPLOYEE ================= */}
          {reportType === "employee" &&
            selectedEmployeeData && (
              <div className="mb-6 rounded-2xl border border-[#f5b942]/40 bg-[#fff9eb] p-5">

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                  <div>
                    <p className="text-sm text-gray-500">
                      Employee Advance Payment Report
                    </p>

                    <h2 className="mt-1 text-2xl font-bold text-gray-900">
                      {selectedEmployeeData.name}
                    </h2>

                    <p className="mt-1 text-sm text-gray-600">
                      Contact:{" "}
                      <span className="font-semibold">
                        {selectedEmployeeData.contactNumber || "-"}
                      </span>
                    </p>
                  </div>

                  <div className="rounded-xl bg-white px-6 py-4 text-center shadow-sm">

                    <p className="text-xs uppercase tracking-wide text-gray-500">
                      Advance Payments
                    </p>

                    <p className="mt-1 text-xl font-bold text-gray-900">
                      {filteredAdvances.length}
                    </p>

                  </div>

                </div>

              </div>
            )}

          {/* ================= SELECTED BRANCH ================= */}
          {reportType === "branch" && selectedBranch && (
            <div className="mb-6 rounded-2xl border border-[#f5b942]/40 bg-[#fff9eb] p-5">

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>
                  <p className="text-sm text-gray-500">
                    Branch Advance Payment Report
                  </p>

                  <h2 className="mt-1 text-2xl font-bold text-gray-900">
                    {selectedBranchData?.name ?? "Selected Branch"}
                  </h2>
                </div>

                <div className="rounded-xl bg-white px-6 py-4 text-center shadow-sm">

                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    Advance Payments
                  </p>

                  <p className="mt-1 text-xl font-bold text-gray-900">
                    {filteredAdvances.length}
                  </p>

                </div>

              </div>

            </div>
          )}

          {/* ================= BRANCH EMPLOYEE ADVANCE CHART ================= */}
          {reportType === "branch" &&

            !isInvalidDateRange && (
              <div className="mb-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

                <div className="border-b border-gray-200 px-6 py-5">
                  <h2 className="text-lg font-bold text-gray-900">
                    {selectedBranch
                      ? "Employee Wise Advance Payment"
                      : "Branch Wise Advance Payment"}
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    {selectedBranch
                      ? `Total advance taken by employees of ${selectedBranchData?.name ?? "selected"
                      } branch`
                      : "Total advance payment across all branches"}
                  </p>

                </div>

                <div className="px-4 py-6 sm:px-6">
                  {branchEmployeeAdvanceData.length > 0 ? (
                    <div className="max-h-[500px] overflow-y-auto overflow-x-auto pr-2">
                      <div
                        style={{
                          height: "450px",
                          minWidth: `${Math.max(
                            700,
                            branchEmployeeAdvanceData.length * 90
                          )}px`,
                        }}
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={branchEmployeeAdvanceData}
                            margin={{
                              top: 10,
                              right: 30,
                              left: 10,
                              bottom: 70,
                            }}
                            barCategoryGap="20%"
                          >
                            <CartesianGrid
                              strokeDasharray="3 3"
                              vertical={false}
                              stroke="#e5e7eb"
                            />

                            <XAxis
                              dataKey={selectedBranch ? "employee" : "branch"}
                              tick={{
                                fontSize: 12,
                                fill: "#374151",
                              }}
                              axisLine={false}
                              tickLine={false}
                              angle={-35}
                              textAnchor="end"
                              height={80}
                            />

                            <YAxis
                              tick={{
                                fontSize: 12,
                                fill: "#6b7280",
                              }}
                              axisLine={false}
                              tickLine={false}
                              tickFormatter={(value) =>
                                `₹${Number(value).toLocaleString("en-IN")}`
                              }
                            />

                            <Tooltip
                              cursor={{ fill: "#f9fafb" }}
                              contentStyle={{
                                borderRadius: "10px",
                                border: "1px solid #e5e7eb",
                                boxShadow:
                                  "0 4px 12px rgba(0,0,0,0.08)",
                              }}
                              formatter={(value) => [
                                `₹${Number(value).toLocaleString("en-IN")}`,
                                "Total Advance",
                              ]}
                              labelFormatter={(label) =>
                                selectedBranch
                                  ? `Employee: ${label}`
                                  : `Branch: ${label}`
                              }
                            />

                            <Bar
                              dataKey="totalAdvance"
                              name="Total Advance"
                              radius={[8, 8, 0, 0]}
                              barSize={38}
                            >
                              {branchEmployeeAdvanceData.map((entry, index) => {
                                const percentage = entry.advancePercentage ?? 0;

                                let barColor = "#067a3f"; // Light Green

                                if (percentage > 50) {
                                  barColor = "#8f1818"; // Light Red
                                } else if (percentage > 20) {
                                  barColor = "#8b720c"; // Light Yellow
                                }

                                return (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={barColor}
                                  />
                                );
                              })}

                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  ) : (
                    <div className="flex h-[300px] items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50">
                      <div className="text-center">
                        <div className="text-3xl">📊</div>

                        <p className="mt-3 font-semibold text-gray-700">
                          No Advance Data
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                          No advance payments found for the selected
                          branch and date range.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          {/* ================= ADVANCE TABLE ================= */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

            <div className="flex flex-col gap-4 border-b border-gray-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Advance Payment History
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {filteredAdvances.length} advance payment
                  {filteredAdvances.length !== 1 ? "s" : ""} found
                </p>
              </div>

             {/* Export + Reset */}
<div className="flex items-center gap-3">
  <button
    type="button"
    onClick={resetFilters}
    className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-[#f5b942] hover:bg-[#fff9eb] hover:text-gray-900"
  >
    Reset Filters
  </button>

  <ExportTable
    data={advanceExportData}
    columns={[
      ...(reportType === "branch"
        ? [
            {
              header: "Employee",
              key: "employee" as keyof (typeof advanceExportData)[number],
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
        ? "Employee-Advance-Payment-Report"
        : "Branch-Advance-Payment-Report"
    }
    disabled={!isReportReady}
  />
</div>
            </div>
            <div className="overflow-x-auto">

              <table className="w-full min-w-[700px]">

<thead>
  <tr className="bg-[#17191d] text-left text-sm text-white">

    <th className="px-6 py-4 font-semibold">
      Employee
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
      Total
    </th>

    <th className="px-6 py-4 text-center font-semibold">
      Action
    </th>

  </tr>
</thead>

                <tbody>

                  {filteredAdvances.length > 0 ? (

                    filteredAdvances.map((advance) => {

                      const total =
                        advance.cash + advance.online;

                      return (
                        <tr
                          key={advance.id}
                          className="border-b border-gray-100 transition hover:bg-[#fffaf0]"
                        >
                          {/* Employee */}
                          <td className="px-6 py-4 text-sm font-semibold text-gray-800">
                            {advance.employee}
                          </td>

                          {/* Branch */}
                          {reportType === "branch" && (
                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getBranchColor(
                                  advance.branch
                                )}`}
                              >
                                {advance.branch}
                              </span>
                            </td>
                          )}

                          {/* Date */}
                          <td className="px-6 py-4 text-sm font-medium text-gray-800">
                            {advance.date}
                          </td>

                          {/* Cash */}
                          <td className="px-6 py-4 text-right text-sm font-medium text-gray-700">
                            ₹{advance.cash.toLocaleString("en-IN")}
                          </td>

                          {/* Online */}
                          <td className="px-6 py-4 text-right text-sm font-medium text-gray-700">
                            ₹{advance.online.toLocaleString("en-IN")}
                          </td>

                          {/* Total */}
                          <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                            ₹{total.toLocaleString("en-IN")}
                          </td>

                          {/* Action */}
                          <td className="px-6 py-4 text-center">
                            <EditButton
                              href={`/advance/edit/${advance.id}`}
                            />
                          </td>
                        </tr>
                      );
                    })

                  ) : (

                    <tr>

                      <td
                        colSpan={reportType === "branch" ? 7 : 6}
                        className="px-6 py-12 text-center"
                      >

                        <div className="text-3xl">
                          📋
                        </div>

                        <p className="mt-3 font-semibold text-gray-700">

                          {isInvalidDateRange
                            ? "Invalid Date Range"
                            : "No Advance Payments Found"}

                        </p>

                        <p className="mt-1 text-sm text-gray-500">

                          {isInvalidDateRange
                            ? "Please select a valid date range."
                            : "No advance payments are available for the selected filters."}

                        </p>

                      </td>

                    </tr>

                  )}

                </tbody>

              </table>

            </div>
          </div>

          {/* ================= TOTAL CALCULATION ================= */}
          <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

            <div className="border-b border-gray-200 bg-[#17191d] px-6 py-5">

              <h2 className="text-lg font-bold text-white">

                {reportType === "employee" &&
                  selectedEmployeeData
                  ? `${selectedEmployeeData.name} - Total Advance Payment Calculation`
                  : reportType === "branch" &&
                    selectedBranch
                    ? `${selectedBranch} - Total Advance Payment Calculation`
                    : "Total Advance Payment Calculation"}

              </h2>


              <p className="mt-1 text-sm text-gray-400">

                {reportType === "employee"
                  ? "Employee wise advance payment summary"
                  : "Branch wise advance payment summary"}

              </p>

            </div>

            <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-3">

              {/* Total Cash */}
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">

                <p className="text-sm font-medium text-gray-500">
                  Total Cash
                </p>

                <p className="mt-2 text-2xl font-bold text-gray-900">
                  ₹{totalCash.toLocaleString("en-IN")}
                </p>

              </div>

              {/* Total Online */}
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">

                <p className="text-sm font-medium text-gray-500">
                  Total Online
                </p>

                <p className="mt-2 text-2xl font-bold text-gray-900">
                  ₹{totalOnline.toLocaleString("en-IN")}
                </p>

              </div>

              {/* Total Advance */}
              <div className="rounded-xl border border-[#f5b942] bg-[#fff9eb] p-5">

                <p className="text-sm font-medium text-gray-600">
                  Total Advance
                </p>

                <p className="mt-2 text-3xl font-bold text-gray-900">
                  ₹{totalAdvance.toLocaleString("en-IN")}
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