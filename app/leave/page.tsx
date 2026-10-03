"use client";

import { useMemo, useState } from "react";
import Navbar from "@/app/components/Navbar";
import ExportTable from "@/app/components/ExportTable";
import { employees, leaves } from "@/app/data/leaveData";

export default function LeaveReportPage() {
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const today = new Date().toISOString().split("T")[0];

  const filteredLeaves = useMemo(() => {
    if (!selectedEmployee || !fromDate || !toDate) {
      return [];
    }

    if (fromDate > toDate) {
      return [];
    }

    return leaves.filter((leave) => {
      const employeeMatch = leave.employeeNumber === selectedEmployee;

      const dateMatch =
        leave.date >= fromDate &&
        leave.date <= toDate;

      return employeeMatch && dateMatch;
    });
  }, [selectedEmployee, fromDate, toDate]);

  const leaveExportData = filteredLeaves.map((leave) => ({
  date: leave.date,
  leaveType: leave.leaveType,
}));

  const selectedEmployeeData = employees.find(
    (employee) => employee.employeeNumber === selectedEmployee
  );

  const totalFullLeave = filteredLeaves.filter(
    (leave) => leave.leaveType === "Full"
  ).length;

  const totalHalfLeave = filteredLeaves.filter(
    (leave) => leave.leaveType === "Half"
  ).length;

  // Half leave = 0.5 day
  const totalLeaveDays = totalFullLeave + totalHalfLeave * 0.5;

  const isInvalidDateRange =
    fromDate && toDate && fromDate > toDate;

  return (
    <main className="min-h-screen bg-gray-100">
      {/* NAVBAR */}
      <div className="relative bg-[#17191d]">
        <Navbar />
        <div className="h-24" />
      </div>

      <section className="px-5 py-10 md:px-8">
        <div className="mx-auto max-w-7xl">
          {/* HEADING */}
          <div className="mb-8">
            <div className="flex items-center gap-3">
              <div className="h-8 w-1 rounded-full bg-[#f5b942]" />

              <h1 className="text-3xl font-bold tracking-tight text-[#17191d] md:text-4xl">
                Leave Report
              </h1>
            </div>

            <p className="mt-3 ml-4 text-base text-gray-500">
              View employee-wise leave records.
            </p>
          </div>

          {/* FILTER CARD */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Employee Wise Report
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Select an employee and date range to view leave details.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {/* EMPLOYEE */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Employee Name
                </label>

                <select
                  value={selectedEmployee}
                  onChange={(e) =>
                    setSelectedEmployee(e.target.value)
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-700 outline-none transition focus:border-[#f5b942] focus:ring-2 focus:ring-[#f5b942]/20"
                >
                  <option value="">Select Employee</option>

                  {employees.map((employee) => (
                    <option
                      key={employee.employeeNumber}
                      value={employee.employeeNumber}
                    >
                      {employee.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* FROM DATE */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  From Date
                </label>

                <input
                  type="date"
                  value={fromDate}
                  max={today}
                  onChange={(e) => {
                    setFromDate(e.target.value);

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

              {/* TO DATE */}
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
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-700 outline-none transition focus:border-[#f5b942] focus:ring-2 focus:ring-[#f5b942]/20"
                />
              </div>
            </div>

            {/* VALIDATION */}
            {isInvalidDateRange && (
              <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                To Date cannot be earlier than From Date.
              </div>
            )}

            {/* REQUIRED MESSAGE */}
            {!selectedEmployee || !fromDate || !toDate ? (
              <div className="mt-5 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm font-medium text-yellow-700">
                Please select an employee, From Date and To Date to view
                the report.
              </div>
            ) : null}
          </div>

          {/* EMPLOYEE CARD */}
          {selectedEmployeeData &&
            fromDate &&
            toDate &&
            !isInvalidDateRange && (
              <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm text-gray-500">
                      Selected Employee
                    </p>

                    <h2 className="mt-1 text-2xl font-bold text-gray-900">
                      {selectedEmployeeData.name}
                    </h2>
                  </div>

                  <div className="flex flex-wrap gap-4">
                    <div className="rounded-xl bg-gray-50 px-6 py-4">
                      <p className="text-xs uppercase tracking-wide text-gray-500">
                        Employee No
                      </p>

                      <p className="mt-1 text-lg font-bold text-gray-900">
                        {selectedEmployeeData.employeeNumber}
                      </p>
                    </div>

                    <div className="rounded-xl bg-gray-50 px-6 py-4">
                      <p className="text-xs uppercase tracking-wide text-gray-500">
                        Branch
                      </p>

                      <p className="mt-1 text-lg font-bold text-gray-900">
                        {selectedEmployeeData.branch}
                      </p>
                    </div>

                    <div className="rounded-xl bg-gray-50 px-6 py-4 text-center">
                      <p className="text-xs uppercase tracking-wide text-gray-500">
                        Leave Entries
                      </p>

                      <p className="mt-1 text-xl font-bold text-gray-900">
                        {filteredLeaves.length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

          {/* REPORT TABLE */}
          {selectedEmployee &&
            fromDate &&
            toDate &&
            !isInvalidDateRange && (
              <>
                <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                 <div className="flex flex-col gap-4 border-b border-gray-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
  <div>
    <h2 className="text-xl font-bold text-gray-900">
      Leave Details
    </h2>

    <p className="mt-1 text-sm text-gray-500">
      {filteredLeaves.length} leave
      {filteredLeaves.length !== 1 ? "s" : ""} found
    </p>
  </div>

  <ExportTable
    data={leaveExportData}
    columns={[
      {
        header: "Date",
        key: "date",
      },
      {
        header: "Leave Type",
        key: "leaveType",
      },
    ]}
    fileName="Employee-Leave-Report"
    disabled={
      !selectedEmployee ||
      !fromDate ||
      !toDate ||
      !!isInvalidDateRange
    }
  />
</div>

                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[600px]">
                      <thead>
                        <tr className="border-b border-gray-200 bg-gray-50">
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                            Date
                          </th>

                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                            Leave Type
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {filteredLeaves.length > 0 ? (
                          filteredLeaves.map((leave) => (
                            <tr
                              key={leave.id}
                              className="border-b border-gray-100 last:border-0"
                            >
                              <td className="px-6 py-4 text-sm text-gray-700">
                                {new Date(
                                  `${leave.date}T00:00:00`
                                ).toLocaleDateString("en-IN")}
                              </td>

                              <td className="px-6 py-4">
                                <span
                                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                    leave.leaveType === "Full"
                                      ? "bg-red-100 text-red-700"
                                      : "bg-yellow-100 text-yellow-700"
                                  }`}
                                >
                                  {leave.leaveType}
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan={2}
                              className="px-6 py-10 text-center text-sm text-gray-500"
                            >
                              No leave records found for the selected
                              employee and date range.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* TOTALS */}
                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <p className="text-sm font-medium text-gray-500">
                      Full Leave
                    </p>

                    <p className="mt-2 text-2xl font-bold text-gray-900">
                      {totalFullLeave}
                    </p>
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <p className="text-sm font-medium text-gray-500">
                      Half Leave
                    </p>

                    <p className="mt-2 text-2xl font-bold text-gray-900">
                      {totalHalfLeave}
                    </p>
                  </div>

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
        </div>
      </section>
    </main>
  );
}