/**
 * Lightweight CSS-only bar chart — avoids pulling in a charting library
 * for a handful of admin summary bars. Swap for recharts if the reports
 * screen grows more complex (e.g. multi-series trend lines).
 */
const ReportChart = ({ data, labelKey, valueKey, formatValue }) => {
  const max = Math.max(...data.map((d) => d[valueKey]), 1);

  return (
    <div className="flex flex-col gap-3">
      {data.map((item) => (
        <div key={item[labelKey]}>
          <div className="mb-1 flex justify-between text-xs">
            <span className="font-medium text-ink">{item[labelKey]}</span>
            <span className="text-slate-500">{formatValue ? formatValue(item[valueKey]) : item[valueKey]}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-primary-500 transition-all duration-500"
              style={{ width: `${(item[valueKey] / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReportChart;