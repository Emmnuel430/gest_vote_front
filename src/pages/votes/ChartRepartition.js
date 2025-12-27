import useSelectTheme from "./useSelectTheme"; // ton hook
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const ChartRepartition = ({ stats }) => {
  const { isDarkMode } = useSelectTheme();

  if (!stats || !stats.resultats || stats.resultats.length === 0) {
    return (
      <div className="alert alert-warning mt-3">Aucune data pour le moment</div>
    );
  }

  // couleurs dynamiques selon le theme
  const textColor = isDarkMode ? "#f8f9fa" : "#212529";
  const gridColor = isDarkMode ? "#495057" : "#dee2e6";
  const barColor = isDarkMode ? "#0d6efd" : "#0d6efd"; // garde la couleur Bootstrap

  return (
    <div
      className={`bg-body rounded shadow-sm p-3 ${
        isDarkMode ? "bg-dark text-light" : ""
      }`}
    >
      <h5 className="mb-3">Répartition des voix</h5>

      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={stats.resultats}>
          <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />
          <XAxis dataKey="nom" stroke={textColor} />
          <YAxis stroke={textColor} />
          <Tooltip
            contentStyle={{
              backgroundColor: isDarkMode ? "#343a40" : "#ffffff",
              color: textColor,
            }}
          />
          <Bar dataKey="voix" fill={barColor} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ChartRepartition;
