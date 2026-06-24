import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";

let chartJsRegistered = false;

export function ensureChartJsRegistered() {
  if (chartJsRegistered || typeof window === "undefined") return;
  ChartJS.register(
    ArcElement,
    BarElement,
    CategoryScale,
    LinearScale,
    LineElement,
    PointElement,
    Filler,
    Tooltip,
    Legend
  );
  chartJsRegistered = true;
}

export const CHART_BLUE = {
  primary: "#004080",
  dark: "#003366",
  light: "#0066cc",
  pale: "#DBEAFE",
  muted: "#94A3B8",
  surface: "#E2E8F0",
  success: "#22C55E",
  warning: "#F59E0B",
  danger: "#EF4444",
  accent: "#00CCFF",
};

export const chartFont = {
  family: "'Inter', 'Montserrat', system-ui, sans-serif",
  size: 11,
};

export function baseChartOptions(extra = {}) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: CHART_BLUE.dark,
        titleFont: { ...chartFont, weight: "600" },
        bodyFont: chartFont,
        padding: 10,
        cornerRadius: 8,
      },
    },
    ...extra,
  };
}
