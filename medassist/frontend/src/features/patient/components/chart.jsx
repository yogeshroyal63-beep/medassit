import React from "react";
import * as RechartsPrimitive from "recharts";
import { cn } from "./utils";

const THEMES = { light: "", dark: ".dark" };

const ChartContext = React.createContext(null);

function useChart() {
  const context = React.useContext(ChartContext);
  if (!context) {
    throw new Error("useChart must be used within a ChartContainer");
  }
  return context;
}

export function ChartContainer({ id, className, children, config = {}, ...props }) {
  const uniqueId = React.useId();
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`;

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        className={cn("flex aspect-video justify-center text-xs", className)}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
}

export function ChartStyle({ id, config }) {
  const colorConfig = Object.entries(config).filter(
    ([, c]) => c?.theme || c?.color
  );

  if (!colorConfig.length) return null;

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, item]) => {
    const color =
      (item.theme && item.theme[theme]) || item.color;
    return color ? `--color-${key}: ${color};` : "";
  })
  .join("\n")}
}
`
          )
          .join("\n"),
      }}
    />
  );
}

export const ChartTooltip = RechartsPrimitive.Tooltip;

export function ChartTooltipContent({ active, payload, className }) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div
      className={cn(
        "bg-white border rounded-lg px-3 py-2 text-xs shadow",
        className
      )}
    >
      {payload.map((item, i) => (
        <div key={i} className="flex justify-between gap-4">
          <span>{item.name}</span>
          <span className="font-medium">{item.value}</span>
        </div>
      ))}
    </div>
  );
}

export const ChartLegend = RechartsPrimitive.Legend;

export function ChartLegendContent({ payload }) {
  if (!payload || !payload.length) return null;

  return (
    <div className="flex items-center justify-center gap-4 pt-3">
      {payload.map((item) => (
        <div key={item.value} className="flex items-center gap-1.5">
          <div
            className="h-2 w-2 rounded"
            style={{ backgroundColor: item.color }}
          />
          {item.value}
        </div>
      ))}
    </div>
  );
}