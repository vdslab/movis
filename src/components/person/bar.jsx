import { Box, Chip, Typography } from "@mui/material";
import { ResponsiveBar } from "@nivo/bar";
import { memo, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

import { HelpPopover } from "@/components/HelpPopover";
import {
  selectSelectedYears,
  toggleSelectedYear,
} from "@/modules/features/app/slice";
import { generateBarData } from "@/util";

const CustomTick = memo(function CustomTick({ x, y, year, textColor }) {
  const yearString = String(year);
  const yearStringArray = yearString.split("");
  const textSize = 12;
  return (
    <g>
      <g transform={`translate(${x},${y})`}>
        <line x1={0} y1={0} x2={0} y2={5} stroke="#777777" />
      </g>

      <g transform={`translate(${x},${y + 12})`}>
        {yearStringArray.map((s, index) => {
          return (
            <g key={index} transform={`translate(0,${textSize * index * 0.9})`}>
              <text
                fontSize={textSize}
                fill={textColor}
                textAnchor="middle"
                dominantBaseline="central"
              >
                {s}
              </text>
            </g>
          );
        })}
      </g>
    </g>
  );
});

const ResponsiveBarChart = memo(function ResponsiveBarChart({
  occupations,
  relatedMovies,
}) {
  const dispatch = useDispatch();

  const selectedYears = useSelector(selectSelectedYears);

  const tickTextColorMap = {
    neutral: "#424242",
    selected: "#FFB020",
  };

  const filledYears = useMemo(() => {
    const relatedYears = Array.from(
      new Set(relatedMovies.map((rm) => rm.movie.productionYear))
    );

    const yearStart = Math.min(...relatedYears);
    const yearEnd = Math.max(...relatedYears);

    const ys = [];
    for (let y = yearStart; y <= yearEnd; ++y) {
      ys.push(y);
    }

    return ys;
  }, [relatedMovies]);

  const barData = useMemo(
    () => generateBarData(relatedMovies, occupations, filledYears),
    [relatedMovies, occupations, filledYears]
  );

  const handleToggleYear = useCallback(
    (year) => {
      dispatch(toggleSelectedYear(year));
    },
    [dispatch]
  );

  const handleClickBar = useCallback(
    (item) => {
      const year = item.indexValue;
      dispatch(toggleSelectedYear(year));
    },
    [dispatch]
  );

  return (
    <ResponsiveBar
      data={barData.data}
      keys={barData.keys}
      onClick={handleClickBar}
      indexBy="year"
      margin={{ top: 20, right: 90, bottom: 60, left: 30 }}
      padding={0.3}
      valueScale={{ type: "linear" }}
      indexScale={{ type: "band", round: true }}
      colors={{ scheme: "set3" }}
      axisTop={null}
      axisRight={null}
      axisBottom={{
        renderTick: (tick) => {
          const year = tick.value;
          const x = tick.x;
          const y = tick.y;
          const isSelected = selectedYears.includes(year);
          const status = isSelected ? "selected" : "neutral";
          const textColor = tickTextColorMap[status];

          return (
            <g onClick={() => handleToggleYear(year)}>
              <CustomTick x={x} y={y} year={year} textColor={textColor} />;
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
  occupations,
  relatedMovies,
}) {
  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Typography sx={{ p: 1 }} component={"div"}>
          棒グラフから気になる映画の
          <Chip
            label="製作年度"
            color="warning"
            sx={{ m: 0.5, mb: 1 }}
            size="small"
          />
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
          occupations={occupations}
          relatedMovies={relatedMovies}
        />
      </Box>
    </Box>
  );
});
