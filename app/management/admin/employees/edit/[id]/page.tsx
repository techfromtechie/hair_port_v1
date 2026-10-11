
"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, UserRound, Save } from "lucide-react";
import { toast } from "react-toastify";

import Navbar from "@/app/components/Navbar";
import FormInput from "@/app/components/forms/FormInput";
import FormSelect from "@/app/components/forms/FormSelect";
import { supabase } from "@/app/lib/supabase";

type SelectOption = {
  label: string;
  value: string;
};

type EmployeeForm = {
  name: string;
  contactNumber: string;
  branch: string;
  jobPosition: string;
  dateOfBirth: string;
  joiningDate: string;
  aadharCard: string;
  gender: string;
  salary: string;
  address: string;
};

const genderOptions: SelectOption[] = [
  { label: "Male", value: "Male" },
  { label: "Female", value: "Female" },
  { label: "Other", value: "Other" },
];

const positionOptions: SelectOption[] = [
  { label: "Salon Manager", value: "Salon Manager" },
  { label: "Assistant Manager", value: "Assistant Manager" },
  { label: "Hair Stylist", value: "Hair Stylist" },
  { label: "Barber", value: "Barber" },
  { label: "Beautician", value: "Beautician" },
  { label: "Makeup Artist", value: "Makeup Artist" },
  { label: "Hair Wash Assistant", value: "Hair Wash Assistant" },
  { label: "Helper", value: "Helper" },
  { label: "Receptionist", value: "Receptionist" },
  { label: "Cleaner", value: "Cleaner" },
];

const emptyForm: EmployeeForm = {
  name: "",
  contactNumber: "",
  branch: "",
  jobPosition: "",
  dateOfBirth: "",
  joiningDate: "",
  aadharCard: "",
  gender: "",
  salary: "",
  address: "",
};

