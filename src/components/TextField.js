import React from 'react';
import './TextField.css';

const TextField = ({
  value, onChangeText, placeholder, error, defaultValue, keyboardType, secureTextEntry,
}) => (
  <>
    <input
      className="input-container"
      placeholder={placeholder}
      placeholderTextColor="#00000066"
      defaultValue={defaultValue}
      type={keyboardType}
      value={value}
      onChange={e => onChangeText(e.target.value)}
      security={secureTextEntry}
    />
    {
      error
      && <div className="error-label" type="error">{error}</div>
    }
  </>
);

export default TextField;
