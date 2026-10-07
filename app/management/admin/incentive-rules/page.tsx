"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import Navbar from "@/app/components/Navbar";
import { supabase } from "@/app/lib/supabase";

import { toast } from "react-toastify";

import {
  Plus,
  Pencil,
  Trash2,
  X,
  SlidersHorizontal,
  ArrowLeft,
} from "lucide-react";

type IncentiveRule = {
  id: string;
  name: string;
  minBusiness: number;
  maxBusiness: number;
  incentivePercentage: number;
  status: "Active" | "Inactive";
};

export default function IncentiveRulePage() {
  const [rules, setRules] = useState<IncentiveRule[]>([]);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [deletingId, setDeletingId] =
  useState<string | null>(null);

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

  // =========================================================
  // FETCH RULES FROM SUPABASE
  // =========================================================

  const fetchRules = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
  .from("incentive_rules")
  .select(
    "id, name, min_business, max_business, incentive_percentage, status"
  )
  .order("min_business", { ascending: true });
      if (error) {
        console.error("Fetch incentive rules error:", error);
        toast.error(error.message);
        return;
      }

      const formattedRules: IncentiveRule[] = (data || []).map(
  (rule) => ({
    id: String(rule.id),
    name: rule.name,
    minBusiness: Number(rule.min_business),
    maxBusiness: Number(rule.max_business),
    incentivePercentage: Number(
      rule.incentive_percentage
    ),
    status:
      rule.status === "Inactive"
        ? "Inactive"
        : "Active",
  })
);

      setRules(formattedRules);
    } catch (error) {
      console.error("Unexpected fetch error:", error);
      toast.error("Failed to load incentive rules.");
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // LOAD DATA WHEN PAGE OPENS
  // =========================================================

  useEffect(() => {
    fetchRules();
  }, []);

  // =========================================================
  // ADD FORM
  // =========================================================

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

  // =========================================================
  // EDIT FORM
  // =========================================================

  const openEditForm = (rule: IncentiveRule) => {
    setEditingRule(rule);

    setFormData({
      name: rule.name,
      minBusiness: String(rule.minBusiness),
      maxBusiness: String(rule.maxBusiness),
      incentivePercentage: String(
        rule.incentivePercentage
      ),
      status: rule.status,
    });

    setShowForm(true);
  };

  // =========================================================
  // CLOSE FORM
  // =========================================================

  const closeForm = () => {
    if (saving) return;

    setShowForm(false);
    setEditingRule(null);
  };

  // =========================================================
  // FORM INPUT CHANGE
  // =========================================================

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  // =========================================================
  // ADD / EDIT SUBMIT
  // =========================================================

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    const name = formData.name.trim();

    const minBusiness = Number(formData.minBusiness);

    const maxBusiness = Number(formData.maxBusiness);

    const incentivePercentage = Number(
      formData.incentivePercentage
    );

    // ---------------------------------------------------------
    // VALIDATION
    // ---------------------------------------------------------

    if (!name) {
      toast.error("Please enter rule name.");
      return;
    }

    if (
      Number.isNaN(minBusiness) ||
      Number.isNaN(maxBusiness) ||
      minBusiness < 0 ||
      maxBusiness < 0 ||
      minBusiness > maxBusiness
    ) {
      toast.error("Please enter a valid business range.");
      return;
    }

    if (
      Number.isNaN(incentivePercentage) ||
      incentivePercentage <= 0 ||
      incentivePercentage > 100
    ) {
      toast.error(
        "Incentive percentage must be between 1 and 100."
      );
      return;
    }

    try {
      setSaving(true);

      // =======================================================
      // EDIT EXISTING RULE
      // =======================================================

      if (editingRule) {
        const { error } = await supabase
          .from("incentive_rules")
          .update({
            name,
            min_business: minBusiness,
            max_business: maxBusiness,
            incentive_percentage: incentivePercentage,
            status: formData.status,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingRule.id);

        if (error) {
          console.error(
            "Update incentive rule error:",
            error
          );

          toast.error(error.message);
          return;
        }

        toast.success("Incentive rule updated successfully.");
      }

      // =======================================================
      // ADD NEW RULE
      // =======================================================

      else {
        const { error } = await supabase
          .from("incentive_rules")
          .insert({
            name,
            min_business: minBusiness,
            max_business: maxBusiness,
            incentive_percentage: incentivePercentage,
            status: formData.status,
          });

        if (error) {
          console.error(
            "Insert incentive rule error:",
            error
          );

          toast.error(error.message);
          return;
        }

        toast.success("Incentive rule added successfully.");
      }

      // Refresh data from Supabase
      await fetchRules();

      closeForm();
    } catch (error) {
      console.error(
        "Save incentive rule unexpected error:",
        error
      );

      toast.error("Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // DELETE
  // =========================================================

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this incentive rule?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);

      const { error } = await supabase
        .from("incentive_rules")
        .delete()
        .eq("id", id);

      if (error) {
        console.error(
          "Delete incentive rule error:",
          error
        );

        toast.error(error.message);
        return;
      }

      toast.success("Incentive rule deleted successfully.");

      await fetchRules();
    } catch (error) {
      console.error(
        "Delete incentive rule unexpected error:",
        error
      );

      toast.error("Failed to delete incentive rule.");
    } finally {
      setDeletingId(null);
    }
  };

  // =========================================================
  // FORMAT CURRENCY
  // =========================================================

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString("en-IN")}`;
  };

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
          PAGE CONTENT
      ===================================================== */}

      <section className="px-5 py-10 md:px-8">

        <div className="mx-auto max-w-7xl">

          {/* =================================================
              HEADER
          ================================================= */}

          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <div className="flex items-center gap-3">

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

                <h1 className="text-3xl font-bold tracking-tight text-[#17191d]">
                  Incentive Rules
                </h1>

              </div>

              <p className="ml-4 mt-3 text-base text-gray-500">
                Define monthly business targets and employee
                incentive percentages.
              </p>

            </div>

            {/* ADD RULE */}

            <button
              type="button"
              onClick={openAddForm}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#17191d] px-5 text-sm font-semibold text-white transition hover:bg-black"
            >
              <Plus className="h-4 w-4" />
              Add Rule
            </button>

          </div>

          {/* =================================================
              RULES TABLE
          ================================================= */}

          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

            {/* TABLE HEADER */}

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

            {/* TABLE */}

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

                  {/* LOADING */}

                  {loading ? (

                    <tr>

                      <td
                        colSpan={6}
                        className="px-6 py-16 text-center"
                      >
                        <div className="flex flex-col items-center justify-center">

                          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#f5b942]" />

                          <p className="mt-3 text-sm text-gray-500">
                            Loading incentive rules...
                          </p>

                        </div>
                      </td>

                    </tr>

                  ) : rules.length > 0 ? (

                    rules.map((rule) => (

                      <tr
                        key={rule.id}
                        className="border-b border-gray-100 transition last:border-b-0 hover:bg-[#fffaf0]"
                      >

                        {/* RULE */}

                        <td className="px-6 py-5">

                          <p className="font-semibold text-gray-800">
                            {rule.name}
                          </p>

                          <p className="mt-1 text-xs text-gray-400">
                            Monthly business rule
                          </p>

                        </td>

                        {/* BUSINESS FROM */}

                        <td className="px-6 py-5 text-sm font-medium text-gray-700">
                          {formatCurrency(
                            rule.minBusiness
                          )}
                        </td>

                        {/* BUSINESS TO */}

                        <td className="px-6 py-5 text-sm font-medium text-gray-700">
                          {formatCurrency(
                            rule.maxBusiness
                          )}
                        </td>

                        {/* INCENTIVE */}

                        <td className="px-6 py-5">

                          <span className="inline-flex rounded-full bg-green-50 px-3 py-1 text-sm font-bold text-green-700">
                            {rule.incentivePercentage}%
                          </span>

                          <p className="mt-1 text-xs text-gray-400">
                            of salary
                          </p>

                        </td>

                        {/* STATUS */}

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

                        {/* ACTION */}

                        <td className="px-6 py-5">

                          <div className="flex items-center justify-center gap-2">

                            {/* EDIT */}

                            <button
                              type="button"
                              onClick={() =>
                                openEditForm(rule)
                              }
                              disabled={
                                saving ||
                                deletingId !== null
                              }
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:border-[#d59618] hover:bg-[#fff9eb] hover:text-[#a86f00] disabled:cursor-not-allowed disabled:opacity-50"
                              title="Edit Rule"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>

                            {/* DELETE */}

                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(rule.id)
                              }
                              disabled={
                                deletingId === rule.id ||
                                saving
                              }
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-red-500 transition hover:border-red-200 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                              title="Delete Rule"
                            >

                              {deletingId === rule.id ? (
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-200 border-t-red-500" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}

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
                          Click Add Rule to create your first
                          rule.
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

      {/* =====================================================
          ADD / EDIT RULE MODAL
      ===================================================== */}

      {showForm && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">

          <div className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl">

            {/* MODAL HEADER */}

            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">

              <div>

                <h2 className="text-xl font-bold text-[#17191d]">
                  {editingRule
                    ? "Edit Incentive Rule"
                    : "Add Incentive Rule"}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Define business range and incentive percentage.
                </p>

              </div>

              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-800 disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={handleSubmit}
              className="p-6"
            >

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                {/* RULE NAME */}

                <div className="md:col-span-2">

                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Rule Name
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Example: Rule 1"
                    className="h-11 w-full rounded-lg border border-gray-300 px-4 text-sm outline-none transition focus:border-[#f5b942] focus:ring-2 focus:ring-[#f5b942]/20"
                  />

                </div>

                {/* BUSINESS FROM */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Business From
                  </label>

                  <input
                    type="number"
                    name="minBusiness"
                    value={formData.minBusiness}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    placeholder="49999"
                    className="h-11 w-full rounded-lg border border-gray-300 px-4 text-sm outline-none transition focus:border-[#f5b942] focus:ring-2 focus:ring-[#f5b942]/20"
                  />

                </div>

                {/* BUSINESS TO */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Business To
                  </label>

                  <input
                    type="number"
                    name="maxBusiness"
                    value={formData.maxBusiness}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    placeholder="69999"
                    className="h-11 w-full rounded-lg border border-gray-300 px-4 text-sm outline-none transition focus:border-[#f5b942] focus:ring-2 focus:ring-[#f5b942]/20"
                  />

                </div>

                {/* INCENTIVE */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Incentive Percentage
                  </label>

                  <div className="relative">

                    <input
                      type="number"
                      name="incentivePercentage"
                      value={
                        formData.incentivePercentage
                      }
                      onChange={handleInputChange}
                      min="1"
                      max="100"
                      step="0.01"
                      placeholder="5"
                      className="h-11 w-full rounded-lg border border-gray-300 px-4 pr-10 text-sm outline-none transition focus:border-[#f5b942] focus:ring-2 focus:ring-[#f5b942]/20"
                    />

                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400">
                      %
                    </span>

                  </div>

                </div>

                {/* STATUS */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Status
                  </label>

                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm outline-none transition focus:border-[#f5b942] focus:ring-2 focus:ring-[#f5b942]/20"
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

              {/* FORM BUTTONS */}

              <div className="mt-7 flex justify-end gap-3">

                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="h-11 rounded-lg border border-gray-300 px-5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex h-11 min-w-[130px] items-center justify-center rounded-lg bg-[#17191d] px-5 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
                >

                  {saving ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-white" />
                      Saving...
                    </>
                  ) : (
                    editingRule
                      ? "Update Rule"
                      : "Add Rule"
                  )}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </main>
  );
}