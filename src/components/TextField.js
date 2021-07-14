import React from 'react';
import './TextField.css';

const TextField = ({
  value,
  onChangeText,
  placeholder,
  error,
  defaultValue,
  keyboardType,
  secureTextEntry,
  Tag,
  ref,
  onBlur,
  onFocus,
}) => {
  const TagName = Tag || 'input';
  return (
    <>
      <TagName
        ref={ref}
        className="input-container"
        placeholder={placeholder}
        placeholderTextColor="#00000066"
        defaultValue={defaultValue}
        type={keyboardType}
        value={value}
        onChange={(e) => onChangeText(e.target.value)}
        security={secureTextEntry}
        onFocus={onFocus}
        onBlur={onBlur}
      />
      {error && (
        <div className="error-label" type="error">
          {error}
        </div>
      )}
    </>
  );
};

export default TextField;
