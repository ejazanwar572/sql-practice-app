import React from 'react';

export const formatValue = (val: any) => {
  if (val === null || val === undefined) {
    return React.createElement('span', { className: 'text-gray-500 italic' }, 'NULL');
  }
  // Handle cross-context Date objects
  if (val instanceof Date || Object.prototype.toString.call(val) === '[object Date]') {
    const d = val as Date;
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }
  if (typeof val === 'object') {
    return JSON.stringify(val);
  }
  return val.toString();
};
