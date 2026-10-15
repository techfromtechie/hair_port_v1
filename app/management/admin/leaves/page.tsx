
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  RotateCcw,
  UserRound,
  Building2,
  CalendarDays,
  FileText,
  ArrowLeft,
} from "lucide-react";
import { toast } from "react-toastify";

import Navbar from "@/app/components/Navbar";
import ExportTable from "@/app/components/ExportTable";
import FormSelect from "@/app/components/forms/FormSelect";
import { supabase } from "@/app/lib/supabase";

type Branch = {
  id: string;
  name: string;
};

type Employee = {
  id: string;
  name: string;
  employee_number: string | null;
  branch_id: string | null;
};

type LeaveRecord = {
  id: string;
  employee_id: string;
  branch_id: string;
  leave_date: string;
  leave_type: string;
  created_at?: string;
};

type Leave = {
  id: string;
  employee: string;
  
  branch: string;
  date: string;
  leaveType: string;
};

type LeaveTypeFilter = "all" | "Full" | "Half";

export default function AdminLeavesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [leaves, setLeaves] = useState<Leave[]>([]);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedLeaveType, setSelectedLeaveType] =
    useState<LeaveTypeFilter>("all");

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  // =========================================
  // FETCH LEAVES, EMPLOYEES AND BRANCHES
  // =========================================

  useEffect(() => {
    let active = true;

    const fetchLeaveData = async () => {
      setLoading(true);
      setLoadError("");

      try {
        const [
          { data: branchData, error: branchError },
          { data: employeeData, error: employeeError },
          { data: leaveData, error: leaveError },
        ] = await Promise.all([
          supabase
            .from("branches")
            .select("id, name")
            .order("name", { ascending: true }),

          supabase
            .from("employees")
            .select("id, name, employee_number, branch_id")
            .order("name", { ascending: true }),

          supabase
            .from("leaves")
            .select(
              "id, employee_id, branch_id, leave_date, leave_type, created_at"
            )
            .order("leave_date", { ascending: false }),
        ]);

        if (branchError) throw branchError;
        if (employeeError) throw employeeError;
        if (leaveError) throw leaveError;

        const branchRows = (branchData ?? []) as Branch[];
        const employeeRows = (employeeData ?? []) as Employee[];
        const leaveRows = (leaveData ?? []) as LeaveRecord[];

        const branchMap = new Map<string, Branch>(
          branchRows.map((branch) => [branch.id, branch])
        );

        const employeeMap = new Map<string, Employee>(
          employeeRows.map((employee) => [employee.id, employee])
        );

        const formattedLeaves: Leave[] = leaveRows.map((leave) => {
          const employee = employeeMap.get(leave.employee_id);
          const branch = branchMap.get(leave.branch_id);

          return {
            id: String(leave.id),
            employee: employee?.name ?? "Unknown Employee",
            
            branch: branch?.name ?? "Unknown Branch",
            date: String(leave.leave_date).split("T")[0],
            leaveType: leave.leave_type,
          };
        });

        if (!active) return;

        setBranches(branchRows);
        setLeaves(formattedLeaves);
      } catch (error) {
        console.error("Leave data fetch error:", error);

        if (!active) return;

        setLoadError(
          error instanceof Error
            ? error.message
            : "Unable to load leave records."
        );

        toast.error("Failed to load leave records.");
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchLeaveData();

    return () => {
      active = false;
    };
  }, []);

  // =========================================
  // FILTER LEAVES
  // =========================================

  const filteredLeaves = useMemo(() => {
    return leaves
      .filter((leave) => {
        const matchesBranch =
          !selectedBranch || leave.branch === selectedBranch;

        const matchesLeaveType =
          selectedLeaveType === "all" ||
          leave.leaveType === selectedLeaveType;

        const matchesFromDate =
          !fromDate || leave.date >= fromDate;

        const matchesToDate =
          !toDate || leave.date <= toDate;

        return (
          matchesBranch &&
          matchesLeaveType &&
          matchesFromDate &&
          matchesToDate
        );
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [leaves, selectedBranch, selectedLeaveType, fromDate, toDate]);

  // =========================================
  // TOTAL CALCULATIONS
  // =========================================

  const fullLeaveCount = filteredLeaves.filter(
    (leave) => leave.leaveType === "Full"
  ).length;

  const halfLeaveCount = filteredLeaves.filter(
    (leave) => leave.leaveType === "Half"
  ).length;

  const totalLeaveCount = fullLeaveCount + halfLeaveCount * 0.5;

  // =========================================
  // EXPORT DATA
  // =========================================

  const leaveExportData = filteredLeaves.map((leave) => ({
    employee: leave.employee,
    
    branch: leave.branch,
    date: leave.date,
    leaveType: leave.leaveType,
  }));

  // =========================================
  // RESET FILTERS
  // =========================================

  const resetFilters = () => {
    setFromDate("");
    setToDate("");
    setSelectedBranch("");
    setSelectedLeaveType("all");
  };

  // =========================================
  // UI
  // =========================================

  return (
    <main className="min-h-screen bg-[#f5f6f8]">
      <div className="relative bg-[#17191d]">
        <Navbar />
        <div className="h-24" />
      </div>

      <section className="px-5 py-10 md:px-8">
        <div className="mx-auto max-w-7xl">
          {/* PAGE HEADER */}
          <div className="mb-8">
            <div className="flex items-center gap-3">
              <Link
                href="/management/admin"
                title="Back to Admin Dashboard"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition hover:border-[#f5b942] hover:bg-[#fff9eb] hover:text-[#a86f00]"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>

              <div className="h-8 w-1 rounded-full bg-[#f5b942]" />

              <h1 className="text-3xl font-bold tracking-tight text-[#17191d] md:text-4xl">
                Leaves
              </h1>
            </div>

            <p className="ml-4 mt-3 text-base text-gray-500">
              View and manage employee leave records.
            </p>
          </div>

          {/* VISIBLE FILTERS */}
          <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

              <FormSelect
                label="Branch"
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                options={[
                  { label: "All Branches", value: "" },
                  ...branches.map((branch) => ({
                    label: branch.name,
                    value: branch.name,
                  })),
                ]}
              />

              <FormSelect
                label="Leave Type"
                value={selectedLeaveType}
                onChange={(e) =>
                  setSelectedLeaveType(
                    e.target.value as LeaveTypeFilter
                  )
                }
                options={[
                  { label: "All Leave Types", value: "all" },
                  { label: "Full Leave", value: "Full" },
                  { label: "Half Leave", value: "Half" },
                ]}
              />
            </div>
          </div>

          {/* SUMMARY CARDS */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard
              title="Recent Leaves"
              value={loading ? "..." : String(filteredLeaves.length)}
              subtitle="Filtered records"
              icon={<FileText className="h-5 w-5" />}
              iconClass="bg-blue-50 text-blue-600"
            />

            <SummaryCard
              title="Full Leave"
              value={loading ? "..." : String(fullLeaveCount)}
              subtitle="Full day leaves"
              icon={<CalendarDays className="h-5 w-5" />}
              iconClass="bg-amber-50 text-[#d59618]"
            />

            <SummaryCard
              title="Half Leave"
              value={loading ? "..." : String(halfLeaveCount)}
              subtitle="Half day leaves"
              icon={<UserRound className="h-5 w-5" />}
              iconClass="bg-violet-50 text-violet-600"
            />

            <SummaryCard
              title="Total Leave"
              value={loading ? "..." : String(totalLeaveCount)}
              subtitle="Full = 1, Half = 0.5"
              icon={<Building2 className="h-5 w-5" />}
              iconClass="bg-green-50 text-green-600"
            />
          </div>

          {/* LEAVES TABLE */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-gray-200 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#17191d]">
                  Recent Leaves
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Employee leave history based on the selected filters.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <ExportTable
                  data={leaveExportData}
                  columns={[
                    { header: "Employee", key: "employee" },
                    
                    { header: "Branch", key: "branch" },
                    { header: "Date", key: "date" },
                    { header: "Leave Type", key: "leaveType" },
                  ]}
                  fileName="Employee-Leaves"
                  disabled={loading || !filteredLeaves.length}
                />

                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </button>

                <Link
                  href="/leave/add"
                  className="inline-flex h-11 items-center gap-2 rounded-lg bg-[#17191d] px-5 text-sm font-semibold text-white transition hover:bg-black"
                >
                  <Plus className="h-4 w-4" />
                  Add Leave
                </Link>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-full table-auto">
                <thead>
                  <tr className="bg-[#17191d] text-left text-sm text-white">
                    <th className="px-6 py-4 font-semibold">Employee</th>
                   
                    <th className="px-6 py-4 font-semibold">Branch</th>
                    <th className="px-6 py-4 font-semibold">Leave Date</th>
                    <th className="px-6 py-4 font-semibold">Leave Type</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-16 text-center text-sm text-gray-500"
                      >
                        Loading leave records...
                      </td>
                    </tr>
                  ) : loadError ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-16 text-center">
                        <p className="font-semibold text-red-600">
                          Failed to load leave records
                        </p>
                        <p className="mt-2 text-sm text-gray-500">
                          {loadError}
                        </p>
                      </td>
                    </tr>
                  ) : filteredLeaves.length > 0 ? (
                    filteredLeaves.map((leave) => (
                      <tr
                        key={leave.id}
                        className="border-b border-gray-100 transition last:border-b-0 hover:bg-[#fffaf0]"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#fff9eb] text-[#a86f00]">
                              <UserRound className="h-4 w-4" />
                            </div>
                            <span className="font-semibold text-gray-800">
                              {leave.employee}
                            </span>
                          </div>
                        </td>

                       

                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-2 text-sm text-gray-700">
                            <Building2 className="h-4 w-4 text-gray-400" />
                            {leave.branch}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-sm font-medium text-gray-700">
                          <span className="inline-flex items-center gap-2">
                            <CalendarDays className="h-4 w-4 text-gray-400" />
                            {leave.date}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                              leave.leaveType === "Full"
                                ? "bg-blue-50 text-blue-700"
                                : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            {leave.leaveType}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center">
                          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                            <Search className="h-6 w-6 text-gray-400" />
                          </div>

                          <h3 className="mt-4 text-base font-semibold text-gray-900">
                            No leaves found
                          </h3>

                          <p className="mt-1 text-sm text-gray-500">
                            Try changing your filters or add a leave record.
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
                Total leave:{" "}
                <span className="font-bold text-gray-800">
                  {loading ? "..." : totalLeaveCount}
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

// =========================================
// SUMMARY CARD
// =========================================

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
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-[#17191d]">
            {value}
          </p>
          <p className="mt-1 text-xs text-gray-400">{subtitle}</p>
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
