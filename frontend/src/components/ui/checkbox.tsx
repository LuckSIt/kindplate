import React from 'react';
import { Check, Minus } from 'lucide-react';

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  label?: string;
  description?: string;
  error?: string;
  indeterminate?: boolean;
  onChange?: (checked: boolean) => void;
  className?: string;
}

export function Checkbox({
  label,
  description,
  error,
  indeterminate = false,
  onChange,
  className = '',
  ...props
}: CheckboxProps) {
  const [isChecked, setIsChecked] = React.useState(props.checked || false);
  const [isIndeterminate, setIsIndeterminate] = React.useState(indeterminate);

  React.useEffect(() => {
    setIsChecked(props.checked || false);
  }, [props.checked]);

  React.useEffect(() => {
    setIsIndeterminate(indeterminate);
  }, [indeterminate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setIsChecked(checked);
    setIsIndeterminate(false);
    onChange?.(checked);
    props.onChange?.(e);
  };

  const getCheckboxClasses = () => {
    const baseClasses = 'w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 dark:border-gray-600 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700';
    const errorClasses = error ? 'border-red-500 focus:ring-red-500' : '';
    const disabledClasses = props.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';
    
    return `${baseClasses} ${errorClasses} ${disabledClasses}`;
  };

  return (
    <div className={`space-y-1 ${className}`}>
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            {...props}
            type="checkbox"
            checked={isChecked}
            onChange={handleChange}
            className={getCheckboxClasses()}
            ref={(el) => {
              if (el) {
                el.indeterminate = isIndeterminate;
              }
            }}
          />
        </div>
        <div className="ml-3 text-sm">
          {label && (
            <label className="font-medium text-gray-700 dark:text-gray-300">
              {label}
            </label>
          )}
          {description && (
            <p className="text-gray-500 dark:text-gray-400">{description}</p>
          )}
          {error && (
            <p className="text-red-600 dark:text-red-400">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
}

interface CheckboxGroupProps {
  options: Array<{
    value: string | number;
    label: string;
    description?: string;
    disabled?: boolean;
  }>;
  value: (string | number)[];
  onChange: (values: (string | number)[]) => void;
  label?: string;
  error?: string;
  helperText?: string;
  className?: string;
}

export function CheckboxGroup({
  options,
  value,
  onChange,
  label,
  error,
  helperText,
  className = ''
}: CheckboxGroupProps) {
  const handleChange = (optionValue: string | number, checked: boolean) => {
    if (checked) {
      onChange([...value, optionValue]);
    } else {
      onChange(value.filter(v => v !== optionValue));
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      
      <div className="space-y-2">
        {options.map((option) => (
          <Checkbox
            key={option.value}
            label={option.label}
            description={option.description}
            checked={value.includes(option.value)}
            onChange={(checked) => handleChange(option.value, checked)}
            disabled={option.disabled}
          />
        ))}
      </div>
      
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {helperText}
        </p>
      )}
    </div>
  );
}

interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  label?: string;
  description?: string;
  error?: string;
  onChange?: (checked: boolean) => void;
  className?: string;
}

export function Radio({
  label,
  description,
  error,
  onChange,
  className = '',
  ...props
}: RadioProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    onChange?.(checked);
    props.onChange?.(e);
  };

  const getRadioClasses = () => {
    const baseClasses = 'w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 dark:border-gray-600 focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700';
    const errorClasses = error ? 'border-red-500 focus:ring-red-500' : '';
    const disabledClasses = props.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';
    
    return `${baseClasses} ${errorClasses} ${disabledClasses}`;
  };

  return (
    <div className={`space-y-1 ${className}`}>
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            {...props}
            type="radio"
            onChange={handleChange}
            className={getRadioClasses()}
          />
        </div>
        <div className="ml-3 text-sm">
          {label && (
            <label className="font-medium text-gray-700 dark:text-gray-300">
              {label}
            </label>
          )}
          {description && (
            <p className="text-gray-500 dark:text-gray-400">{description}</p>
          )}
          {error && (
            <p className="text-red-600 dark:text-red-400">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
}

interface RadioGroupProps {
  options: Array<{
    value: string | number;
    label: string;
    description?: string;
    disabled?: boolean;
  }>;
  value: string | number;
  onChange: (value: string | number) => void;
  name: string;
  label?: string;
  error?: string;
  helperText?: string;
  className?: string;
}

export function RadioGroup({
  options,
  value,
  onChange,
  name,
  label,
  error,
  helperText,
  className = ''
}: RadioGroupProps) {
  const handleChange = (optionValue: string | number) => {
    onChange(optionValue);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      
      <div className="space-y-2">
        {options.map((option) => (
          <Radio
            key={option.value}
            name={name}
            label={option.label}
            description={option.description}
            value={option.value}
            checked={value === option.value}
            onChange={() => handleChange(option.value)}
            disabled={option.disabled}
          />
        ))}
      </div>
      
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {helperText}
        </p>
      )}
    </div>
  );
}

interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  label?: string;
  description?: string;
  error?: string;
  onChange?: (checked: boolean) => void;
  className?: string;
}

export function Switch({
  label,
  description,
  error,
  onChange,
  className = '',
  ...props
}: SwitchProps) {
  const [isChecked, setIsChecked] = React.useState(props.checked || false);

  React.useEffect(() => {
    setIsChecked(props.checked || false);
  }, [props.checked]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setIsChecked(checked);
    onChange?.(checked);
    props.onChange?.(e);
  };

  const getSwitchClasses = () => {
    const baseClasses = 'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800';
    const checkedClasses = isChecked ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700';
    const disabledClasses = props.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';
    
    return `${baseClasses} ${checkedClasses} ${disabledClasses}`;
  };

  const getThumbClasses = () => {
    const baseClasses = 'inline-block h-4 w-4 transform rounded-full bg-white transition-transform';
    const checkedClasses = isChecked ? 'translate-x-6' : 'translate-x-1';
    
    return `${baseClasses} ${checkedClasses}`;
  };

  return (
    <div className={`space-y-1 ${className}`}>
      <div className="flex items-start">
        <div className="flex items-center h-6">
          <button
            type="button"
            onClick={() => !props.disabled && setIsChecked(!isChecked)}
            disabled={props.disabled}
            className={getSwitchClasses()}
          >
            <span className={getThumbClasses} />
          </button>
          <input
            {...props}
            type="checkbox"
            checked={isChecked}
            onChange={handleChange}
            className="sr-only"
          />
        </div>
        <div className="ml-3 text-sm">
          {label && (
            <label className="font-medium text-gray-700 dark:text-gray-300">
              {label}
            </label>
          )}
          {description && (
            <p className="text-gray-500 dark:text-gray-400">{description}</p>
          )}
          {error && (
            <p className="text-red-600 dark:text-red-400">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
}

interface SwitchGroupProps {
  options: Array<{
    value: string | number;
    label: string;
    description?: string;
    disabled?: boolean;
  }>;
  value: (string | number)[];
  onChange: (values: (string | number)[]) => void;
  label?: string;
  error?: string;
  helperText?: string;
  className?: string;
}

export function SwitchGroup({
  options,
  value,
  onChange,
  label,
  error,
  helperText,
  className = ''
}: SwitchGroupProps) {
  const handleChange = (optionValue: string | number, checked: boolean) => {
    if (checked) {
      onChange([...value, optionValue]);
    } else {
      onChange(value.filter(v => v !== optionValue));
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      
      <div className="space-y-2">
        {options.map((option) => (
          <Switch
            key={option.value}
            label={option.label}
            description={option.description}
            checked={value.includes(option.value)}
            onChange={(checked) => handleChange(option.value, checked)}
            disabled={option.disabled}
          />
        ))}
      </div>
      
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {helperText}
        </p>
      )}
    </div>
  );
}



