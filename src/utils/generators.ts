export const generatePartnerCode = (name: string): string => {
  const prefix = name
    ? name
        .split(' ')
        .map((word) => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 3)
    : 'PRT';
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${random}`;
};

export const generateStaffId = (partnerCode: string): string => {
  const random = Math.floor(100 + Math.random() * 900);
  return `STF-${partnerCode}-${random}`;
};

export const generateSecurePassword = (length = 12): string => {
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const charset = uppercase + lowercase + numbers;
  
  let retVal = "";
  // Ensure at least one of each required type for security standards
  retVal += uppercase[Math.floor(Math.random() * uppercase.length)];
  retVal += lowercase[Math.floor(Math.random() * lowercase.length)];
  retVal += numbers[Math.floor(Math.random() * numbers.length)];
  
  // Fill the rest of the length
  for (let i = 0; i < length - 3; ++i) {
    retVal += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  
  // Shuffle the string
  return retVal.split('').sort(() => 0.5 - Math.random()).join('');
};
