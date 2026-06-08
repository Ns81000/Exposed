export const RISK_COLOR = {
  high: '#F87171',
  medium: '#FBBF24',
  low: '#60A5FA'
};

export function riskAccent(risk) {
  return RISK_COLOR[risk] || '#4B5064';
}
