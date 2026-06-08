export const RISK_COLOR = {
  high: '#ff6161',
  medium: '#ffc533',
  low: '#57c1ff'
};

export function riskAccent(risk) {
  return RISK_COLOR[risk] || '#8a8f98';
}
