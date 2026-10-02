type FormTextareaProps = {
  label: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  rows?: number;
  required?: boolean;
};

export default function FormTextarea({
  label,
  placeholder,
  value,
  onChange,
  rows = 4,
  required = false,
}: FormTextareaProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-gray-700">
        {label}
      </label>

      <textarea
        rows={rows}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full resize-none rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-700 outline-none transition focus:border-[#f5b942] focus:ring-2 focus:ring-[#f5b942]/20"
      />
    </div>
  );
}