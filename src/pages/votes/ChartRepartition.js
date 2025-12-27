import useSelectTheme from "./useSelectTheme";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;

    return (
      <div className="bg-dark text-light p-2 rounded shadow-sm">
        <div className="fw-bold">{data.nom}</div>
        <div>Voix : {data.voix}</div>
        <div>Pourcentage : {data.pourcentage}%</div>
      </div>
    );
  }
  return null;
};

const ChartRepartition = ({ stats }) => {
  const { isDarkMode } = useSelectTheme();

  if (!stats || !stats.resultats || stats.resultats.length === 0) {
    return (
      <div className="alert alert-warning mt-3">Aucune data pour le moment</div>
    );
  }

  const textColor = isDarkMode ? "#f8f9fa" : "#212529";
  const gridColor = isDarkMode ? "#495057" : "#dee2e6";
  const barColor = "#0d6efd";

  // 🔥 largeur dynamique (important pour le scroll)
  const chartWidth = Math.max(stats.resultats.length * 80, 700);

  return (
    <div
      className={`bg-body rounded shadow-sm border p-3 ${
        isDarkMode ? "bg-dark text-light" : ""
      }`}
    >
      <h5 className="mb-5">Répartition des voix</h5>

      {/* 🔥 Scroll horizontal */}
      <div
        style={{ overflowX: "auto" }}
        className="d-md-flex justify-content-center"
      >
        <div style={{ width: chartWidth, height: 450 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.resultats}>
              <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />
              <XAxis
                dataKey="nom"
                stroke={textColor}
                interval={0}
                angle={-25}
                textAnchor="end"
                height={80}
              />
              <YAxis stroke={textColor} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="voix" fill={barColor} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ChartRepartition;
