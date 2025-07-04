import React from 'react';

export const Textarea = ({ value, onChange, placeholder, className = '' }: any) => {
  return (
    <textarea
      className={`w-full rounded-md border border-input px-3 py-2 text-sm ${className}`}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
    />
  );
};
