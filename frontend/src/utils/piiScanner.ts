const PII_PATTERNS = [
  'email', 'phone', 'ssn', 'dob', 'birth_date', 'address', 'zip', 'postcode',
  'passport', 'credit_card', 'cc_number', 'name', 'first_name', 'last_name',
  'ip_address', 'social_security', 'mobile'
];

export const detectPIIColumns = (headers: string[]): string[] => {
  return headers.filter(header => {
    const h = header.toLowerCase().replace(/[^a-z0-9]/g, '');
    return PII_PATTERNS.some(pattern => h.includes(pattern));
  });
};

export const redactPII = (data: any[], piiColumns: string[]): any[] => {
  if (piiColumns.length === 0) return data;
  
  return data.map(row => {
    const newRow = { ...row };
    piiColumns.forEach(col => {
      if (newRow[col]) {
        newRow[col] = '[REDACTED]';
      }
    });
    return newRow;
  });
};
