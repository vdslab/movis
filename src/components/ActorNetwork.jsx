import * as d3 from "d3";
import { useEffect } from "react";

import { ZoomableSVG } from "@/components/ZoomableSvg";

export const ActorNetwork = (props) => {
  console.log(props);
  const { width, height, data } = props;
  const color = {
    normal: d3.interpolateGreens,
  };

  useEffect(() => {
    const firstSimulation = async (network) => {
      const simulation = d3
        .forceSimulation()
        .force(
          "collide",
          d3
            .forceCollide()
            .radius((d) => d.r)
            .iterations(10)
        )
        .force(
          "link",
          d3
            .forceLink()
            .distance((d) => 10)
            .id((d) => d.id)
        )
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force(
          "charge",
          d3.forceManyBody().strength((d) => (d.r / 2) * -50)
        )
        .force(
          "x",
          d3
            .forceX()
            .x(width / 2)
            .strength(0.05)
        )
        .force(
          "y",
          d3
            .forceY()
            .y(height / 2)
            .strength(0.07)
        );

      simulation.nodes(network.nodes);
      simulation.force("link").links(network.links);
      simulation.tick(500).stop();
    };

    firstSimulation(data.network);
  }, [width, height, data.network]);

  // // ゴミ処理、最初の描画の際にkeyが渡せてないよエラーが出るので黙らせた
  // if (width === 0 || height === 0) {
  //   return null;
  // }

  return (
    <ZoomableSVG width={width} height={height}>
      <g>
        {/* link */}
        <g>
          {data.network.links.map((link, index) => {
            // console.log(link.index);
            return (
              <g key={index}>
                <line
                  x1={link.source.x}
                  y1={link.source.y}
                  x2={link.target.x}
                  y2={link.target.y}
                  strokeWidth={1}
                  stroke="gray"
                />
              </g>
            );
          })}
        </g>
        {/* node */}
        <g>
          {data.network.nodes.map((node) => {
            return (
              <g key={node.id}>
                <circle
                  r={node.r}
                  cx={node.x}
                  cy={node.y}
                  fill={color.normal(node.normalizedCount)}
                />
                <text x={node.x} y={node.y} fill="black">
                  {node.name}
                </text>
              </g>
            );
          })}
        </g>
      </g>
    </ZoomableSVG>
  );
};
