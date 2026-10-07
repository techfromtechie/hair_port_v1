"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import Navbar from "@/app/components/Navbar";
import ExportTable from "@/app/components/ExportTable";

import { supabase } from "@/app/lib/supabase";
import { toast } from "react-toastify";

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


// =========================================================
// TYPES
// =========================================================

type Branch = {
  id: string;
  name: string;
  location: string;
  employees: number;
  status: "Active" | "Inactive";
};


// =========================================================
// PAGE
// =========================================================

export default function BranchesPage() {

  // =======================================================
  // BRANCH DATA
  // =======================================================

  const [branchList, setBranchList] = useState<Branch[]>([]);

  const [loading, setLoading] = useState(true);

  // =======================================================
  // SEARCH
  // =======================================================

  const [search, setSearch] = useState("");

  // =======================================================
  // ADD BRANCH MODAL
  // =======================================================

  const [isAddModalOpen, setIsAddModalOpen] =
    useState(false);

  const [branchName, setBranchName] =
    useState("");

  const [branchLocation, setBranchLocation] =
    useState("");

  const [addingBranch, setAddingBranch] =
    useState(false);


  // =======================================================
  // FETCH BRANCHES FROM SUPABASE
  // =======================================================

  const fetchBranches = async () => {

    try {

      setLoading(true);

      // ===================================================
      // FETCH BRANCHES
      // ===================================================

      const {
        data: branchData,
        error: branchError,
      } = await supabase
        .from("branches")
        .select("id, name")
        .order("name", {
          ascending: true,
        });

      if (branchError) {

        console.error(
          "Branch fetch error:",
          branchError
        );

        toast.error(
          "Failed to load branches."
        );

        return;
      }


      // ===================================================
      // FETCH EMPLOYEES
      // ===================================================

      const {
        data: employeeData,
        error: employeeError,
      } = await supabase
        .from("employees")
        .select("id, branch_id");

      if (employeeError) {

        console.error(
          "Employee fetch error:",
          employeeError
        );

        toast.error(
          "Failed to load employee data."
        );

        return;
      }


      // ===================================================
      // COUNT EMPLOYEES BY BRANCH
      // ===================================================

      const employeeCountMap =
        new Map<string, number>();


      (employeeData ?? []).forEach(
        (employee) => {

          if (!employee.branch_id) {
            return;
          }

          const currentCount =
            employeeCountMap.get(
              employee.branch_id
            ) ?? 0;

          employeeCountMap.set(
            employee.branch_id,
            currentCount + 1
          );
        }
      );


      // ===================================================
      // FORMAT BRANCH DATA
      // ===================================================

      const formattedBranches: Branch[] =
        (branchData ?? []).map(
          (branch) => {

            const employeeCount =
              employeeCountMap.get(
                branch.id
              ) ?? 0;

            return {

              id: branch.id,

              name: branch.name,

              /*
               * Current branches table does not use
               * a separate location field.
               *
               * Therefore branch name is shown
               * as location for the existing UI.
               */
              location: branch.name,

              employees: employeeCount,

              /*
               * Status is not stored in the current
               * branches schema, so existing UI
               * displays Active.
               */
              status: "Active",
            };
          }
        );


      setBranchList(
        formattedBranches
      );

    } catch (error) {

      console.error(
        "Unexpected branch error:",
        error
      );

      toast.error(
        "Something went wrong while loading branches."
      );

    } finally {

      setLoading(false);

    }
  };


  // =======================================================
  // INITIAL FETCH
  // =======================================================

  useEffect(() => {

    fetchBranches();

  }, []);


  // =======================================================
  // FILTER BRANCHES
  // =======================================================

  const filteredBranches = useMemo(() => {

    const searchValue =
      search.trim().toLowerCase();


    if (!searchValue) {

      return branchList;

    }


    return branchList.filter(
      (branch) =>
        branch.name
          .toLowerCase()
          .includes(searchValue) ||

        branch.location
          .toLowerCase()
          .includes(searchValue)
    );

  }, [
    branchList,
    search,
  ]);


  // =======================================================
  // ADD BRANCH
  // =======================================================

  const handleAddBranch = async () => {

    const name =
      branchName.trim();


    /*
     * Location is kept in UI because it exists
     * in the current form, but current branches
     * table does not have a location column.
     */
    const location =
      branchLocation.trim();


    // ===================================================
    // VALIDATION
    // ===================================================

    if (!name) {

      toast.error(
        "Please enter branch name."
      );

      return;
    }


    if (!location) {

      toast.error(
        "Please enter location."
      );

      return;
    }


    try {

      setAddingBranch(true);


      // =================================================
      // CHECK DUPLICATE BRANCH
      // =================================================

      const {
        data: existingBranch,
        error: existingBranchError,
      } = await supabase
        .from("branches")
        .select("id, name")
        .ilike("name", name)
        .maybeSingle();


      if (existingBranchError) {

        console.error(
          "Duplicate check error:",
          existingBranchError
        );

        toast.error(
          "Failed to validate branch."
        );

        return;
      }


      if (existingBranch) {

        toast.error(
          "This branch already exists."
        );

        return;
      }


      // =================================================
      // INSERT BRANCH INTO SUPABASE
      // =================================================

      const {
        error: insertError,
      } = await supabase
        .from("branches")
        .insert([
          {
            name: name,
          },
        ]);


      if (insertError) {

        console.error(
          "Branch insert error:",
          insertError
        );

        toast.error(
          insertError.message ||
            "Failed to add branch."
        );

        return;
      }


      // =================================================
      // SUCCESS
      // =================================================

      toast.success(
        "Branch added successfully!"
      );


      // =================================================
      // RESET FORM
      // =================================================

      setBranchName("");

      setBranchLocation("");

      setIsAddModalOpen(false);


      // =================================================
      // REFRESH DATA
      // =================================================

      await fetchBranches();

    } catch (error) {

      console.error(
        "Unexpected add branch error:",
        error
      );

      toast.error(
        "Something went wrong while adding branch."
      );

    } finally {

      setAddingBranch(false);

    }
  };


  // =======================================================
  // EXPORT DATA
  // =======================================================

  const branchExportData =
    filteredBranches.map(
      (branch) => ({

        branchName:
          branch.name,

        location:
          branch.location,

        employees:
          branch.employees,

        status:
          branch.status,

      })
    );


  // =======================================================
  // RESET SEARCH
  // =======================================================

  const resetSearch = () => {

    setSearch("");

  };


  // =======================================================
  // PAGE UI
  // =======================================================

  return (

    <main className="min-h-screen bg-[#f5f6f8]">

      {/* =================================================
          NAVBAR
      ================================================= */}

      <div className="relative bg-[#17191d]">

        <Navbar />

        <div className="h-24" />

      </div>


      {/* =================================================
          PAGE CONTENT
      ================================================= */}

      <section className="px-5 py-10 md:px-8">

        <div className="mx-auto max-w-7xl">


          {/* =================================================
              PAGE HEADER
          ================================================= */}

          <div className="mb-8">

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


              {/* PAGE TITLE */}

              <h1 className="text-3xl font-bold tracking-tight text-[#17191d] md:text-4xl">

                Branches

              </h1>

            </div>


            <p className="ml-4 mt-3 text-base text-gray-500">

              Manage and monitor all HairPort Salon branches.

            </p>

          </div>


          {/* =================================================
              MAIN BRANCH SECTION
          ================================================= */}

          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">


            {/* =================================================
                TABLE HEADER / ACTION BAR
            ================================================= */}

            <div className="border-b border-gray-200 px-6 py-5">

              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">


                {/* TITLE */}

                <div>

                  <h2 className="text-xl font-bold text-[#17191d]">

                    Branch List

                  </h2>


                  <p className="mt-1 text-sm text-gray-500">

                    {filteredBranches.length}{" "}

                    {filteredBranches.length === 1
                      ? "branch"
                      : "branches"}{" "}

                    available

                  </p>

                </div>


                {/* ACTIONS */}

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">


                  {/* SEARCH */}

                  <div className="relative">

                    <Search className="absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-gray-400" />


                    <input
                      type="text"
                      value={search}
                      onChange={(e) =>
                        setSearch(
                          e.target.value
                        )
                      }
                      placeholder="Search branch..."
                      className="h-11 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-10 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#f5b942] focus:ring-2 focus:ring-[#f5b942]/20 sm:w-64"
                    />


                    {search && (

                      <button
                        type="button"
                        onClick={
                          resetSearch
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-700"
                        title="Clear search"
                      >

                        <X className="h-4 w-4" />

                      </button>

                    )}

                  </div>


                  {/* EXPORT */}

                  <ExportTable
                    data={
                      branchExportData
                    }
                    columns={[
                      {
                        header:
                          "Branch Name",
                        key:
                          "branchName",
                      },
                      {
                        header:
                          "Location",
                        key:
                          "location",
                      },
                      {
                        header:
                          "Employees",
                        key:
                          "employees",
                      },
                      {
                        header:
                          "Status",
                        key:
                          "status",
                      },
                    ]}
                    fileName="HairPort-Branches"
                    disabled={
                      !filteredBranches.length
                    }
                  />


                  {/* ADD BRANCH */}

                  <button
                    type="button"
                    onClick={() =>
                      setIsAddModalOpen(
                        true
                      )
                    }
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#17191d] px-5 text-sm font-semibold text-white transition hover:bg-black"
                  >

                    <Plus className="h-4 w-4" />

                    Add Branch

                  </button>

                </div>

              </div>

            </div>


            {/* =================================================
                TABLE
            ================================================= */}

            <div className="overflow-x-auto">

              <table className="w-full min-w-[800px]">


                {/* =================================================
                    TABLE HEAD
                ================================================= */}

                <thead>

                  <tr className="border-b border-gray-200 bg-[#fafafa] text-left">

                    <th className="w-20 px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                      #
                    </th>

                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                      Branch
                    </th>

                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                      Location
                    </th>

                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                      Employees
                    </th>

                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                      Status
                    </th>

                  </tr>

                </thead>


                {/* =================================================
                    TABLE BODY
                ================================================= */}

                <tbody>

                  {loading ? (

                    <tr>

                      <td
                        colSpan={5}
                        className="px-6 py-20 text-center"
                      >

                        <div className="flex flex-col items-center">

                          <div className="h-9 w-9 animate-spin rounded-full border-4 border-gray-200 border-t-[#f5b942]" />

                          <p className="mt-4 text-sm font-medium text-gray-500">

                            Loading branches...

                          </p>

                        </div>

                      </td>

                    </tr>

                  ) : filteredBranches.length > 0 ? (

                    filteredBranches.map(
                      (branch, index) => (

                        <tr
                          key={branch.id}
                          className="border-b border-gray-100 transition last:border-b-0 hover:bg-[#fafafa]"
                        >

                          {/* =================================================
                              NUMBER
                          ================================================= */}

                          <td className="px-6 py-5">

                            <span className="text-sm font-medium text-gray-400">

                              {String(
                                index + 1
                              ).padStart(
                                2,
                                "0"
                              )}

                            </span>

                          </td>


                          {/* =================================================
                              BRANCH
                          ================================================= */}

                          <td className="px-6 py-5">

                            <div className="flex items-center gap-3">

                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#fff8e8]">

                                <Building2 className="h-5 w-5 text-[#d59618]" />

                              </div>


                              <div>

                                <p className="text-sm font-semibold text-[#17191d]">

                                  {branch.name}

                                </p>


                                <p className="mt-0.5 text-xs text-gray-400">

                                  HairPort Salon

                                </p>

                              </div>

                            </div>

                          </td>


                          {/* =================================================
                              LOCATION
                          ================================================= */}

                          <td className="px-6 py-5">

                            <div className="flex items-center gap-2">

                              <MapPin className="h-4 w-4 text-gray-400" />

                              <span className="text-sm text-gray-600">

                                {branch.location}

                              </span>

                            </div>

                          </td>


                          {/* =================================================
                              EMPLOYEES
                          ================================================= */}

                          <td className="px-6 py-5">

                            <div className="flex items-center gap-2">

                              <Users className="h-4 w-4 text-gray-400" />

                              <span className="text-sm font-medium text-gray-700">

                                {branch.employees}

                              </span>

                            </div>

                          </td>


                          {/* =================================================
                              STATUS
                          ================================================= */}

                          <td className="px-6 py-5">

                            <span className="inline-flex items-center gap-2 text-sm font-medium text-green-700">

                              <span className="h-2 w-2 rounded-full bg-green-500" />

                              {branch.status}

                            </span>

                          </td>

                        </tr>

                      )
                    )

                  ) : (

                    <tr>

                      <td
                        colSpan={5}
                        className="px-6 py-20 text-center"
                      >

                        <div className="flex flex-col items-center">

                          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">

                            <Search className="h-6 w-6 text-gray-400" />

                          </div>


                          <h3 className="mt-4 text-base font-semibold text-gray-900">

                            No branches found

                          </h3>


                          <p className="mt-1 text-sm text-gray-500">

                            Try searching with another branch name or location.

                          </p>

                        </div>

                      </td>

                    </tr>

                  )}

                </tbody>

              </table>

            </div>


            {/* =================================================
                TABLE FOOTER
            ================================================= */}

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

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          ADD BRANCH MODAL
      ===================================================== */}

      {isAddModalOpen && (

        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-5">

          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">


            {/* =================================================
                MODAL HEADER
            ================================================= */}

            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">

              <div>

                <h2 className="text-xl font-bold text-[#17191d]">

                  Add Branch

                </h2>

                <p className="mt-1 text-sm text-gray-500">

                  Add a new HairPort Salon branch.

                </p>

              </div>


              <button
                type="button"
                onClick={() => {

                  setIsAddModalOpen(
                    false
                  );

                  setBranchName("");

                  setBranchLocation("");

                }}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
              >

                <X className="h-5 w-5" />

              </button>

            </div>


            {/* =================================================
                MODAL FORM
            ================================================= */}

            <div className="space-y-5 px-6 py-6">


              {/* =================================================
                  BRANCH NAME
              ================================================= */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-gray-700">

                  Branch Name

                </label>

                <input
                  type="text"
                  value={branchName}
                  onChange={(e) =>
                    setBranchName(
                      e.target.value
                    )
                  }
                  placeholder="e.g. BARWANI"
                  className="h-11 w-full rounded-lg border border-gray-300 px-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#f5b942] focus:ring-2 focus:ring-[#f5b942]/20"
                />

              </div>


              {/* =================================================
                  LOCATION
              ================================================= */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-gray-700">

                  Location

                </label>

                <input
                  type="text"
                  value={branchLocation}
                  onChange={(e) =>
                    setBranchLocation(
                      e.target.value
                    )
                  }
                  placeholder="e.g. Barwani"
                  className="h-11 w-full rounded-lg border border-gray-300 px-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#f5b942] focus:ring-2 focus:ring-[#f5b942]/20"
                />

                <p className="mt-2 text-xs text-gray-400">
                  Location is currently used for display/search only.
                </p>

              </div>

            </div>


            {/* =================================================
                MODAL FOOTER
            ================================================= */}

            <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-5">

              {/* CANCEL */}

              <button
                type="button"
                onClick={() => {

                  setIsAddModalOpen(
                    false
                  );

                  setBranchName("");

                  setBranchLocation("");

                }}
                className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >

                Cancel

              </button>


              {/* ADD */}

              <button
                type="button"
                onClick={
                  handleAddBranch
                }
                disabled={
                  addingBranch ||
                  !branchName.trim() ||
                  !branchLocation.trim()
                }
                className="rounded-lg bg-[#17191d] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
              >

                {addingBranch
                  ? "Adding..."
                  : "Add Branch"}

              </button>

            </div>

          </div>

        </div>

      )}

    </main>
  );
}