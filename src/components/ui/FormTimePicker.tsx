// components/form/FormTimePicker.tsx
"use client";

import { Controller, Control, FieldValues } from "react-hook-form";
import { TimePicker } from "antd";
import dayjs from "dayjs";

interface FormTimePickerProps {
  name: string;
  control: Control<FieldValues>;
  label?: string;
  format?: string;
}

const FormTimePicker = ({
  name,
  control,
  label,
  format = "HH:mm",
}: FormTimePickerProps) => {
  return (
    <div>
      {label && (
        <label className="text-[11px] font-black text-slate-400 uppercase ml-1">
          {label}
        </label>
      )}
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <TimePicker
            className="w-full mt-1 h-12 "
            format={format}
            value={field.value ? dayjs(field.value, format) : null}
            onChange={(t) => field.onChange(t?.format(format))}
          />
        )}
      />
    </div>
  );
};

export default FormTimePicker;
