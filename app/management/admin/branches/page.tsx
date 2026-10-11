
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Building2,
  Plus,
  Search,
  MapPin,
  X,
  Users,
  ArrowLeft,
  RotateCcw,
} from "lucide-react";

import Navbar from "@/app/components/Navbar";
import ExportTable from "@/app/components/ExportTable";
import { supabase } from "@/app/lib/supabase";
import { toast } from "react-toastify";

type Branch = {
  id: string;
  name: string;
  location: string;
  manager_name: string;
  employees: number;
  status: string;
};

export default function BranchesPage() {
  const [branchList, setBranchList] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [branchName, setBranchName] = useState("");
  const [branchLocation, setBranchLocation] = useState("");
  const [managerName, setManagerName] = useState("");
  const [addingBranch, setAddingBranch] = useState(false);

  // Fetch branch information and employee counts from Supabase.

const fetchBranches = useCallback(async () => {
  try {
    setLoading(true);

    const [branchResult, employeeResult] = await Promise.all([
     supabase
  .from("branches")
  .select("id, name, location, status, manager_employee_id")
        .order("name", { ascending: true }),

      supabase
        .from("employees")
        .select("id, name, branch_id, job_position"),
    ]);

    if (branchResult.error) throw branchResult.error;
    if (employeeResult.error) throw employeeResult.error;

    const employees = employeeResult.data ?? [];
    const branches = branchResult.data ?? [];

    // Employee ID se employee ki details find karne ke liye.
    const employeeById = new Map(
      employees.map((employee) => [
        String(employee.id),
        employee,
      ])
    );

    // Har branch ke employees ki count calculate karo.
    const employeeCountMap = new Map<string, number>();

    employees.forEach((employee) => {
      if (!employee.branch_id) return;

      const branchId = String(employee.branch_id);

      employeeCountMap.set(
        branchId,
        (employeeCountMap.get(branchId) ?? 0) + 1
      );
    });

    // Branch ke manager_employee_id se manager ka naam nikalo.
    const formattedBranches: Branch[] = branches.map((branch) => {
      const manager = branch.manager_employee_id
        ? employeeById.get(String(branch.manager_employee_id))
        : undefined;

      return {
        id: String(branch.id),
        name: branch.name ?? "",
        location: branch.location ?? "",
        manager_name: manager?.name ?? "",
        employees: employeeCountMap.get(String(branch.id)) ?? 0,
        status: branch.status ?? "Active",
      };
    });

    console.log("Branches with managers:", formattedBranches);

    setBranchList(formattedBranches);
  } catch (error) {
    console.error("Failed to fetch branches:", error);

    toast.error(
      error instanceof Error
        ? error.message
        : "Failed to load branches from Supabase."
    );
  } finally {
    setLoading(false);
  }
}, []);


  useEffect(() => {
    void fetchBranches();
  }, [fetchBranches]);

  // Search by branch, location, or manager name.
  const filteredBranches = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return branchList;

    return branchList.filter(
      (branch) =>
        branch.name.toLowerCase().includes(query) ||
        branch.location.toLowerCase().includes(query) ||
        branch.manager_name.toLowerCase().includes(query)
    );
  }, [branchList, search]);

  const resetSearch = () => setSearch("");

 
