export const generatePartnerCode = (name: string): string => {
  const prefix = name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 3);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${random}`;
};

export const generateStaffId = (partnerCode: string): string => {
  const random = Math.floor(100 + Math.random() * 900);
  return `STF-${partnerCode}-${random}`;
};
