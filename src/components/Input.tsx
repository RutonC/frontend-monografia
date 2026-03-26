import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";
import { DatePicker, Input as Field, Form, Select as SelectField } from "antd";

const dateFormat = "YYYY/MM/DD";

type FormProps = {
  children: React.ReactNode;
};

type InputProps = {
  placeholder?: string;
  type?: string;
  rows?: number;
  maxlength?: number;
  label?: string;
  name?: string;
  required?: boolean;
  message?: string;
  pattern?: any;
  defaultValue?: any;
  patternMessage?: string;
  search?: boolean;
  value?: any;
  disabled?: boolean;
  onChange?: (e: any) => void;
  options?: Array<{ value: string | any; label: string }>;
  verified?: boolean;
  nameConfirmPassword?: string;
  help?: React.ReactNode;
  tooltip?: string;
};

function Input({ children }: FormProps) {
  return <>{children}</>;
}

// Input só para textos
function Text({
  label,
  name,
  message = "Por favor, preencha este campo",
  required,
  placeholder,
  pattern,
  patternMessage,
  disabled,
  type,
  help,
  onChange,
}: InputProps) {
  return (
    <Form.Item
      label={label}
      name={name}
      rules={[
        { required, message },
        {
          pattern,
          message: patternMessage
            ? patternMessage
            : `${label}, inválido tente novamente.`,
        },
      ]}
      help={help}
    >
      <Field
        placeholder={placeholder}
        type={type}
        disabled={disabled}
        onChange={onChange}
      />
    </Form.Item>
  );
}

// Input só para Palavra-passe
function Password({
  label,
  name,
  message,
  required,
  placeholder,
  value,
  help,
  disabled,
}: InputProps) {
  return (
    <Form.Item
      label={label}
      name={name}
      rules={[{ required, message }]}
      help={help}
    >
      <Field.Password
        placeholder={placeholder}
        value={value}
        iconRender={(visible) =>
          visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
        }
        disabled={disabled}
      />
    </Form.Item>
  );
}

function Id({ label, name }: InputProps) {
  return (
    <div style={{ display: "none" }}>
      <Form.Item label={label} name={name}>
        <Field />
      </Form.Item>
    </div>
  );
}

function Select({
  search,
  options,
  label,
  name,
  defaultValue,
  value,
  help,
  placeholder,
  message = "Por favor, preencha este campo",
  required,
  onChange,
  disabled,
}: InputProps) {
  return (
    <Form.Item
      label={label}
      name={name}
      help={help}
      rules={[{ required, message }]}
    >
      <SelectField
        defaultValue={defaultValue}
        showSearch={search}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        options={options}
      />
    </Form.Item>
  );
}

function DataPicker({
  label,
  name,
  help,
  defaultValue,
  message = "Por favor, preencha este campo",
  required,
  placeholder,
  value,
  onChange,
  disabled,
}: InputProps) {
  return (
    <Form.Item
      label={label}
      name={name}
      help={help}
      rules={[{ required, message }]}
    >
      <DatePicker
        placeholder={placeholder}
        defaultValue={defaultValue}
        value={value}
        onChange={onChange}
        format={dateFormat}
        disabled={disabled}
        style={{ width: "100%" }}
      />
    </Form.Item>
  );
}

Input.Id = Id;
Input.Text = Text;
Input.Password = Password;
Input.Select = Select;
Input.DataPicker = DataPicker;

export { Input };
