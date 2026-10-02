import Link from "next/link";

type FormActionsProps = {
  submitText?: string;
  cancelHref?: string;
};

export default function FormActions({
  submitText = "Save",
  cancelHref = "/",
}: FormActionsProps) {
  return (
    <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:justify-end">
      <Link
        href={cancelHref}
        className="rounded-lg border border-gray-300 px-6 py-3 text-center font-semibold text-gray-700 transition hover:bg-gray-50"
      >
        Cancel
      </Link>

      <button
        type="submit"
        className="rounded-lg bg-[#f5b942] px-6 py-3 font-semibold text-black transition hover:bg-[#ffc95d]"
      >
        {submitText}
      </button>
    </div>
  );
}