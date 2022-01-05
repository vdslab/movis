import { Box } from "@mui/material";
import { ResponsiveCirclePacking } from "@nivo/circle-packing";
import * as d3 from "d3";
import { useEffect, useState } from "react";

import { COUNTRY_MAP } from "@/hello";

export const TopVis = function TopVis({ countries }) {
  const [mapData, setMapData] = useState([]);

  // ゴミ処理　書き直し前提
  const [selectedCountryId, setSelectedCountryId] = useState(null);
  const [genreData, setGenreData] = useState(null);

  const svgWidth = 800;
  const svgHeight = 800;

  const projection = d3
    .geoMercator()
    .center([0, 0])
    .translate([svgWidth / 2, svgHeight / 2]);
  const pathGenerator = d3.geoPath().projection(projection);

  const countriesMap = {};
  countries.forEach((country) => {
    countriesMap[country.name] = country;
  });
  const countMax = Math.max(
    ...countries.map((country) => country._count.movie)
  );

  // const color = d3.scaleLinear().domain([0, countMax])
  const color = d3.interpolateOranges;

  useEffect(() => {
    (async () => {
      const res = await fetch("/data/countries.geo.json");
      const data = await res.json();

      const { features } = data;

      // console.log(COUNTRY_MAP);
      data.features.forEach((item) => {
        // console.log(item.id);
        item.properties["name_ja"] = COUNTRY_MAP[item.id];
      });

      // let i = 0;
      // data.features.forEach((item) => {
      //   if (!item.properties["name_ja"]) {
      //     console.log(item);
      //     ++i;
      //   }
      // });
      // console.log(i);

      setMapData(features);
    })();
  }, []);

  // console.log(genreData);

  useEffect(() => {
    if (!selectedCountryId) {
      return;
    }
    (async () => {
      const res = await fetch(`/api/top/genre?countryId=${selectedCountryId}`);
      const data = await res.json();

      const { g } = data;

      const d = {
        name: "movis",
        children: g,
      };

      setGenreData(d);
    })();
  }, [selectedCountryId]);

  // console.log(mapData);
  // console.log(selectedCountryId);

  return (
    <>
      <svg
        width={svgWidth}
        height={svgHeight - 200}
        style={{ backgroundColor: "#fff" }}
      >
        <g>
          {mapData.map((feature, id) => {
            const jName = feature.properties.name_ja;
            const c = countriesMap[jName];
            const count = c?._count.movie;
            const normalizedCount = count / countMax;
            if (feature.id === "BMU") {
              return null;
            }
            return (
              <g
                key={id}
                onClick={() => {
                  if (c) {
                    setSelectedCountryId(c.id);
                  }
                  console.log(normalizedCount);
                }}
              >
                <path
                  d={pathGenerator(feature)}
                  // fill="#dedede"
                  fill={color(normalizedCount)}
                  stroke={c?.id === selectedCountryId ? "red" : "black"}
                  strokeDasharray="3"
                  cursor="pointer"
                />
              </g>
            );
          })}
        </g>
      </svg>
      {genreData && (
        <Box sx={{ height: 800 }}>
          <ResponsiveCirclePacking
            data={genreData}
            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
            id="name"
            value="movieCount"
            colors={{ scheme: "nivo" }}
            childColor={{ from: "color", modifiers: [["brighter", 0.4]] }}
            padding={4}
            enableLabels={true}
            labelTextColor={{ from: "color", modifiers: [["darker", 2]] }}
            borderWidth={1}
            borderColor={{ from: "color", modifiers: [["darker", 0.5]] }}
            defs={[
              {
                id: "lines",
                type: "patternLines",
                background: "none",
                color: "inherit",
                rotation: -45,
                lineWidth: 5,
                spacing: 8,
              },
            ]}
          />
        </Box>
      )}
    </>
  );
};
