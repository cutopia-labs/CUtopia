import clsx from 'clsx';
import './TextField.scss';

type Tag = 'input' | 'textarea';

type TextFieldProps = {
  onChangeText: (text: string) => any;
  error?: string;
  Tag?: Tag;
  value: string;
  type?: string;
  inputRef?: React.RefObject<HTMLInputElement | HTMLTextAreaElement>;
  label?: string;
  disabled?: boolean;
};

const TextField = ({
  value,
  onChangeText,
  placeholder,
  error,
  defaultValue,
  type,
  Tag,
  inputRef,
  label,
  onBlur,
  onFocus,
  disabled,
  className,
}: React.HTMLAttributes<HTMLInputElement | HTMLTextAreaElement> &
  TextFieldProps) => {
  const TagName = Tag || 'input';
  return (
    <>
      {Boolean(label) && (
        <span className="label text-filed-label">{label}</span>
      )}
      <TagName
        ref={inputRef as any}
        className={clsx('input-container', className)}
        placeholder={placeholder}
        defaultValue={defaultValue}
        type={type}
        value={value}
        onChange={e => onChangeText(e.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        disabled={disabled}
      />
      {Boolean(error) && <div className="error-label">{error}</div>}
    </>
  );
};

export default TextField;
