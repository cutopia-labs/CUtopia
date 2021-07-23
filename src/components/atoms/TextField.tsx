import './TextField.scss';

type Tag = 'input' | 'textarea';

type TextFieldProps = {
  onChangeText: (text: string) => any;
  error?: string;
  Tag?: Tag;
  value: string;
  type?: string;
  ref?: React.RefObject<HTMLInputElement | HTMLTextAreaElement>;
  label?: string;
};

const TextField = ({
  value,
  onChangeText,
  placeholder,
  error,
  defaultValue,
  type,
  Tag,
  ref,
  label,
  onBlur,
  onFocus,
}: React.HTMLAttributes<HTMLInputElement | HTMLTextAreaElement> &
  TextFieldProps) => {
  const TagName = Tag || 'input';
  return (
    <>
      {Boolean(label) && (
        <span className="label text-filed-label">{label}</span>
      )}
      <TagName
        ref={ref as any}
        className="input-container"
        placeholder={placeholder}
        defaultValue={defaultValue}
        type={type}
        value={value}
        onChange={(e) => onChangeText(e.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
      />
      {Boolean(error) && <div className="error-label">{error}</div>}
    </>
  );
};

export default TextField;
