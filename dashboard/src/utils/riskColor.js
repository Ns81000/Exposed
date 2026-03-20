export const RISK_COLOR = {
  high: '#DC2626',
  medium: '#D97706',
  low: '#2563EB'
};

export function riskAccent(risk) {
  return RISK_COLOR[risk] || '#52525B';
}
