"use client";

import { useMemo, useState } from "react";
import Navbar from "@/app/components/Navbar";
import ExportTable from "@/app/components/ExportTable";
import FormSelect from "@/app/components/forms/FormSelect";
import {
  Plus,
  Search,
  SlidersHorizontal,
  RotateCcw,
  UserRound,
  Building2,
  CalendarDays,
  IndianRupee,
  Pencil,
  Trash2,
  X,
} from "lucide-react";

type PeriodFilter = "all" | "day" | "week" | "month" | "year";

type IncentiveEmployee = {
  id: number;
  employee: string;
  employeeNumber: string;
  branch: string;
  month: string;
  business: number;
  salary: number;
  incentivePercentage: number;
  incentiveAmount: number;
  description: string;
};

const branches = ["Indore", "Ujjain", "Bhopal"];

const employees = [
  {
    name: "Rahul Sharma",
    employeeNumber: "EMP001",
    branch: "Indore",
    salary: 20000,
  },
  {
    name: "Amit Verma",
    employeeNumber: "EMP002",
    branch: "Indore",
    salary: 22000,
  },
  {
    name: "Neha Singh",
    employeeNumber: "EMP003",
    branch: "Ujjain",
    salary: 25000,
  },
  {
    name: "Pooja Sharma",
    employeeNumber: "EMP004",
    branch: "Ujjain",
    salary: 21000,
  },
  {
    name: "Riya Patel",
    employeeNumber: "EMP005",
    branch: "Bhopal",
    salary: 23000,
  },
  {
    name: "Vikas Jain",
    employeeNumber: "EMP006",
    branch: "Bhopal",
    salary: 24000,
  },
];

const initialIncentives: IncentiveEmployee[] = [
  {
    id: 1,
    employee: "Rahul Sharma",
    employeeNumber: "EMP001",
    branch: "Indore",
    month: "2026-10",
    business: 60000,
    salary: 20000,
    incentivePercentage: 5,
    incentiveAmount: 1000,
    description: "Monthly business incentive",
  },
  {
    id: 2,
    employee: "Amit Verma",
    employeeNumber: "EMP002",
    branch: "Indore",
    month: "2026-10",
    business: 85000,
    salary: 22000,
    incentivePercentage: 7,
    incentiveAmount: 1540,
    description: "Monthly business incentive",
  },
  {
    id: 3,
    employee: "Neha Singh",
    employeeNumber: "EMP003",
    branch: "Ujjain",
    month: "2026-10",
    business: 110000,
    salary: 25000,
    incentivePercentage: 10,
    incentiveAmount: 2500,
    description: "Monthly business incentive",
  },
  {
    id: 4,
    employee: "Pooja Sharma",
    employeeNumber: "EMP004",
    branch: "Ujjain",
    month: "2026-09",
    business: 70000,
    salary: 21000,
    incentivePercentage: 7,
    incentiveAmount: 1470,
    description: "Monthly business incentive",
  },
  {
    id: 5,
    employee: "Riya Patel",
    employeeNumber: "EMP005",
    branch: "Bhopal",
    month: "2026-09",
    business: 120000,
    salary: 23000,
    incentivePercentage: 10,
    incentiveAmount: 2300,
    description: "Monthly business incentive",
  },
];

