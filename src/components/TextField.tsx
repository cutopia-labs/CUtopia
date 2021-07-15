import './TextField.css';

type Tag = 'input' | 'textarea';

type TextFieldProps = {
  onChangeText: (text: string) => any;
  error?: string;
  Tag?: Tag;
  value: string;
  type?: string;
  ref?: React.RefObject<HTMLInputElement | HTMLTextAreaElement>;
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
  onBlur,
  onFocus,
}: React.HTMLAttributes<HTMLInputElement | HTMLTextAreaElement> &
  TextFieldProps) => {
  const TagName = Tag || 'input';
  return (
    <>
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
      {error && <div className="error-label">{error}</div>}
    </>
  );
};

export default TextField;
