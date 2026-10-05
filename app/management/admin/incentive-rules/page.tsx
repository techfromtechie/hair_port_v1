"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  SlidersHorizontal,
} from "lucide-react";

type IncentiveRule = {
  id: number;
  name: string;
  minBusiness: number;
  maxBusiness: number;
  incentivePercentage: number;
  status: "Active" | "Inactive";
};

const initialRules: IncentiveRule[] = [
  {
    id: 1,
    name: "Rule 1",
    minBusiness: 49999,
    maxBusiness: 69999,
    incentivePercentage: 5,
    status: "Active",
  },
  {
    id: 2,
    name: "Rule 2",
    minBusiness: 70000,
    maxBusiness: 99999,
    incentivePercentage: 7,
    status: "Active",
  },
  {
    id: 3,
    name: "Rule 3",
    minBusiness: 100000,
    maxBusiness: 120000,
    incentivePercentage: 10,
    status: "Active",
  },
];

export default function IncentiveRulePage() {
  const [rules, setRules] = useState<IncentiveRule[]>(initialRules);

  const [showForm, setShowForm] = useState(false);

  const [editingRule, setEditingRule] =
    useState<IncentiveRule | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    minBusiness: "",
    maxBusiness: "",
    incentivePercentage: "",
    status: "Active" as "Active" | "Inactive",
  });

  const openAddForm = () => {
    setEditingRule(null);

    setFormData({
      name: "",
      minBusiness: "",
      maxBusiness: "",
      incentivePercentage: "",
      status: "Active",
    });

    setShowForm(true);
  };

  const openEditForm = (rule: IncentiveRule) => {
    setEditingRule(rule);

    setFormData({
      name: rule.name,
      minBusiness: String(rule.minBusiness),
      maxBusiness: String(rule.maxBusiness),
      incentivePercentage: String(rule.incentivePercentage),
      status: rule.status,
    });

    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingRule(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const minBusiness = Number(formData.minBusiness);
    const maxBusiness = Number(formData.maxBusiness);
    const incentivePercentage = Number(
      formData.incentivePercentage
    );

    if (!formData.name.trim()) {
      alert("Please enter rule name.");
      return;
    }

    if (
      !minBusiness ||
      !maxBusiness ||
      minBusiness > maxBusiness
    ) {
      alert("Please enter a valid business range.");
      return;
    }

    if (
      incentivePercentage <= 0 ||
      incentivePercentage > 100
    ) {
      alert("Incentive percentage must be between 1 and 100.");
      return;
    }

    if (editingRule) {
      setRules((currentRules) =>
        currentRules.map((rule) =>
          rule.id === editingRule.id
            ? {
                ...rule,
                name: formData.name,
                minBusiness,
                maxBusiness,
                incentivePercentage,
                status: formData.status,
              }
            : rule
        )
      );
    } else {
      const newRule: IncentiveRule = {
        id: Date.now(),
        name: formData.name,
        minBusiness,
        maxBusiness,
        incentivePercentage,
        status: formData.status,
      };

      setRules((currentRules) => [
        ...currentRules,
        newRule,
      ]);
    }

    closeForm();
  };

  const handleDelete = (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this incentive rule?"
    );

    if (!confirmed) return;

    setRules((currentRules) =>
      currentRules.filter((rule) => rule.id !== id)
    );
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString("en-IN")}`;
  };

  return (
    <main className="min-h-screen bg-[#f5f6f8]">
      {/* Navbar */}
      <div className="relative bg-[#17191d]">
        <Navbar />
        <div className="h-24" />
      </div>

      {/* Page Content */}
      <section className="px-5 py-10 md:px-8">
        <div className="mx-auto max-w-7xl">

          {/* Header */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="h-8 w-1 rounded-full bg-[#f5b942]" />

                <h1 className="text-3xl font-bold tracking-tight text-[#17191d]">
                  Incentive Rules
                </h1>
              </div>

              <p className="ml-4 mt-3 text-base text-gray-500">
                Define monthly business targets and employee
                incentive percentages.
              </p>
            </div>

            <button
              type="button"
              onClick={openAddForm}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#17191d] px-5 text-sm font-semibold text-white transition hover:bg-black"
            >
              <Plus className="h-4 w-4" />
              Add Rule
            </button>
          </div>

          {/* Rules Table */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
              <div>
                <h2 className="text-lg font-bold text-[#17191d]">
                  Defined Incentive Rules
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Monthly business based incentive rules.
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#fff9eb] text-[#a86f00]">
                <SlidersHorizontal className="h-5 w-5" />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="bg-[#17191d] text-left text-sm text-white">
                    <th className="px-6 py-4 font-semibold">
                      Rule
                    </th>

                    <th className="px-6 py-4 font-semibold">
                      Business From
                    </th>

                    <th className="px-6 py-4 font-semibold">
                      Business To
                    </th>

                    <th className="px-6 py-4 font-semibold">
                      Incentive
                    </th>

                    <th className="px-6 py-4 font-semibold">
                      Status
                    </th>

                    <th className="px-6 py-4 text-center font-semibold">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {rules.length > 0 ? (
                    rules.map((rule) => (
                      <tr
                        key={rule.id}
                        className="border-b border-gray-100 transition last:border-b-0 hover:bg-[#fffaf0]"
                      >
                        <td className="px-6 py-5">
                          <p className="font-semibold text-gray-800">
                            {rule.name}
                          </p>

                          <p className="mt-1 text-xs text-gray-400">
                            Monthly business rule
                          </p>
                        </td>

                        <td className="px-6 py-5 text-sm font-medium text-gray-700">
                          {formatCurrency(rule.minBusiness)}
                        </td>

                        <td className="px-6 py-5 text-sm font-medium text-gray-700">
                          {formatCurrency(rule.maxBusiness)}
                        </td>

                        <td className="px-6 py-5">
                          <span className="inline-flex rounded-full bg-green-50 px-3 py-1 text-sm font-bold text-green-700">
                            {rule.incentivePercentage}%
                          </span>

                          <p className="mt-1 text-xs text-gray-400">
                            of salary
                          </p>
                        </td>

                        <td className="px-6 py-5">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                              rule.status === "Active"
                                ? "bg-green-50 text-green-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {rule.status}
                          </span>
                        </td>

                        <td className="px-6 py-5">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                openEditForm(rule)
                              }
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:border-[#d59618] hover:bg-[#fff9eb] hover:text-[#a86f00]"
                              title="Edit Rule"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(rule.id)
                              }
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-red-500 transition hover:border-red-200 hover:bg-red-50"
                              title="Delete Rule"
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
                        colSpan={6}
                        className="px-6 py-16 text-center"
                      >
                        <p className="text-base font-semibold text-gray-800">
                          No incentive rules found
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                          Click Add Rule to create your first rule.
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

      {/* Add/Edit Rule Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-[#17191d]">
                  {editingRule
                    ? "Edit Incentive Rule"
                    : "Add Incentive Rule"}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Set the monthly business range and incentive
                  percentage.
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

                {/* Rule Name */}
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Rule Name
                  </label>

                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        name: e.target.value,
                      })
                    }
                    placeholder="Example: Business 50K - 70K"
                    className="h-11 w-full rounded-lg border border-gray-200 bg-white px-4 text-sm text-gray-700 outline-none transition focus:border-[#d59618] focus:ring-2 focus:ring-[#f5b942]/20"
                    required
                  />
                </div>

                {/* Minimum Business */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Minimum Business
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={formData.minBusiness}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        minBusiness: e.target.value,
                      })
                    }
                    placeholder="49999"
                    className="h-11 w-full rounded-lg border border-gray-200 bg-white px-4 text-sm text-gray-700 outline-none transition focus:border-[#d59618] focus:ring-2 focus:ring-[#f5b942]/20"
                    required
                  />
                </div>

                {/* Maximum Business */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Maximum Business
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={formData.maxBusiness}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maxBusiness: e.target.value,
                      })
                    }
                    placeholder="69999"
                    className="h-11 w-full rounded-lg border border-gray-200 bg-white px-4 text-sm text-gray-700 outline-none transition focus:border-[#d59618] focus:ring-2 focus:ring-[#f5b942]/20"
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
                      value={formData.incentivePercentage}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          incentivePercentage:
                            e.target.value,
                        })
                      }
                      placeholder="5"
                      className="h-11 w-full rounded-lg border border-gray-200 bg-white px-4 pr-10 text-sm text-gray-700 outline-none transition focus:border-[#d59618] focus:ring-2 focus:ring-[#f5b942]/20"
                      required
                    />

                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400">
                      %
                    </span>
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Status
                  </label>

                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as
                          | "Active"
                          | "Inactive",
                      })
                    }
                    className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-[#d59618] focus:ring-2 focus:ring-[#f5b942]/20"
                  >
                    <option value="Active">
                      Active
                    </option>

                    <option value="Inactive">
                      Inactive
                    </option>
                  </select>
                </div>
              </div>

              {/* Formula Info */}
              <div className="mt-6 rounded-xl border border-[#f5b942]/30 bg-[#fffaf0] p-4">
                <p className="text-sm font-semibold text-[#a86f00]">
                  Incentive Calculation
                </p>

                <p className="mt-1 text-sm text-gray-600">
                  Incentive = Employee Salary × Incentive
                  Percentage
                </p>
              </div>

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
                  {editingRule
                    ? "Update Rule"
                    : "Save Rule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}