import * as d3 from "d3";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";

import { selectedNodeSelectors } from "@/modules/features/app/slice";
import { filterMovieByNode, generateNetworkData } from "@/util";

export const useNetwork = (relatedMovies, width, height) => {
  const selectedNodeIds = useSelector(selectedNodeSelectors.selectIds);
  const [network, setNetwork] = useState({ nodes: [], links: [] });

  const initialNetwork = useMemo(() => {
    return generateNetworkData(relatedMovies);
  }, [relatedMovies]);

  const highlightedNodeIds = useMemo(() => {
    const nodeFilteredMovies = filterMovieByNode(
      relatedMovies.map((rm) => rm.movie),
      selectedNodeIds
    );

    const ids = [];
    nodeFilteredMovies.forEach((movie) => {
      movie.productionMembers.forEach((pm) => {
        ids.push(pm.person.id);
      });
    });

    return ids;
  }, [relatedMovies, selectedNodeIds]);

  useEffect(() => {
    if (network.nodes.length > 0 || network.links.length > 0) {
      return;
    }

    const d3simulation = d3
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

    const copiedNetwork = JSON.parse(JSON.stringify(initialNetwork));
    d3simulation.nodes(copiedNetwork.nodes);
    d3simulation.force("link").links(copiedNetwork.links);
    d3simulation.tick(500).stop();

    setNetwork(copiedNetwork);
  }, [network.nodes, network.links, initialNetwork]);

  return { network, highlightedNodeIds };
};