const handleAddBranch = async () => {
  const name = branchName.trim();
  const location = branchLocation.trim();

  if (!name) {
    toast.error("Please enter branch name.");
    return;
  }

  if (!location) {
    toast.error("Please enter branch location.");
    return;
  }

  try {
    setAddingBranch(true);

    const { data: existingBranch, error: duplicateError } =
      await supabase
        .from("branches")
        .select("id")
        .ilike("name", name)
        .maybeSingle();

    if (duplicateError) throw duplicateError;

    if (existingBranch) {
      toast.error("This branch already exists.");
      return;
    }

    const { error: insertError } = await supabase
      .from("branches")
      .insert({
        name,
        location,
        manager_name: "",
        manager_employee_id: null,
        status: "Active",
      });

    if (insertError) throw insertError;

    toast.success(
      "Branch created! Add its employees and assign a Salon Manager from the Employees page."
    );

    setBranchName("");
    setBranchLocation("");
    setIsAddModalOpen(false);

    await fetchBranches();
  } catch (error) {
    console.error("Add branch error:", error);

    toast.error(
      error instanceof Error
        ? error.message
        : "Failed to add branch."
    );
  } finally {
    setAddingBranch(false);
  }
};


  const branchExportData = filteredBranches.map((branch) => ({
    branchName: branch.name,
    location: branch.location,
    managerName: branch.manager_name,
    employees: branch.employees,
    status: branch.status,
  }));

  return (
    <main className="min-h-screen bg-[#f5f6f8]">
      {/* Navbar */}
      <div className="relative bg-[#17191d]">
        <Navbar />
        <div className="h-24" />
      </div>

      <section className="px-5 py-10 md:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Page heading */}
          <div className="mb-8">
            <div className="flex items-center gap-3">
              <Link
                href="/management/admin"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition hover:border-[#f5b942]"
                title="Back to Admin Dashboard"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>

              <div className="h-8 w-1 rounded-full bg-[#f5b942]" />

              <h1 className="text-3xl font-bold tracking-tight text-[#17191d] md:text-4xl">
                Branches
              </h1>
            </div>

            <p className="ml-4 mt-3 text-base text-gray-500">
              Manage salon branches, locations and branch managers.
            </p>
          </div>

          {/* Branch list card */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 px-6 py-5">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-[#17191d]">
                    Branch List
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    {filteredBranches.length}{" "}
                    {filteredBranches.length === 1 ? "branch" : "branches"}{" "}
                    found
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search branch or manager..."
                      className="h-11 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-10 text-sm text-gray-900 outline-none focus:border-[#f5b942] focus:ring-2 focus:ring-[#f5b942]/20 sm:w-64"
                    />

                    {search && (
                      <button
                        type="button"
                        onClick={resetSearch}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                        title="Clear search"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {/* Export */}
                  <ExportTable
                    data={branchExportData}
                    columns={[
                      { header: "Branch Name", key: "branchName" },
                      { header: "Location", key: "location" },
                      { header: "Manager Name", key: "managerName" },
                      { header: "Employees", key: "employees" },
                      { header: "Status", key: "status" },
                    ]}
                    fileName="HairPort-Branches"
                    disabled={!filteredBranches.length}
                  />

                  {/* Add branch */}
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(true)}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#17191d] px-5 text-sm font-semibold text-white transition hover:bg-black"
                  >
                    <Plus className="h-4 w-4" />
                    Add Branch
                  </button>
                </div>
              </div>
            </div>

            {/* Branch table */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="border-b border-gray-200 bg-[#fafafa] text-left">
                    {[
                      "#",
                      "Branch",
                      "Location",
                      "Manager Name",
                      "Employees",
                      "Status",
                    ].map((heading) => (
                      <th
                        key={heading}
                        className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-gray-500"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-16 text-center text-sm text-gray-500"
                      >
                        Loading branches from Supabase...
                      </td>
                    </tr>
                  ) : filteredBranches.length > 0 ? (
                    filteredBranches.map((branch, index) => (
                      <tr
                        key={branch.id}
                        className="border-b border-gray-100 transition last:border-b-0 hover:bg-[#fafafa]"
                      >
                        <td className="px-5 py-5 text-sm text-gray-400">
                          {String(index + 1).padStart(2, "0")}
                        </td>

                        <td className="px-5 py-5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#fff8e8]">
                              <Building2 className="h-5 w-5 text-[#d59618]" />
                            </div>
                            <span className="text-sm font-semibold text-[#17191d]">
                              {branch.name}
                            </span>
                          </div>
                        </td>

                        <td className="px-5 py-5">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 shrink-0 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {branch.location || "Not provided"}
                            </span>
                          </div>
                        </td>

                        <td className="px-5 py-5">
                          <span className="text-sm font-medium text-gray-700">
                            {branch.manager_name || "Not assigned"}
                          </span>
                        </td>

                        <td className="px-5 py-5">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-700">
                              {branch.employees}
                            </span>
                          </div>
                        </td>

                        <td className="px-5 py-5">
                          <span
                            className={`inline-flex items-center gap-2 text-sm font-medium ${
                              branch.status === "Active"
                                ? "text-green-700"
                                : "text-gray-500"
                            }`}
                          >
                            <span
                              className={`h-2 w-2 rounded-full ${
                                branch.status === "Active"
                                  ? "bg-green-500"
                                  : "bg-gray-400"
                              }`}
                            />
                            {branch.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-16 text-center"
                      >
                        <Search className="mx-auto h-8 w-8 text-gray-300" />
                        <p className="mt-3 text-sm font-semibold text-gray-700">
                          No branches found
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                          Try another branch, location or manager name.
                        </p>
                        {search && (
                          <button
                            type="button"
                            onClick={resetSearch}
                            className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[#a86f00]"
                          >
                            <RotateCcw className="h-4 w-4" />
                            Reset search
                          </button>
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Table footer */}
            <div className="flex items-center justify-between border-t border-gray-200 bg-[#fafafa] px-6 py-4">
              <p className="text-sm text-gray-500">
                Showing{" "}
                <span className="font-semibold text-gray-700">
                  {filteredBranches.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-gray-700">
                  {branchList.length}
                </span>{" "}
                branches
              </p>

              <button
                type="button"
                onClick={() => void fetchBranches()}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
              >
                <RotateCcw
                  className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Add Branch modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/50 p-4">
          <div className="my-auto w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* Modal header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-[#17191d]">
                  Add Branch
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Enter branch and manager details.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setBranchName("");
                  setBranchLocation("");
                  setManagerName("");
                }}
                disabled={addingBranch}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void handleAddBranch();
              }}
            >
              <div className="space-y-5 px-6 py-6">
                <div>
                  <label
                    htmlFor="branchName"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Branch Name
                  </label>
                  <input
                    id="branchName"
                    type="text"
                    value={branchName}
                    onChange={(e) => setBranchName(e.target.value)}
                    placeholder="e.g. BARWANI"
                    maxLength={100}
                    required
                    className="h-11 w-full rounded-lg border border-gray-300 px-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#f5b942] focus:ring-2 focus:ring-[#f5b942]/20"
                  />
                </div>

                <div>
                  <label
                    htmlFor="branchLocation"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Location
                  </label>
                  <input
                    id="branchLocation"
                    type="text"
                    value={branchLocation}
                    onChange={(e) => setBranchLocation(e.target.value)}
                    placeholder="Enter branch location"
                    maxLength={250}
                    required
                    className="h-11 w-full rounded-lg border border-gray-300 px-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#f5b942] focus:ring-2 focus:ring-[#f5b942]/20"
                  />
                </div>

                <div>
                  <label
                    htmlFor="managerName"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Manager Name
                  </label>
                  <input
                    id="managerName"
                    type="text"
                    value={managerName}
                    onChange={(e) => setManagerName(e.target.value)}
                    placeholder="Enter branch manager name"
                    maxLength={100}
                    required
                    className="h-11 w-full rounded-lg border border-gray-300 px-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#f5b942] focus:ring-2 focus:ring-[#f5b942]/20"
                  />
                </div>
              </div>

              {/* Modal actions */}
              <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-5">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setBranchName("");
                    setBranchLocation("");
                    setManagerName("");
                  }}
                  disabled={addingBranch}
                  className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    addingBranch ||
                    !branchName.trim() ||
                    !branchLocation.trim() ||
                    !managerName.trim()
                  }
                  className="rounded-lg bg-[#17191d] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {addingBranch ? "Saving..." : "Add Branch"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
