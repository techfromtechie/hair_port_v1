"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, UserPlus } from "lucide-react";

import Navbar from "@/app/components/Navbar";
import FormInput from "@/app/components/forms/FormInput";
import FormSelect from "@/app/components/forms/FormSelect";

import { supabase } from "@/app/lib/supabase";
import { toast } from "react-toastify";

type SelectOption = {
  label: string;
  value: string;
};

// Gender dropdown options
const genderOptions: SelectOption[] = [
  { label: "Male", value: "Male" },
  { label: "Female", value: "Female" },
  { label: "Other", value: "Other" },
];

// Job Position dropdown options
// "Salon Manager" spelling is important for the manager assignment feature.
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

export default function AddEmployeePage() {
  const router = useRouter();

  // Form fields
  const [name, setName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [branch, setBranch] = useState("");
  const [jobPosition, setJobPosition] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [joiningDate, setJoiningDate] = useState("");
  const [aadharCard, setAadharCard] = useState("");
  const [gender, setGender] = useState("");
  const [salary, setSalary] = useState("");
  const [address, setAddress] = useState("");

  // Dropdown and submission states
  const [branchOptions, setBranchOptions] = useState<SelectOption[]>([]);
  const [loadingBranches, setLoadingBranches] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Today's date for date field validation
  const today = new Date().toLocaleDateString("en-CA");

  // Fetch branches from Supabase
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        setLoadingBranches(true);

        const { data, error } = await supabase
          .from("branches")
          .select("id, name")
          .order("name", { ascending: true });

        if (error) {
          throw error;
        }

        setBranchOptions(
          (data ?? []).map((item) => ({
            label: item.name,
            value: item.id,
          }))
        );
      } catch (error) {
        console.error("Failed to load branches:", error);
        toast.error("Failed to load branches from Supabase.");
      } finally {
        setLoadingBranches(false);
      }
    };

    void fetchBranches();
  }, []);
    // Submit form and save employee in Supabase
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (submitting) return;

    if (!branchOptions.some((option) => option.value === branch)) {
      toast.error("Please select a valid branch.");
      return;
    }

    if (!positionOptions.some((option) => option.value === jobPosition)) {
      toast.error("Please select a job position.");
      return;
    }

    const normalizedContact = contactNumber.trim();
    const normalizedAadhar = aadharCard.trim();

    if (!/^\d{10}$/.test(normalizedContact)) {
      toast.error("Contact number must contain exactly 10 digits.");
      return;
    }

    if (!/^\d{12}$/.test(normalizedAadhar)) {
      toast.error("Aadhaar number must contain exactly 12 digits.");
      return;
    }

    if (Number(salary) < 0 || salary.trim() === "") {
      toast.error("Please enter a valid salary.");
      return;
    }

    if (dateOfBirth > today) {
      toast.error("Date of birth cannot be in the future.");
      return;
    }

    if (joiningDate > today) {
      toast.error("Joining date cannot be in the future.");
      return;
    }

    try {
      setSubmitting(true);

      const { error } = await supabase.from("employees").insert({
        name: name.trim(),
        contact_number: normalizedContact,
        branch_id: branch,
        job_position: jobPosition,
        date_of_birth: dateOfBirth || null,
        joining_date: joiningDate,
        aadhar_card: normalizedAadhar,
        gender,
        salary: Number(salary),
        address: address.trim(),
      });

      if (error) {
        throw error;
      }

      toast.success("Employee added successfully!");

      router.push("/management/admin/employees");
      router.refresh();
    } catch (error) {
      console.error("Add employee error:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong while adding the employee."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Reset all form fields
  const handleReset = () => {
    setName("");
    setContactNumber("");
    setBranch("");
    setJobPosition("");
    setDateOfBirth("");
    setJoiningDate("");
    setAadharCard("");
    setGender("");
    setSalary("");
    setAddress("");
  };

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
          {/* Back button */}
          <Link
            href="/management/admin/employees"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-[#a86f00]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Employees
          </Link>

          {/* Page heading */}
          <div className="mb-8">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fff9eb] text-[#d59618]">
                <UserPlus className="h-5 w-5" />
              </div>

              <div>
                <h1 className="text-3xl font-bold tracking-tight text-[#17191d]">
                  Add Employee
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                  Add a new employee to the salon.
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
                Enter the employee&apos;s personal, job and salary details.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {/* Employee name */}
              <FormInput
                label="Name"
                type="text"
                placeholder="Enter employee name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              {/* Contact number */}
              <FormInput
                label="Contact Number"
                type="tel"
                placeholder="Enter 10-digit contact number"
                value={contactNumber}
                onChange={(e) =>
                  setContactNumber(e.target.value.replace(/\D/g, "").slice(0, 10))
                }
                required
              />

              {/* Branch dropdown */}
              <FormSelect
                label="Branch"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                options={[
                  {
                    label: loadingBranches
                      ? "Loading branches..."
                      : "Select Branch",
                    value: "",
                  },
                  ...branchOptions,
                ]}
                required
              />

              {/* Job position dropdown */}
              <FormSelect
                label="Job Position"
                value={jobPosition}
                onChange={(e) => setJobPosition(e.target.value)}
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
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                max={today}
                required
              />

              {/* Joining date */}
              <FormInput
                label="Joining Date"
                type="date"
                value={joiningDate}
                onChange={(e) => setJoiningDate(e.target.value)}
                max={today}
                required
              />

              {/* Aadhaar number */}
              <FormInput
                label="Aadhar Card"
                type="text"
                placeholder="Enter 12-digit Aadhaar number"
                value={aadharCard}
                onChange={(e) =>
                  setAadharCard(e.target.value.replace(/\D/g, "").slice(0, 12))
                }
                required
              />

              {/* Gender dropdown */}
              <FormSelect
                label="Gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                options={[
                  { label: "Select Gender", value: "" },
                  ...genderOptions,
                ]}
                required
              />

            
{/* Monthly Salary */}
<FormInput
  label="Salary"
  type="number"
  placeholder="Enter monthly salary"
  value={salary}
  onChange={(e) => setSalary(e.target.value)}
  min="0"
  required
/>

{/* Address - compact input beside Salary */}
<FormInput
  label="Address"
  type="text"
  placeholder="Enter employee address"
  value={address}
  onChange={(e) => setAddress(e.target.value)}
  required
/>

</div>

            {/* Form actions */}
            <div className="mt-8 border-t border-gray-100 pt-6">
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={submitting}
                  className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Reset
                </button>

                <button
                  type="submit"
                  disabled={submitting || loadingBranches}
                  className="rounded-lg bg-[#f5b942] px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-[#e0a82f] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? "Saving Employee..." : "Add Employee"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}