export default function EditEmployeePage() {
  const params = useParams();
  const router = useRouter();

  const employeeId = params.id as string;

  const [branchOptions, setBranchOptions] = useState<SelectOption[]>([]);
  const [form, setForm] = useState<EmployeeForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const today = new Date().toLocaleDateString("en-CA");

  // Load branches and existing employee details from Supabase.
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const [branchResult, employeeResult] = await Promise.all([
        supabase
          .from("branches")
          .select("id, name")
          .order("name", { ascending: true }),

        supabase
          .from("employees")
          .select(
            "id, name, contact_number, branch_id, job_position, date_of_birth, joining_date, aadhar_card, gender, salary, address"
          )
          .eq("id", employeeId)
          .single(),
      ]);

      if (branchResult.error) {
        throw branchResult.error;
      }

      if (employeeResult.error) {
        throw employeeResult.error;
      }

      const branches = branchResult.data ?? [];
      const employee = employeeResult.data;

      setBranchOptions(
        branches.map((branch) => ({
          label: branch.name,
          value: String(branch.id),
        }))
      );

      setForm({
        name: employee.name ?? "",
        contactNumber: employee.contact_number ?? "",
        branch: String(employee.branch_id ?? ""),
        jobPosition: employee.job_position ?? "",
        dateOfBirth: employee.date_of_birth?.slice(0, 10) ?? "",
        joiningDate: employee.joining_date?.slice(0, 10) ?? "",
        aadharCard: employee.aadhar_card ?? "",
        gender: employee.gender ?? "",
        salary: String(employee.salary ?? ""),
        address: employee.address ?? "",
      });
    } catch (error) {
      console.error("Failed to load employee:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to load employee details."
      );
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  useEffect(() => {
    if (employeeId) {
      void fetchData();
    }
  }, [employeeId, fetchData]);

  const handleChange = (field: keyof EmployeeForm, value: string) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (saving) return;

    if (!form.name.trim()) {
      toast.error("Please enter employee name.");
      return;
    }

    if (!branchOptions.some((option) => option.value === form.branch)) {
      toast.error("Please select a valid branch.");
      return;
    }

    if (!positionOptions.some((option) => option.value === form.jobPosition)) {
      toast.error("Please select a job position.");
      return;
    }

    const contact = form.contactNumber.trim();
    const aadhar = form.aadharCard.trim();
    const salary = form.salary.trim();

    if (!/^\d{10}$/.test(contact)) {
      toast.error("Contact number must contain exactly 10 digits.");
      return;
    }

    if (!/^\d{12}$/.test(aadhar)) {
      toast.error("Aadhaar number must contain exactly 12 digits.");
      return;
    }

    if (!salary || !Number.isFinite(Number(salary)) || Number(salary) < 0) {
      toast.error("Please enter a valid salary.");
      return;
    }

    if (!form.joiningDate) {
      toast.error("Please select joining date.");
      return;
    }

    if (form.dateOfBirth && form.dateOfBirth > today) {
      toast.error("Date of birth cannot be in the future.");
      return;
    }

    if (form.joiningDate > today) {
      toast.error("Joining date cannot be in the future.");
      return;
    }

    try {
      setSaving(true);

      const { error } = await supabase
        .from("employees")
        .update({
          name: form.name.trim(),
          contact_number: contact,
          branch_id: form.branch,
          job_position: form.jobPosition,
          date_of_birth: form.dateOfBirth || null,
          joining_date: form.joiningDate,
          aadhar_card: aadhar,
          gender: form.gender,
          salary: Number(salary),
          address: form.address.trim(),
        })
        .eq("id", employeeId);

      if (error) {
        throw error;
      }

      toast.success("Employee updated successfully!");
      router.push("/management/admin/employees");
      router.refresh();
    } catch (error) {
      console.error("Update employee error:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong while updating employee."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    void fetchData();
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f5f6f8]">
        <div className="relative bg-[#17191d]">
          <Navbar />
          <div className="h-24" />
        </div>

        <section className="flex min-h-[400px] items-center justify-center">
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

  return (
    <main className="min-h-screen bg-[#f5f6f8]">
      {/* Navbar */}
      <div className="relative bg-[#17191d]">
        <Navbar />
        <div className="h-24" />
      </div>

      {/* Page content */}
      <section className="px-5 py-10 md:px-8">
        <div className="mx-auto max-w-5xl">
          <Link
            href="/management/admin/employees"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-[#a86f00]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Employees
          </Link>

          {/* Heading */}
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
                  Update employee personal, job and salary details.
                </p>
              </div>
            </div>
          </div>

          {/* Employee form */}
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8"
          >
            <div className="mb-8">
              <h2 className="text-lg font-bold text-[#17191d]">
                Employee Information
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Update the employee&apos;s personal, job and salary details.
              </p>
            </div>

            {/* Form fields */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

              {/* Employee name */}
              <FormInput
                label="Name"
                type="text"
                placeholder="Enter employee name"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                required
              />

              {/* Contact number */}
              <FormInput
                label="Contact Number"
                type="tel"
                placeholder="Enter 10-digit contact number"
                value={form.contactNumber}
                onChange={(e) =>
                  handleChange(
                    "contactNumber",
                    e.target.value.replace(/\D/g, "").slice(0, 10)
                  )
                }
                required
              />

              {/* Branch dropdown */}
              <FormSelect
                label="Branch"
                value={form.branch}
                onChange={(e) => handleChange("branch", e.target.value)}
                options={[
                  { label: "Select Branch", value: "" },
                  ...branchOptions,
                ]}
                required
              />

              {/* Job position dropdown */}
              <FormSelect
                label="Job Position"
                value={form.jobPosition}
                onChange={(e) => handleChange("jobPosition", e.target.value)}
                options={[
                  { label: "Select Job Position", value: "" },
                  ...positionOptions,
                ]}
                required
              />

              {/* Date of birth */}
              <FormInput
                label="Date of Birth"
                type="date"
                value={form.dateOfBirth}
                onChange={(e) => handleChange("dateOfBirth", e.target.value)}
                max={today}
              />

              {/* Joining date */}
              <FormInput
                label="Joining Date"
                type="date"
                value={form.joiningDate}
                onChange={(e) => handleChange("joiningDate", e.target.value)}
                max={today}
                required
              />

              {/* Aadhaar number */}
              <FormInput
                label="Aadhar Card"
                type="text"
                placeholder="Enter 12-digit Aadhaar number"
                value={form.aadharCard}
                onChange={(e) =>
                  handleChange(
                    "aadharCard",
                    e.target.value.replace(/\D/g, "").slice(0, 12)
                  )
                }
                required
              />

              {/* Gender dropdown */}
              <FormSelect
                label="Gender"
                value={form.gender}
                onChange={(e) => handleChange("gender", e.target.value)}
                options={[
                  { label: "Select Gender", value: "" },
                  ...genderOptions,
                ]}
                required
              />

              {/* Salary */}
              <FormInput
                label="Salary"
                type="number"
                placeholder="Enter monthly salary"
                value={form.salary}
                onChange={(e) => handleChange("salary", e.target.value)}
                min="0"
                required
              />

              {/* Compact address input beside Salary */}
              <FormInput
                label="Address"
                type="text"
                placeholder="Enter employee address"
                value={form.address}
                onChange={(e) => handleChange("address", e.target.value)}
                required
              />
            </div>

            {/* Form actions */}
            <div className="mt-8 border-t border-gray-100 pt-6">
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={saving}
                  className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Reset
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#f5b942] px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-[#e0a82f] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  {saving ? "Updating Employee..." : "Update Employee"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
