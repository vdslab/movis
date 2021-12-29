import { css } from "@emotion/react";
import * as d3 from "d3";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { ZoomableSVG } from "@/components/ZoomableSvg";
import {
  selectLinks,
  selectNodes,
  selectSearch,
  selectSelectedNodes,
  toggleSelectedNode,
} from "@/modules/features/network/networkSlice";
import { selectPersonMovies } from "@/modules/features/person/personSlice";

const NetworkBody = memo(function networkBody({
  network,
  selectedNodeIds,
  highlitedNodeIds,
  search,
  onNodeClick,
}) {
  const nodeColor = {
    normal: d3.interpolateGreens,
    highlight: d3.interpolateBlues,
    selected: d3.interpolateOranges,
  };

  return (
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
                onClick={() => {
                  if (
                    selectedNodeIds.length === 0 ||
                    selectedNodeIds.includes(node.id) ||
                    highlitedNodeIds.includes(node.id)
                  ) {
                    onNodeClick(node.id);
                  }
                }}
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
  );
});

export const ActorNetwork = ({ width, height }) => {
  const dispatch = useDispatch();
  const movies = useSelector(selectPersonMovies.selectAll);
  const nodes = useSelector(selectNodes.selectAll);
  const links = useSelector(selectLinks.selectAll);
  const selectedNodes = useSelector(selectSelectedNodes.selectAll);
  const search = useSelector((state) => selectSearch(state));

  const [network, setNetwork] = useState({ nodes: [], links: [] });

  const selectedNodeIds = useMemo(
    () => selectedNodes.map((selectedNode) => selectedNode.id),
    [selectedNodes]
  );

  const movie2person = useMemo(() => {
    const m2p = {};
    movies.forEach((movie) => {
      const pmIdSet = new Set();
      movie.productionMembers.forEach((pm) => {
        pmIdSet.add(pm.person.id);
      });
      m2p[movie.id] = Array.from(pmIdSet);
    });
    return m2p;
  }, [movies]);

  const person2movie = useMemo(() => {
    const p2m = {};
    movies.forEach((movie) => {
      movie.productionMembers.forEach((pm) => {
        if (pm.person.id in p2m) {
          p2m[pm.person.id].push(movie.id);
        } else {
          p2m[pm.person.id] = [movie.id];
        }
      });
    });
    return p2m;
  }, [movies]);

  const highlitedNodeIds = useMemo(() => {
    // ハイライト　各選択ノードについて、リンクが貼られている相手の集合を作り、全集合の'かつ'をとる。
    let hni = [];
    selectedNodeIds.forEach((selectedNodeId) => {
      const relatedPeople = [];
      person2movie[selectedNodeId].forEach((movieId) => {
        relatedPeople.push(...movie2person[movieId]);
      });
      hni =
        hni.length === 0
          ? relatedPeople
          : hni.filter((id) => relatedPeople.includes(id));
    });
    return hni;
  }, [movie2person, person2movie, selectedNodeIds]);

  const handleNodeClick = useCallback(
    (nodeId) => {
      dispatch(toggleSelectedNode(nodeId));
    },
    [dispatch]
  );

  useEffect(() => {
    const firstSimulation = (initialNetwork) => {
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
      simulation.nodes(initialNetwork.nodes);
      simulation.force("link").links(initialNetwork.links);
      simulation.tick(500).stop();
      setNetwork(initialNetwork);
    };

    // ゴミ処理
    firstSimulation(JSON.parse(JSON.stringify({ nodes, links })));
  }, [width, height, nodes, links]);

  return (
    <ZoomableSVG width={width} height={height}>
      <NetworkBody
        network={network}
        selectedNodeIds={selectedNodeIds}
        highlitedNodeIds={highlitedNodeIds}
        search={search}
        onNodeClick={handleNodeClick}
      />
    </ZoomableSVG>
  );
};

const NodeStroke = css`
  stroke: #546e7a;
  strokewidth: 1px;
`;
