type SelectOption = {
  label: string;
  value: string;
};

type FormSelectProps = {
  label: string;
  placeholder?: string;
  options: SelectOption[];
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  required?: boolean;
};

export default function FormSelect({
  label,
  placeholder = "Select",
  options,
  value,
  onChange,
  required = false,
}: FormSelectProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-gray-700">
        {label}
      </label>

      <select
        value={value}
        onChange={onChange}
        required={required}
        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-700 outline-none transition focus:border-[#f5b942] focus:ring-2 focus:ring-[#f5b942]/20"
      >
        <option value="">
          {placeholder}
        </option>

        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}