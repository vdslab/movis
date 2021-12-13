import { css } from "@emotion/react";
import * as d3 from "d3";
import { useEffect } from "react";

import { ZoomableSVG } from "@/components/ZoomableSvg";

export const ActorNetwork = (props) => {
  const {
    width,
    height,
    network,
    selectedNodeIds,
    handleNodeClick,
    movies,
    search,
  } = props;

  const nodeColor = {
    normal: d3.interpolateGreens,
    highlight: d3.interpolateBlues,
    selected: d3.interpolateOranges,
  };

  const movie2personIds = {};
  movies.forEach((movie) => {
    const pmIdSet = new Set();
    movie.productionMembers.forEach((pm) => {
      pmIdSet.add(pm.person.id);
    });
    movie2personIds[movie.id] = Array.from(pmIdSet);
  });

  const person2movieIds = {};
  movies.forEach((movie) => {
    movie.productionMembers.forEach((pm) => {
      if (pm.person.id in person2movieIds) {
        person2movieIds[pm.person.id].push(movie.id);
      } else {
        person2movieIds[pm.person.id] = [movie.id];
      }
    });
  });

  // ハイライト　各選択ノードについて、リンクが貼られている相手の集合を作り、全集合の'かつ'をとる。
  let highlitedNodeIds = void 0;
  selectedNodeIds.forEach((selectedNodeId) => {
    const relatedPeople = [];
    person2movieIds[selectedNodeId].forEach((movieId) => {
      relatedPeople.push(...movie2personIds[movieId]);
    });
    highlitedNodeIds = highlitedNodeIds
      ? highlitedNodeIds.filter((idA) => relatedPeople.includes(idA))
      : relatedPeople;
  });

  useEffect(() => {
    const firstSimulation = async ({ nodes, links }) => {
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
          // d3.forceManyBody().strength((d) => (d.r / 2) * -50)
          d3.forceManyBody().strength((d) => (d.r / 2) * -500)
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

      simulation.nodes(nodes);
      simulation.force("link").links(links);
      simulation.tick(500).stop();
    };

    firstSimulation(network);
  }, [width, height, network]);

  return (
    <ZoomableSVG width={width} height={height}>
      <g>
        {/* link */}
        <g>
          {network.links.map((link, index) => {
            return (
              <g key={index}>
                <line
                  x1={link.source.x}
                  y1={link.source.y}
                  x2={link.target.x}
                  y2={link.target.y}
                  strokeWidth={1}
                  stroke={
                    selectedNodeIds.includes(link.source.id) &&
                    selectedNodeIds.includes(link.target.id)
                      ? "black"
                      : highlitedNodeIds &&
                        ((selectedNodeIds.includes(link.source.id) &&
                          highlitedNodeIds.includes(link.target.id)) ||
                          (highlitedNodeIds.includes(link.source.id) &&
                            selectedNodeIds.includes(link.target.id)))
                      ? "pink"
                      : "gray"
                  }
                />
              </g>
            );
          })}
        </g>
        {/* node */}
        <g>
          {network.nodes.map((node) => {
            return (
              <g key={node.id}>
                <circle
                  r={node.r}
                  cx={node.x}
                  cy={node.y}
                  onClick={() => handleNodeClick(node.id)}
                  fill={
                    selectedNodeIds.includes(node.id)
                      ? nodeColor.selected(node.normalizedCount)
                      : selectedNodeIds.length !== 0 &&
                        highlitedNodeIds.includes(node.id)
                      ? nodeColor.highlight(node.normalizedCount)
                      : nodeColor.normal(node.normalizedCount)
                  }
                  css={NodeStroke}
                />
                <text
                  x={node.x}
                  y={node.y}
                  fill={node.name.includes(search) ? "black" : "gray"}
                >
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

const NodeStroke = css`
  stroke: #546e7a;
  strokewidth: 1px;
`;
