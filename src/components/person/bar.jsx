import { Typography, Box, Chip } from "@mui/material";
import { ResponsiveBar } from "@nivo/bar";
import { memo } from "react";

import { HelpPopover } from "@/components/HelpPopover";

const ResponsiveBarChart = memo(function ResponsiveBarChart({
  data,
  keys,
  selectedYears,
  onBarClick,
}) {
  return (
    <ResponsiveBar
      data={data}
      keys={keys}
      onClick={(item) => {
        onBarClick(item.indexValue);
      }}
      indexBy="year"
      margin={{ top: 20, right: 90, bottom: 80, left: 30 }}
      padding={0.3}
      valueScale={{ type: "linear" }}
      indexScale={{ type: "band", round: true }}
      colors={{ scheme: "set3" }}
      axisTop={null}
      axisRight={null}
      axisBottom={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 45,
        // ゴミ処理
        renderTick: (tick) => {
          return (
            <g
              transform={`translate(${tick.x},${
                tick.y + 20
              })rotate(45)scale(0.8)`}
              onClick={() => {
                onBarClick(tick.value);
              }}
            >
              <text
                fill={selectedYears.includes(tick.value) ? "#FFB020" : "black"}
              >
                {tick.value}
              </text>
              ;
            </g>
          );
        },
      }}
      axisLeft={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        format: (e) => Math.floor(e) === e && e,
      }}
      labelSkipWidth={12}
      labelSkipHeight={12}
      labelTextColor={{
        from: "color",
        modifiers: [["darker", 1.6]],
      }}
      legendLabel={(item) => {
        return item.id.substr(0, 3);
      }}
      legends={[
        {
          dataFrom: "keys",
          anchor: "bottom-right",
          direction: "column",
          justify: false,
          translateX: 120,
          translateY: 20,
          itemsSpacing: 2,
          itemWidth: 100,
          itemHeight: 20,
          itemDirection: "left-to-right",
          itemOpacity: 0.85,
          symbolSize: 20,
          effects: [
            {
              on: "hover",
              style: {
                itemOpacity: 1,
              },
            },
          ],
        },
      ]}
      role="application"
    />
  );
});

export const BarSection = memo(function BarSection({
  barData,
  handleBarClick,
  selectedYears,
}) {
  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Typography sx={{ p: 1, display: "flex", alignItems: "center" }}>
          棒グラフから気になる映画の
          <Chip label="製作年度" color="warning" sx={{ m: 0.5 }} size="small" />
          を選択して、映画を絞り込みましょう
        </Typography>
        <HelpPopover
          text={`この棒グラフは製作に携わってきた映画を製作年度と役職ごとに表示したものです。`}
        />
      </Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          height: 280,
          width: "100%",
        }}
      >
        <ResponsiveBarChart
          data={barData.data}
          keys={barData.keys}
          selectedYears={selectedYears}
          onBarClick={handleBarClick}
        />
      </Box>
    </Box>
  );
});