export default function IncentiveEmployeesPage() {
  const [incentives, setIncentives] =
    useState<IncentiveEmployee[]>(initialIncentives);

  const [search, setSearch] = useState("");
  const [period, setPeriod] = useState<PeriodFilter>("all");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingIncentive, setEditingIncentive] =
    useState<IncentiveEmployee | null>(null);

  const [formData, setFormData] = useState({
    employee: "",
    month: "2026-10",
    business: "",
    salary: "",
    incentivePercentage: "",
    description: "",
  });

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString("en-IN")}`;
  };

  const getStartDate = (filter: PeriodFilter) => {
    const date = new Date();

    if (filter === "day") {
      date.setDate(date.getDate() - 1);
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

  const filteredIncentives = useMemo(() => {
    const startDate = getStartDate(period);
    const searchValue = search.trim().toLowerCase();

    return incentives
      .filter((item) => {
        const matchesSearch =
          !searchValue ||
          item.employee.toLowerCase().includes(searchValue) ||
          item.employeeNumber.toLowerCase().includes(searchValue);

        const matchesBranch =
          !selectedBranch ||
          item.branch === selectedBranch;

        const matchesEmployee =
          !selectedEmployee ||
          item.employeeNumber === selectedEmployee;

        let matchesPeriod = true;

        if (startDate) {
          const incentiveDate = new Date(
            `${item.month}-01T00:00:00`
          );

          matchesPeriod = incentiveDate >= startDate;
        }

        return (
          matchesSearch &&
          matchesBranch &&
          matchesEmployee &&
          matchesPeriod
        );
      })
      .sort((a, b) => b.month.localeCompare(a.month));
  }, [
    incentives,
    search,
    period,
    selectedBranch,
    selectedEmployee,
  ]);

  const totalBusiness = filteredIncentives.reduce(
    (sum, item) => sum + item.business,
    0
  );

  const totalIncentive = filteredIncentives.reduce(
    (sum, item) => sum + item.incentiveAmount,
    0
  );

  const resetFilters = () => {
    setSearch("");
    setPeriod("all");
    setSelectedBranch("");
    setSelectedEmployee("");
  };

  const openAddForm = () => {
    setEditingIncentive(null);

    setFormData({
      employee: "",
      month: "2026-10",
      business: "",
      salary: "",
      incentivePercentage: "",
      description: "",
    });

    setShowForm(true);
  };

  const openEditForm = (item: IncentiveEmployee) => {
    setEditingIncentive(item);

    setFormData({
      employee: item.employeeNumber,
      month: item.month,
      business: String(item.business),
      salary: String(item.salary),
      incentivePercentage: String(
        item.incentivePercentage
      ),
      description: item.description,
    });

    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingIncentive(null);
  };

  const handleEmployeeChange = (employeeNumber: string) => {
    const selected = employees.find(
      (employee) =>
        employee.employeeNumber === employeeNumber
    );

    setFormData((current) => ({
      ...current,
      employee: employeeNumber,
      salary: selected
        ? String(selected.salary)
        : "",
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const selected = employees.find(
      (employee) =>
        employee.employeeNumber === formData.employee
    );

    if (!selected) {
      alert("Please select an employee.");
      return;
    }

    const business = Number(formData.business);
    const salary = Number(formData.salary);
    const incentivePercentage = Number(
      formData.incentivePercentage
    );

    if (business <= 0) {
      alert("Please enter valid business amount.");
      return;
    }

    if (salary <= 0) {
      alert("Please enter valid salary.");
      return;
    }

    if (
      incentivePercentage <= 0 ||
      incentivePercentage > 100
    ) {
      alert(
        "Incentive percentage must be between 1 and 100."
      );
      return;
    }

    const incentiveAmount =
      (salary * incentivePercentage) / 100;

    if (editingIncentive) {
      setIncentives((current) =>
        current.map((item) =>
          item.id === editingIncentive.id
            ? {
                ...item,
                employee: selected.name,
                employeeNumber: selected.employeeNumber,
                branch: selected.branch,
                month: formData.month,
                business,
                salary,
                incentivePercentage,
                incentiveAmount,
                description: formData.description,
              }
            : item
        )
      );
    } else {
      const newIncentive: IncentiveEmployee = {
        id: Date.now(),
        employee: selected.name,
        employeeNumber: selected.employeeNumber,
        branch: selected.branch,
        month: formData.month,
        business,
        salary,
        incentivePercentage,
        incentiveAmount,
        description: formData.description,
      };

      setIncentives((current) => [
        newIncentive,
        ...current,
      ]);
    }

    closeForm();
  };

  const handleDelete = (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this incentive record?"
    );

    if (!confirmed) return;

    setIncentives((current) =>
      current.filter((item) => item.id !== id)
    );
  };

  const incentiveExportData = filteredIncentives.map(
    (item) => ({
      employee: item.employee,
      employeeNumber: item.employeeNumber,
      branch: item.branch,
      month: item.month,
      business: item.business,
      salary: item.salary,
      incentivePercentage: `${item.incentivePercentage}%`,
      incentiveAmount: item.incentiveAmount,
    })
  );

  return (
    <main className="min-h-screen bg-[#f5f6f8]">
      {/* NAVBAR */}
      <div className="relative bg-[#17191d]">
        <Navbar />
        <div className="h-24" />
      </div>

      <section className="px-5 py-10 md:px-8">
        <div className="mx-auto max-w-7xl">

          {/* HEADER */}
          <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="h-8 w-1 rounded-full bg-[#f5b942]" />

                <h1 className="text-3xl font-bold tracking-tight text-[#17191d] md:text-4xl">
                  Incentive Employees
                </h1>
              </div>

              <p className="ml-4 mt-3 text-base text-gray-500">
                View and manage employee monthly incentive
                records.
              </p>
            </div>

            <button
              type="button"
              onClick={openAddForm}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#17191d] px-5 text-sm font-semibold text-white transition hover:bg-black"
            >
              <Plus className="h-4 w-4" />
              Add Incentive
            </button>
          </div>

          {/* SEARCH + FILTER */}
          <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">

              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                <input
                  type="text"
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder="Search employee name or employee number..."
                  className="h-11 w-full rounded-lg border border-gray-200 bg-gray-50 pl-11 pr-4 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-[#d59618] focus:bg-white focus:ring-2 focus:ring-[#f5b942]/20"
                />
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowFilters(!showFilters)
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

              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </button>
            </div>

            {showFilters && (
              <div className="mt-5 grid grid-cols-1 gap-4 border-t border-gray-100 pt-5 md:grid-cols-3">

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
                      label: branch,
                      value: branch,
                    })),
                  ]}
                />

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
                      value: employee.employeeNumber,
                    })),
                  ]}
                />
              </div>
            )}
          </div>

          {/* SUMMARY */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">

            <SummaryCard
              title="Incentive Employees"
              value={filteredIncentives.length.toString()}
              subtitle="Filtered records"
              icon={
                <UserRound className="h-5 w-5" />
              }
              iconClass="bg-blue-50 text-blue-600"
            />

            <SummaryCard
              title="Total Business"
              value={formatCurrency(totalBusiness)}
              subtitle="Business generated"
              icon={
                <IndianRupee className="h-5 w-5" />
              }
              iconClass="bg-amber-50 text-[#d59618]"
            />

            <SummaryCard
              title="Total Incentive"
              value={formatCurrency(totalIncentive)}
              subtitle="Total incentive payable"
              icon={
                <IndianRupee className="h-5 w-5" />
              }
              iconClass="bg-green-50 text-green-600"
            />
          </div>

          {/* TABLE */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

            <div className="flex flex-col gap-4 border-b border-gray-200 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#17191d]">
                  Employee Incentive Records
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Employee business and incentive payment
                  history.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
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
                  ]}
                  fileName="Employee-Incentive-Report"
                  disabled={!filteredIncentives.length}
                />

                <button
                  type="button"
                  onClick={openAddForm}
                  className="inline-flex h-11 items-center gap-2 rounded-lg bg-[#17191d] px-5 text-sm font-semibold text-white transition hover:bg-black"
                >
                  <Plus className="h-4 w-4" />
                  Add Incentive
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1250px]">

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

                    <th className="px-6 py-4 text-center font-semibold">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredIncentives.length > 0 ? (
                    filteredIncentives.map((item) => (
                      <tr
                        key={item.id}
                        className="border-b border-gray-100 transition last:border-b-0 hover:bg-[#fffaf0]"
                      >
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

                        <td className="px-6 py-4 text-sm text-gray-600">
                          {item.employeeNumber}
                        </td>

                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-2 text-sm text-gray-700">
                            <Building2 className="h-4 w-4 text-gray-400" />
                            {item.branch}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-2 text-sm font-medium text-gray-700">
                            <CalendarDays className="h-4 w-4 text-gray-400" />
                            {item.month}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-sm font-semibold text-gray-700">
                          {formatCurrency(item.business)}
                        </td>

                        <td className="px-6 py-4 text-sm text-gray-600">
                          {formatCurrency(item.salary)}
                        </td>

                        <td className="px-6 py-4">
                          <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                            {item.incentivePercentage}%
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <span className="font-bold text-green-700">
                            {formatCurrency(
                              item.incentiveAmount
                            )}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                openEditForm(item)
                              }
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:border-[#d59618] hover:bg-[#fff9eb] hover:text-[#a86f00]"
                              title="Edit"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(item.id)
                              }
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-red-500 transition hover:border-red-200 hover:bg-red-50"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
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
                            Try changing your search or
                            filters.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="border-t border-gray-200 bg-[#fafafa] px-6 py-4">
              <div className="flex flex-col gap-2 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">
                <p>
                  Total Business:{" "}
                  <span className="font-bold text-gray-800">
                    {formatCurrency(totalBusiness)}
                  </span>
                </p>

                <p>
                  Total Incentive:{" "}
                  <span className="font-bold text-green-700">
                    {formatCurrency(totalIncentive)}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ADD / EDIT INCENTIVE MODAL */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4 py-6">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

            {/* Modal Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-[#17191d]">
                  {editingIncentive
                    ? "Edit Incentive"
                    : "Add Incentive"}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Add monthly employee incentive details.
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="p-6"
            >
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                {/* Employee */}
                <FormSelect
                  label="Employee"
                  value={formData.employee}
                  onChange={(e) =>
                    handleEmployeeChange(
                      e.target.value
                    )
                  }
                  options={[
                    {
                      label: "Select Employee",
                      value: "",
                    },
                    ...employees.map((employee) => ({
                      label: `${employee.name} (${employee.employeeNumber})`,
                      value: employee.employeeNumber,
                    })),
                  ]}
                />

                {/* Month */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Month
                  </label>

                  <input
                    type="month"
                    value={formData.month}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        month: e.target.value,
                      })
                    }
                    className="h-11 w-full rounded-lg border border-gray-200 bg-white px-4 text-sm text-gray-700 outline-none focus:border-[#d59618] focus:ring-2 focus:ring-[#f5b942]/20"
                    required
                  />
                </div>

                {/* Business */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Monthly Business
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={formData.business}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        business: e.target.value,
                      })
                    }
                    placeholder="60000"
                    className="h-11 w-full rounded-lg border border-gray-200 bg-white px-4 text-sm text-gray-700 outline-none focus:border-[#d59618] focus:ring-2 focus:ring-[#f5b942]/20"
                    required
                  />
                </div>

                {/* Salary */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Salary
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={formData.salary}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        salary: e.target.value,
                      })
                    }
                    placeholder="20000"
                    className="h-11 w-full rounded-lg border border-gray-200 bg-white px-4 text-sm text-gray-700 outline-none focus:border-[#d59618] focus:ring-2 focus:ring-[#f5b942]/20"
                    required
                  />
                </div>

                {/* Incentive Percentage */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Incentive Percentage
                  </label>

                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      max="100"
                      step="0.01"
                      value={
                        formData.incentivePercentage
                      }
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          incentivePercentage:
                            e.target.value,
                        })
                      }
                      placeholder="5"
                      className="h-11 w-full rounded-lg border border-gray-200 bg-white px-4 pr-10 text-sm text-gray-700 outline-none focus:border-[#d59618] focus:ring-2 focus:ring-[#f5b942]/20"
                      required
                    />

                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400">
                      %
                    </span>
                  </div>
                </div>

                {/* Branch */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Branch
                  </label>

                  <input
                    type="text"
                    value={
                      employees.find(
                        (employee) =>
                          employee.employeeNumber ===
                          formData.employee
                      )?.branch || ""
                    }
                    readOnly
                    placeholder="Auto selected"
                    className="h-11 w-full rounded-lg border border-gray-200 bg-gray-50 px-4 text-sm text-gray-600 outline-none"
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Description
                  </label>

                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        description: e.target.value,
                      })
                    }
                    placeholder="Enter incentive description..."
                    rows={3}
                    className="w-full resize-none rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none focus:border-[#d59618] focus:ring-2 focus:ring-[#f5b942]/20"
                  />
                </div>
              </div>

              {/* Calculation */}
              {formData.salary &&
                formData.incentivePercentage && (
                  <div className="mt-5 rounded-xl border border-[#f5b942]/30 bg-[#fffaf0] p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-[#a86f00]">
                          Incentive Calculation
                        </p>

                        <p className="mt-1 text-sm text-gray-600">
                          Salary × Incentive Percentage
                        </p>
                      </div>

                      <p className="text-xl font-bold text-green-700">
                        {formatCurrency(
                          (Number(formData.salary) *
                            Number(
                              formData.incentivePercentage
                            )) /
                            100
                        )}
                      </p>
                    </div>
                  </div>
                )}

              {/* Actions */}
              <div className="mt-6 flex justify-end gap-3 border-t border-gray-100 pt-5">
                <button
                  type="button"
                  onClick={closeForm}
                  className="h-11 rounded-lg border border-gray-200 px-5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="h-11 rounded-lg bg-[#17191d] px-6 text-sm font-semibold text-white transition hover:bg-black"
                >
                  {editingIncentive
                    ? "Update Incentive"
                    : "Save Incentive"}
                </button>
              </div>
            </form>
          </div>
        </div>
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