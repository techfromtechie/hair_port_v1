"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, UserRound, Save } from "lucide-react";

import Navbar from "@/app/components/Navbar";
import FormInput from "@/app/components/forms/FormInput";
import FormSelect from "@/app/components/forms/FormSelect";
import FormTextarea from "@/app/components/forms/FormTextarea";
import FormActions from "@/app/components/forms/FormActions";

import { supabase } from "@/app/lib/supabase";

// ============================================================
// TYPES
// ============================================================

type Branch = {
  id: string;
  name: string;
};

type EmployeeForm = {
  name: string;
  contactNumber: string;
  branch: string;
  dateOfBirth: string;
  joiningDate: string;
  aadharCard: string;
  gender: string;
  salary: string;
  address: string;
};

// ============================================================
// GENDER OPTIONS
// ============================================================

const genderOptions = [
  {
    label: "Male",
    value: "Male",
  },
  {
    label: "Female",
    value: "Female",
  },
  {
    label: "Other",
    value: "Other",
  },
];

// ============================================================
// PAGE
// ============================================================

export default function EditEmployeePage() {
  const params = useParams();
  const router = useRouter();

  const employeeId = params.id as string;

  // ==========================================================
  // STATES
  // ==========================================================

  const [branches, setBranches] = useState<Branch[]>([]);

  const [form, setForm] = useState<EmployeeForm>({
    name: "",
    contactNumber: "",
    branch: "",
    dateOfBirth: "",
    joiningDate: "",
    aadharCard: "",
    gender: "",
    salary: "",
    address: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // ==========================================================
  // TODAY DATE
  // ==========================================================

  const today = new Date().toISOString().split("T")[0];

  // ==========================================================
  // FETCH EMPLOYEE + BRANCHES
  // ==========================================================

  useEffect(() => {
    if (!employeeId) return;

    fetchData();
  }, [employeeId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      // ------------------------------------------------------
      // FETCH BRANCHES
      // ------------------------------------------------------

      const {
        data: branchData,
        error: branchError,
      } = await supabase
        .from("branches")
        .select("id, name")
        .order("name", { ascending: true });

      if (branchError) {
        console.error("Branch fetch error:", branchError);
        setError(branchError.message);
        return;
      }

      setBranches(branchData || []);

      // ------------------------------------------------------
      // FETCH EMPLOYEE
      // ------------------------------------------------------

      const {
        data: employee,
        error: employeeError,
      } = await supabase
        .from("employees")
        .select(`
          id,
          name,
          contact_number,
          branch_id,
          date_of_birth,
          joining_date,
          aadhar_card,
          gender,
          salary,
          address
        `)
        .eq("id", employeeId)
        .single();

      if (employeeError) {
        console.error("Employee fetch error:", employeeError);
        setError(employeeError.message);
        return;
      }

      if (!employee) {
        setError("Employee not found.");
        return;
      }

      // ------------------------------------------------------
      // SET FORM DATA
      // ------------------------------------------------------

      setForm({
        name: employee.name || "",
        contactNumber: employee.contact_number || "",
        branch: employee.branch_id || "",
        dateOfBirth: employee.date_of_birth || "",
        joiningDate: employee.joining_date || "",
        aadharCard: employee.aadhar_card || "",
        gender: employee.gender || "",
        salary: String(employee.salary ?? ""),
        address: employee.address || "",
      });
    } catch (error) {
      console.error("Fetch error:", error);
      setError("Something went wrong while loading employee.");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // HANDLE INPUT
  // ==========================================================

  const handleChange = (
    field: keyof EmployeeForm,
    value: string
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  // ==========================================================
  // UPDATE EMPLOYEE
  // ==========================================================

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!employeeId) {
      alert("Employee ID is missing.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const { error: updateError } = await supabase
        .from("employees")
        .update({
          name: form.name,
          contact_number: form.contactNumber,
          branch_id: form.branch,
          date_of_birth: form.dateOfBirth || null,
          joining_date: form.joiningDate,
          aadhar_card: form.aadharCard,
          gender: form.gender,
          salary: Number(form.salary),
          address: form.address,
          updated_at: new Date().toISOString(),
        })
        .eq("id", employeeId);

      if (updateError) {
        console.error("Update employee error:", updateError);
        alert(updateError.message);
        return;
      }

      alert("Employee updated successfully!");

      // Go back to employee list
      router.push("/management/admin/employees");
    } catch (error) {
      console.error("Update error:", error);
      alert("Something went wrong while updating employee.");
    } finally {
      setSaving(false);
    }
  };

  // ==========================================================
  // RESET
  // ==========================================================

  const handleReset = () => {
    fetchData();
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f5f6f8]">

        <div className="relative bg-[#17191d]">
          <Navbar />
          <div className="h-24" />
        </div>

        <section className="flex min-h-[500px] items-center justify-center">

          <div className="flex flex-col items-center">

            <div className="h-9 w-9 animate-spin rounded-full border-4 border-gray-200 border-t-[#d59618]" />

            <p className="mt-4 text-sm text-gray-500">
              Loading employee...
            </p>

          </div>

        </section>
      </main>
    );
  }

  // ==========================================================
  // RETURN
  // ==========================================================

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

        <div className="mx-auto max-w-5xl">

          {/* =================================================
              BACK BUTTON
          ================================================= */}

          <button
            type="button"
            onClick={() =>
              router.push("/management/admin/employees")
            }
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-[#a86f00]"
          >
            <ArrowLeft className="h-4 w-4" />

            Back to Employees
          </button>

          {/* =================================================
              HEADER
          ================================================= */}

          <div className="mb-8">

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fff9eb] text-[#d59618]">

                <UserRound className="h-5 w-5" />

              </div>

              <div>

                <h1 className="text-3xl font-bold tracking-tight text-[#17191d]">
                  Edit Employee
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                  Update employee personal and salary details.
                </p>

              </div>

            </div>

          </div>

          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">

              <p className="font-semibold">
                Unable to load employee
              </p>

              <p className="mt-1">
                {error}
              </p>

            </div>
          )}

          {/* =================================================
              FORM
          ================================================= */}

          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8"
          >

            {/* =================================================
                FORM HEADER
            ================================================= */}

            <div className="mb-8">

              <h2 className="text-lg font-bold text-[#17191d]">
                Employee Information
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Update the employee's personal and salary details.
              </p>

            </div>

            {/* =================================================
                FORM FIELDS
            ================================================= */}

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

              {/* NAME */}

              <FormInput
                label="Name"
                type="text"
                placeholder="Enter employee name"
                value={form.name}
                onChange={(e) =>
                  handleChange("name", e.target.value)
                }
                required
              />

              {/* CONTACT NUMBER */}

              <FormInput
                label="Contact Number"
                type="tel"
                placeholder="Enter contact number"
                value={form.contactNumber}
                onChange={(e) =>
                  handleChange(
                    "contactNumber",
                    e.target.value
                  )
                }
                required
              />

              {/* BRANCH */}

              <FormSelect
                label="Branch"
                value={form.branch}
                onChange={(e) =>
                  handleChange("branch", e.target.value)
                }
                options={[
                  {
                    label: "Select Branch",
                    value: "",
                  },
                  ...branches.map((branch) => ({
                    label: branch.name,
                    value: branch.id,
                  })),
                ]}
                required
              />

              {/* DATE OF BIRTH */}

              <FormInput
                label="Date of Birth"
                type="date"
                value={form.dateOfBirth}
                onChange={(e) =>
                  handleChange(
                    "dateOfBirth",
                    e.target.value
                  )
                }
                max={today}
                required
              />

              {/* JOINING DATE */}

              <FormInput
                label="Joining Date"
                type="date"
                value={form.joiningDate}
                onChange={(e) =>
                  handleChange(
                    "joiningDate",
                    e.target.value
                  )
                }
                max={today}
                required
              />

              {/* AADHAR */}

              <FormInput
                label="Aadhar Card"
                type="text"
                placeholder="Enter Aadhar number"
                value={form.aadharCard}
                onChange={(e) =>
                  handleChange(
                    "aadharCard",
                    e.target.value
                  )
                }
                required
              />

              {/* GENDER */}

              <FormSelect
                label="Gender"
                value={form.gender}
                onChange={(e) =>
                  handleChange("gender", e.target.value)
                }
                options={[
                  {
                    label: "Select Gender",
                    value: "",
                  },
                  ...genderOptions,
                ]}
                required
              />

              {/* SALARY */}

              <FormInput
                label="Salary"
                type="number"
                placeholder="Enter monthly salary"
                value={form.salary}
                onChange={(e) =>
                  handleChange("salary", e.target.value)
                }
                min="0"
                required
              />

            </div>

            {/* =================================================
                ADDRESS
            ================================================= */}

            <div className="mt-5">

              <FormTextarea
                label="Address"
                placeholder="Enter employee address"
                value={form.address}
                onChange={(e) =>
                  handleChange("address", e.target.value)
                }
                required
              />

            </div>

            {/* =================================================
                ACTIONS
            ================================================= */}

            <div className="mt-8 border-t border-gray-100 pt-6">

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  onClick={handleReset}
                  disabled={saving}
                  className="inline-flex h-11 items-center justify-center rounded-lg border border-gray-200 px-5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Reset
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#17191d] px-6 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />

                  {saving
                    ? "Updating..."
                    : "Update Employee"}
                </button>

              </div>

            </div>

          </form>

        </div>

      </section>

    </main>
  );
}