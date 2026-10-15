"use client";

import { useEffect, useMemo, useState } from "react";

import Link from "next/link";

import { ArrowLeft, Trash2, RotateCcw } from "lucide-react";

import Navbar from "@/app/components/Navbar";

import ExportTable from "@/app/components/ExportTable";

import EditButton from "@/app/components/EditButton";

import Loader from "@/app/components/Loader";

import { supabase } from "@/app/lib/supabase";

import { toast } from "react-toastify";

// =========================

// TYPES

// =========================

type Employee = {

  id: string;

  name: string;

  branchId: string;

};

type Branch = {

  id: string;

  name: string;

};

type Leave = {

  id: string;

  employeeId: string;

  branchId: string;

  employee: string;

  branch: string;

  leaveType: string;

  date: string;

  createdAt: string;

};

// =========================

// PAGE

// =========================

export default function LeavesPage() {

  // =========================

  // STATES

  // =========================

  const [employees, setEmployees] = useState<Employee[]>([]);

  const [branches, setBranches] = useState<Branch[]>([]);

  const [leaves, setLeaves] = useState<Leave[]>([]);

  const [selectedEmployee, setSelectedEmployee] = useState("");

  const [fromDate, setFromDate] = useState("");

  const [toDate, setToDate] = useState("");

  const [loading, setLoading] = useState(true);

  // Delete states

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // =========================

  // TODAY

  // =========================

  const today = new Date().toISOString().split("T")[0];

  // =========================

  // FETCH DATA

  // =========================

  useEffect(() => {

    const fetchLeaveData = async () => {

      try {

        setLoading(true);

        // =========================
        // GET LOGGED-IN USER ROLE
        // =========================
        const { data: roleData, error: roleError } =
          await supabase.rpc("get_my_role");

        if (roleError) {
          console.error("Role fetch error:", roleError);
          toast.error("Unable to verify your access.");
          return;
        }

        const profile = Array.isArray(roleData) ? roleData[0] : roleData;
        const role = profile?.role as "admin" | "branch_manager" | undefined;

        if (!role || !["admin", "branch_manager"].includes(role)) {
          toast.error("You are not authorized to view leave records.");
          return;
        }

        let branchId: string | null = null;

        if (role === "branch_manager") {
          if (!profile?.employee_id) {
            toast.error("Your manager account is not linked to an employee.");
            return;
          }

          const { data: managerEmployee, error: managerEmployeeError } =
            await supabase
              .from("employees")
              .select("branch_id")
              .eq("id", profile.employee_id)
              .single();

          if (managerEmployeeError || !managerEmployee?.branch_id) {
            console.error("Manager branch lookup error:", managerEmployeeError);
            toast.error("Unable to determine your assigned branch.");
            return;
          }

          branchId = managerEmployee.branch_id;
        }

        // =========================

        // FETCH EMPLOYEES

        // =========================

        let employeeQuery = supabase
          .from("employees")
          .select(`
            id,
            name,
            branch_id
          `);

        if (branchId) {
          employeeQuery = employeeQuery.eq("branch_id", branchId);
        }

        const {
          data: employeeData,
          error: employeeError,
        } = await employeeQuery.order("name", {
          ascending: true,
        });

        if (employeeError) {

          console.error("Employee fetch error:", employeeError);

          toast.error("Failed to load employees.");

          return;

        }

        const formattedEmployees: Employee[] =

          (employeeData ?? []).map((employee) => ({

            id: employee.id,

            name: employee.name,

            branchId: employee.branch_id,

          }));

        setEmployees(formattedEmployees);

        // =========================

        // FETCH BRANCHES

        // =========================

        let branchQuery = supabase
          .from("branches")
          .select(`
            id,
            name
          `);

        if (branchId) {
          branchQuery = branchQuery.eq("id", branchId);
        }

        const {
          data: branchData,
          error: branchError,
        } = await branchQuery.order("name", {
          ascending: true,
        });

        if (branchError) {

          console.error("Branch fetch error:", branchError);

          toast.error("Failed to load branches.");

          return;

        }

        const formattedBranches: Branch[] =

          (branchData ?? []).map((branch) => ({

            id: branch.id,

            name: branch.name,

          }));

        setBranches(formattedBranches);

        // =========================

        // CREATE MAPS

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

        // FETCH LEAVES

        // =========================

        let leaveQuery = supabase
          .from("leaves")
          .select(`
            id,
            employee_id,
            branch_id,
            leave_date,
            leave_type,
            created_at
          `);

        if (branchId) {
          leaveQuery = leaveQuery.eq("branch_id", branchId);
        }

        const {
          data: leaveData,
          error: leaveError,
        } = await leaveQuery.order("leave_date", {
          ascending: false,
        });

        if (leaveError) {

          console.error("Leave fetch error:", leaveError);

          toast.error("Failed to load leave records.");

          return;

        }

        // =========================

        // FORMAT LEAVES

        // =========================

        const formattedLeaves: Leave[] =
          (leaveData ?? [])
            // Extra UI-side guard: a branch manager only sees their own branch.
            .filter((leave) => !branchId || leave.branch_id === branchId)
            .map((leave) => {

            const employee = employeeMap.get(

              leave.employee_id

            );

            const branch = branchMap.get(

              leave.branch_id

            );

            return {

              id: leave.id,

              employeeId: leave.employee_id,

              branchId: leave.branch_id,

              employee:

                employee?.name ?? "Unknown Employee",

              branch:

                branch?.name ?? "Unknown Branch",

              leaveType: leave.leave_type,

              date: leave.leave_date,

              createdAt: leave.created_at,

            };

          });

        setLeaves(formattedLeaves);

      } catch (error) {

        console.error(

          "Unexpected leave error:",

          error

        );

        toast.error(

          "Something went wrong while loading leaves."

        );

      } finally {

        setLoading(false);

      }

    };

    fetchLeaveData();

  }, []);

  // =========================

  // DELETE LEAVE

  // =========================

  const handleDeleteLeave = async (id: string) => {

    try {

      setDeletingId(id);

      const { error } = await supabase

        .from("leaves")

        .delete()

        .eq("id", id);

      if (error) {

        throw error;

      }

      // Remove deleted record from UI

      setLeaves((prev) =>

        prev.filter((leave) => leave.id !== id)

      );

      toast.success("Leave deleted successfully.");

      setDeleteConfirmId(null);

    } catch (error: any) {

      console.error(

        "Delete leave error:",

        error

      );

      toast.error(

        error?.message ||

          "Failed to delete leave."

      );

    } finally {

      setDeletingId(null);

    }

  };

  // =========================

  // FILTER LEAVES

  // =========================

  const filteredLeaves = useMemo(() => {

    // No filter selected

    // Show latest 10 records

    if (

      !selectedEmployee &&

      !fromDate &&

      !toDate

    ) {

      return [...leaves]

        .sort((a, b) =>

          b.date.localeCompare(a.date)

        )

        .slice(0, 10);

    }

    // Invalid date range

    if (

      fromDate &&

      toDate &&

      fromDate > toDate

    ) {

      return [];

    }

    return leaves

      .filter((leave) => {

        const employeeMatch = selectedEmployee

          ? leave.employeeId === selectedEmployee

          : true;

        const fromDateMatch = fromDate

          ? leave.date >= fromDate

          : true;

        const toDateMatch = toDate

          ? leave.date <= toDate

          : true;

        return (

          employeeMatch &&

          fromDateMatch &&

          toDateMatch

        );

      })

      .sort((a, b) =>

        b.date.localeCompare(a.date)

      );

  }, [

    leaves,

    selectedEmployee,

    fromDate,

    toDate,

  ]);

  // =========================

  // SELECTED EMPLOYEE

  // =========================

  const selectedEmployeeData =

    employees.find(

      (employee) =>

        employee.id === selectedEmployee

    );

  // =========================

  // SELECTED EMPLOYEE BRANCH

  // =========================

  const selectedEmployeeBranch =

    selectedEmployeeData

      ? branches.find(

          (branch) =>

            branch.id ===

            selectedEmployeeData.branchId

        )

      : undefined;

  // =========================

  // TOTALS

  // =========================

  const totalFullLeave =

    filteredLeaves.filter(

      (leave) =>

        leave.leaveType === "Full"

    ).length;

  const totalHalfLeave =

    filteredLeaves.filter(

      (leave) =>

        leave.leaveType === "Half"

    ).length;

  const totalLeaveDays =

    totalFullLeave +

    totalHalfLeave * 0.5;

  // =========================

  // DATE VALIDATION

  // =========================

  const isInvalidDateRange =

    !!fromDate &&

    !!toDate &&

    fromDate > toDate;

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

  const getBranchColor = (

    branchId: string

  ) => {

    const index = branches.findIndex(

      (branch) =>

        branch.id === branchId

    );

    return branchColorClasses[

      index >= 0

        ? index % branchColorClasses.length

        : 0

    ];

  };

  const handleResetFilters = () => {

  setSelectedEmployee("");

  setFromDate("");

  setToDate("");

};

  // =========================

  // EXPORT DATA

  // =========================

  const leaveExportData =

    filteredLeaves.map((leave) => ({

      employeeName: leave.employee,

      branch: leave.branch,

      leaveType: leave.leaveType,

      date: leave.date,

    }));

  // =========================

  // UI

  // =========================

  return (

    <main className="min-h-screen bg-gray-100">

      {/* ================= NAVBAR ================= */}

      <div className="relative bg-[#17191d]">

        <Navbar />

        <div className="h-24" />

      </div>

      {/* ================= CONTENT ================= */}

      <section className="px-5 py-10 md:px-8">

        <div className="mx-auto max-w-7xl">

          {/* ================= LOADER ================= */}

          {loading ? (

            <Loader

              text="Loading leave records..."

              fullScreen

            />

          ) : (

            <>

              {/* ================= HEADING ================= */}

              <div className="mb-3 flex items-center gap-3">

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

                  Leaves

                </h1>

              </div>

              {/* ================= FILTER CARD ================= */}

              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">

                <div className="mb-6">

                  <h2 className="text-xl font-bold text-gray-900">

                    Employee Wise Report

                  </h2>

                  <p className="mt-1 text-sm text-gray-500">

                    Select an employee and date

                    range to view leave details.

                  </p>

                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">

                  {/* ================= EMPLOYEE ================= */}

                  <div>

                    <label className="mb-2 block text-sm font-semibold text-gray-700">

                      Employee Name

                    </label>

                    <select

                      value={selectedEmployee}

                      onChange={(e) =>

                        setSelectedEmployee(

                          e.target.value

                        )

                      }

                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-700 outline-none transition focus:border-[#f5b942] focus:ring-2 focus:ring-[#f5b942]/20"

                    >

                      <option value="">

                        Select Employee

                      </option>

                      {employees.map(

                        (employee) => (

                          <option

                            key={employee.id}

                            value={employee.id}

                          >

                            {employee.name}

                          </option>

                        )

                      )}

                    </select>

                  </div>

                  {/* ================= FROM DATE ================= */}

                  <div>

                    <label className="mb-2 block text-sm font-semibold text-gray-700">

                      From Date

                    </label>

                    <input

                      type="date"

                      value={fromDate}

                      max={today}

                      onChange={(e) => {

                        setFromDate(

                          e.target.value

                        );

                        if (

                          toDate &&

                          e.target.value > toDate

                        ) {

                          setToDate("");

                        }

                      }}

                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-700 outline-none transition focus:border-[#f5b942] focus:ring-2 focus:ring-[#f5b942]/20"

                    />

                  </div>

                  {/* ================= TO DATE ================= */}

                  <div>

                    <label className="mb-2 block text-sm font-semibold text-gray-700">

                      To Date

                    </label>

                    <input

                      type="date"

                      value={toDate}

                      min={

                        fromDate ||

                        undefined

                      }

                      max={today}

                      onChange={(e) =>

                        setToDate(

                          e.target.value

                        )

                      }

                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-700 outline-none transition focus:border-[#f5b942] focus:ring-2 focus:ring-[#f5b942]/20"

                    />

                  </div>

                </div>

                {/* ================= DATE ERROR ================= */}

                {isInvalidDateRange && (

                  <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">

                    To Date cannot be earlier

                    than From Date.

                  </div>

                )}

              </div>

              {/* ================= EMPLOYEE CARD ================= */}

              {selectedEmployeeData &&

                !isInvalidDateRange && (

                  <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                      <div>

                        <p className="text-sm text-gray-500">

                          Selected Employee

                        </p>

                        <h2 className="mt-1 text-2xl font-bold text-gray-900">

                          {

                            selectedEmployeeData.name

                          }

                        </h2>

                      </div>

                      <div className="flex flex-wrap gap-4">

                        {/* BRANCH */}

                        <div className="rounded-xl bg-gray-50 px-6 py-4">

                          <p className="text-xs uppercase tracking-wide text-gray-500">

                            Branch

                          </p>

                          <span

                            className={`mt-1 inline-flex rounded-full px-3 py-1 text-sm font-semibold ${getBranchColor(

                              selectedEmployeeData.branchId

                            )}`}

                          >

                            {selectedEmployeeBranch?.name ??

                              "Unknown Branch"}

                          </span>

                        </div>

                        {/* LEAVE ENTRIES */}

                        <div className="rounded-xl bg-gray-50 px-6 py-4 text-center">

                          <p className="text-xs uppercase tracking-wide text-gray-500">

                            Leave Entries

                          </p>

                          <p className="mt-1 text-xl font-bold text-gray-900">

                            {

                              filteredLeaves.length

                            }

                          </p>

                        </div>

                      </div>

                    </div>

                  </div>

                )}

              {/* ================= TABLE ================= */}

              {!isInvalidDateRange && (

                <>

                  <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

                    {/* ================= TABLE HEADER ================= */}

                    <div className="flex flex-col gap-4 border-b border-gray-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">

                      <div>

                        <h2 className="text-xl font-bold text-gray-900">

                          {selectedEmployee ||

                          fromDate ||

                          toDate

                            ? "Leave Details"

                            : "Recent Leave Records"}

                        </h2>

                        <p className="mt-1 text-sm text-gray-500">

                          {

                            filteredLeaves.length

                          }{" "}

                          leave

                          {filteredLeaves.length !==

                          1

                            ? "s"

                            : ""}{" "}

                          found

                        </p>

                      </div>

                      {/* ================= EXPORT ================= */}

{/* EXPORT AND RESET BUTTONS */}

<div className="flex flex-wrap items-center gap-3">

  <ExportTable

    data={leaveExportData}

    columns={[

      { header: "Employee Name", key: "employeeName" },

      { header: "Branch", key: "branch" },

      { header: "Leave Type", key: "leaveType" },

      { header: "Date", key: "date" },

    ]}

    fileName="Employee-Leave-Report"

    disabled={

      filteredLeaves.length === 0 ||

      !!isInvalidDateRange

    }

  />

  <button

    type="button"

    onClick={handleResetFilters}

    className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-[#f5b942] hover:bg-[#fff9eb] hover:text-[#a86f00]"

  >

    <RotateCcw className="h-4 w-4" />

    Reset

  </button>

</div>

                    </div>

                    {/* ================= TABLE ================= */}

                    <div className="overflow-x-auto">

                      <table className="w-full min-w-[900px]">

                        <thead>

                          <tr className="border-b border-gray-200 bg-gray-50">

                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">

                              Employee Name

                            </th>

                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">

                              Branch

                            </th>

                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">

                              Leave Type

                            </th>

                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">

                              Date

                            </th>

                            <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">

                              Action

                            </th>

                          </tr>

                        </thead>

                        <tbody>

                          {filteredLeaves.length >

                          0 ? (

                            filteredLeaves.map(

                              (leave) => (

                                <tr

                                  key={leave.id}

                                  className="border-b border-gray-100 last:border-0"

                                >

                                  {/* EMPLOYEE */}

                                  <td className="px-6 py-4 text-sm font-medium text-gray-900">

                                    {

                                      leave.employee

                                    }

                                  </td>

                                  {/* BRANCH */}

                                  <td className="px-6 py-4">

                                    <span

                                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getBranchColor(

                                        leave.branchId

                                      )}`}

                                    >

                                      {

                                        leave.branch

                                      }

                                    </span>

                                  </td>

                                  {/* LEAVE TYPE */}

                                  <td className="px-6 py-4">

                                    <span

                                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${

                                        leave.leaveType ===

                                        "Full"

                                          ? "bg-red-100 text-red-700"

                                          : "bg-yellow-100 text-yellow-700"

                                      }`}

                                    >

                                      {

                                        leave.leaveType

                                      }

                                    </span>

                                  </td>

                                  {/* DATE */}

                                  <td className="px-6 py-4 text-sm text-gray-700">

                                    {new Date(

                                      `${leave.date}T00:00:00`

                                    ).toLocaleDateString(

                                      "en-IN"

                                    )}

                                  </td>

                                  {/* ACTION */}

                                  <td className="px-6 py-4">

                                    <div className="flex items-center justify-center gap-2">

                                      {/* EDIT */}

                                      <EditButton

                                        href={`/leave/edit/${leave.id}`}

                                      />

                                      {/* DELETE */}

                                      <button

                                        type="button"

                                        onClick={() =>

                                          setDeleteConfirmId(

                                            leave.id

                                          )

                                        }

                                        disabled={

                                          deletingId ===

                                          leave.id

                                        }

                                        className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"

                                      >

                                        <Trash2 className="h-4 w-4" />

                                        {deletingId ===

                                        leave.id

                                          ? "Deleting..."

                                          : "Delete"}

                                      </button>

                                    </div>

                                  </td>

                                </tr>

                              )

                            )

                          ) : (

                            <tr>

                              <td

                                colSpan={5}

                                className="px-6 py-10 text-center text-sm text-gray-500"

                              >

                                No leave records

                                found.

                              </td>

                            </tr>

                          )}

                        </tbody>

                      </table>

                    </div>

                  </div>

                  {/* ================= TOTALS ================= */}

                  <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">

                    {/* FULL LEAVE */}

                    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

                      <p className="text-sm font-medium text-gray-500">

                        Full Leave

                      </p>

                      <p className="mt-2 text-2xl font-bold text-gray-900">

                        {totalFullLeave}

                      </p>

                    </div>

                    {/* HALF LEAVE */}

                    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

                      <p className="text-sm font-medium text-gray-500">

                        Half Leave

                      </p>

                      <p className="mt-2 text-2xl font-bold text-gray-900">

                        {totalHalfLeave}

                      </p>

                    </div>

                    {/* TOTAL LEAVE */}

                    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

                      <p className="text-sm font-medium text-gray-500">

                        Total Leave

                      </p>

                      <p className="mt-2 text-2xl font-bold text-gray-900">

                        {totalLeaveDays}

                      </p>

                    </div>

                  </div>

                </>

              )}

            </>

          )}

        </div>

      </section>

      {/* ================= DELETE CONFIRMATION MODAL ================= */}

      {deleteConfirmId && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">

          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">

            <div className="flex items-start gap-4">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-100">

                <Trash2 className="h-5 w-5 text-red-600" />

              </div>

              <div>

                <h3 className="text-lg font-bold text-gray-900">

                  Delete Leave?

                </h3>

                <p className="mt-1 text-sm text-gray-500">

                  Are you sure you want to delete

                  this leave record? This action

                  cannot be undone.

                </p>

              </div>

            </div>

            <div className="mt-6 flex justify-end gap-3">

              {/* CANCEL */}

              <button

                type="button"

                onClick={() =>

                  setDeleteConfirmId(null)

                }

                disabled={deletingId !== null}

                className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"

              >

                Cancel

              </button>

              {/* CONFIRM DELETE */}

              <button

                type="button"

                onClick={() =>

                  handleDeleteLeave(

                    deleteConfirmId

                  )

                }

                disabled={deletingId !== null}

                className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"

              >

                {deletingId

                  ? "Deleting..."

                  : "Yes, Delete"}

              </button>

            </div>

          </div>

        </div>

      )}

    </main>

  );

}