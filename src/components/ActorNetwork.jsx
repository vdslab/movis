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
import { filterMovieByNode } from "@/util";

const NetworkBody = memo(function networkBody({
  network,
  selectedNodeIds,
  highlitedNodeIds,
  search,
  onNodeClick,
}) {
  return (
    <g>
      {/* link */}
      <NetworkLink
        links={network.links}
        selectedNodeIds={selectedNodeIds}
        highlitedNodeIds={highlitedNodeIds}
      />
      {/* label */}
      <NetworkLabel
        nodes={network.nodes}
        search={search}
        selectedNodeIds={selectedNodeIds}
        highlitedNodeIds={highlitedNodeIds}
      />
      {/* node */}
      <NetworkNode
        nodes={network.nodes}
        selectedNodeIds={selectedNodeIds}
        highlitedNodeIds={highlitedNodeIds}
        onNodeClick={onNodeClick}
      />
    </g>
  );
});

const NetworkLink = memo(function NetworkLink({
  links,
  selectedNodeIds,
  highlitedNodeIds,
}) {
  return (
    <g>
      {links.map((link, index) => {
        return (
          <g key={index}>
            <line
              x1={link.source.x}
              y1={link.source.y}
              x2={link.target.x}
              y2={link.target.y}
              strokeWidth={
                selectedNodeIds.includes(link.source.id) &&
                selectedNodeIds.includes(link.target.id)
                  ? 10
                  : highlitedNodeIds &&
                    ((selectedNodeIds.includes(link.source.id) &&
                      highlitedNodeIds.includes(link.target.id)) ||
                      (highlitedNodeIds.includes(link.source.id) &&
                        selectedNodeIds.includes(link.target.id)))
                  ? 5
                  : 1
              }
              stroke={
                selectedNodeIds.includes(link.source.id) &&
                selectedNodeIds.includes(link.target.id)
                  ? "#FFFF00"
                  : highlitedNodeIds &&
                    ((selectedNodeIds.includes(link.source.id) &&
                      highlitedNodeIds.includes(link.target.id)) ||
                      (highlitedNodeIds.includes(link.source.id) &&
                        selectedNodeIds.includes(link.target.id)))
                  ? "#F06292"
                  : "#dedede"
              }
            />
          </g>
        );
      })}
    </g>
  );
});

const NetworkNode = memo(function NetworkNode({
  nodes,
  selectedNodeIds,
  highlitedNodeIds,
  onNodeClick,
}) {
  const nodeColor = {
    normal: d3.interpolateBlues,
    highlight: d3.interpolateGreens,
    selected: d3.interpolateOranges,
  };

  return (
    <g>
      {nodes.map((node) => {
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
                // selectedNodeIds.includes(node.id)
                //   ? nodeColor.selected(node.normalizedCount)
                //   : selectedNodeIds.length !== 0 &&
                //     highlitedNodeIds.includes(node.id)
                //   ? nodeColor.highlight(node.normalizedCount)
                //   : nodeColor.normal(node.normalizedCount)
                nodeColor.normal(node.normalizedRelatedMoviesCount)
              }
              stroke={
                selectedNodeIds.includes(node.id)
                  ? "#FFFF00"
                  : selectedNodeIds.length !== 0 &&
                    highlitedNodeIds.includes(node.id)
                  ? "#F06292"
                  : ""
              }
              strokeWidth={
                selectedNodeIds.includes(node.id)
                  ? 10
                  : selectedNodeIds.length !== 0 &&
                    highlitedNodeIds.includes(node.id)
                  ? 5
                  : 0
              }
            />
          </g>
        );
      })}
    </g>
  );
});

const NetworkLabel = memo(function NetworkLabel({
  nodes,
  search,
  selectedNodeIds,
  highlitedNodeIds,
}) {
  return (
    <g>
      {nodes.map((node) => {
        if (
          !(
            node.name.includes(search) ||
            selectedNodeIds.length === 0 ||
            selectedNodeIds.includes(node.id) ||
            highlitedNodeIds.includes(node.id)
          )
        ) {
          return null;
        }
        return (
          <g key={node.id}>
            <text
              fontSize={"80px"}
              x={node.x + node.r}
              y={node.y + node.r}
              fill={
                search.length !== 0 && node.name.includes(search)
                  ? "#FFA000"
                  : "#00C853"
              }
            >
              {node.name}
            </text>
          </g>
        );
      })}
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

  // const movie2person = useMemo(() => {
  //   const m2p = {};
  //   movies.forEach((movie) => {
  //     const pmIdSet = new Set();
  //     movie.productionMembers.forEach((pm) => {
  //       pmIdSet.add(pm.person.id);
  //     });
  //     m2p[movie.id] = Array.from(pmIdSet);
  //   });
  //   return m2p;
  // }, [movies]);

  // const person2movie = useMemo(() => {
  //   const p2m = {};
  //   movies.forEach((movie) => {
  //     movie.productionMembers.forEach((pm) => {
  //       if (pm.person.id in p2m) {
  //         p2m[pm.person.id].push(movie.id);
  //       } else {
  //         p2m[pm.person.id] = [movie.id];
  //       }
  //     });
  //   });
  //   return p2m;
  // }, [movies]);

  // const highlitedNodeIds = useMemo(() => {
  //   // ハイライト　各選択ノードについて、リンクが貼られている相手の集合を作り、全集合の'かつ'をとる。
  //   let hni = [];
  //   selectedNodeIds.forEach((selectedNodeId) => {
  //     const relatedPeople = [];
  //     person2movie[selectedNodeId].forEach((movieId) => {
  //       relatedPeople.push(...movie2person[movieId]);
  //     });
  //     hni =
  //       hni.length === 0
  //         ? relatedPeople
  //         : hni.filter((id) => relatedPeople.includes(id));
  //   });
  //   return hni;
  // }, [movie2person, person2movie, selectedNodeIds]);

  const highlitedNodeIds = useMemo(() => {
    const nodeFilteredMovieIds = filterMovieByNode(movies, selectedNodeIds);
    const filteredMovies = movies.filter((movie) => {
      return nodeFilteredMovieIds.includes(movie.id);
    });
    const h = [];
    filteredMovies.forEach((movie) => {
      movie.productionMembers.forEach((pm) => {
        h.push(pm.person.id);
      });
    });

    return h;
  }, [movies, selectedNodeIds]);

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
            .distance(10)
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
    <ZoomableSVG
      width={width}
      height={height}
      style={{ backgroundColor: "#424242" }}
    >
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
