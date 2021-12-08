/* eslint-disable */
import { useEffect, useState, useRef } from "react";
import * as d3 from "d3";
import prisma from "@/lib/prisma";
// クラスタに分かれるようなパラメータに設定

function ZoomableSVG({ width, height, children }) {
  const svgRef = useRef();
  const [k, setK] = useState(1);
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  useEffect(() => {
    const zoom = d3.zoom().on("zoom", (event) => {
      const { x, y, k } = event.transform;
      setK(k);
      setX(x);
      setY(y);
    });
    d3.select(svgRef.current).call(zoom);
  }, []);
  return (
    <svg
      ref={svgRef}
      className="graph"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
    >
      <g transform={`translate(${x},${y})scale(${k})`}>{children}</g>
    </svg>
  );
}

const NetworkActor = (props) => {
  const data = props.data[0][0];
  const actorId = data.id;
  const nodeIds = [];
  const node = [];

  data.relatedMovies.forEach((movieData) => {
    movieData.movie.productionMembers.forEach((actor) => {
      if (
        !nodeIds.includes(actor.person.id) &&
        actor.person.id !== actorId &&
        actor.occupation.name === "出演者"
      ) {
        nodeIds.push(actor.person.id);
        node.push({ id: actor.person.id, name: actor.person.name });
      }
    });
  });

  const compare = (a, b) => a.personId.localeCompare(b.personId);
  node.sort((a, b) => a.id.localeCompare(b.id));

  const sourceTarget = {};
  const count = {};
  data.relatedMovies.forEach((movieData) => {
    movieData.movie.productionMembers.forEach((source) => {
      if (
        !(source.person.id in sourceTarget) &&
        source.occupation.name === "出演者"
      ) {
        sourceTarget[source.person.id] = {};
        count[source.person.id] = 0;
      }
    });
  });

  data.relatedMovies.forEach((movieData) => {
    const sortedActors = Array.from(movieData.movie.productionMembers)
      .sort(compare)
      .filter((actor) => actor.person.id !== actorId);
    sortedActors.forEach((source, index) => {
      if (source.occupation.name === "出演者") {
        ++count[source.person.id];
        sortedActors.slice(index + 1).forEach((target) => {
          if (target.occupation.name === "出演者") {
            sourceTarget[source.person.id][target.person.id] =
              (sourceTarget[source.person.id][target.person.id] || 0) + 1;
          }
        });
      }
    });
  });
  const link = [];
  for (const source in sourceTarget) {
    for (const target in sourceTarget[source]) {
      link.push({ source, target, weight: sourceTarget[source][target] });
    }
  }

  const initialNetwork = { node, link };
  const width = "800"; //ここの値適当です
  const height = "800";
  const [selected, setSelected] = useState([]);
  const handleSelect = (node) => {
    const nodeId = node.id;
    setSelected((prev) => {
      const index = prev.indexOf(nodeId);
      const selectedNodeIds = [...prev];
      if (index < 0) {
        selectedNodeIds.push(nodeId);
      } else {
        selectedNodeIds.splice(index, 1);
      }
      return selectedNodeIds;
    });
  };

  const [nodes, setNodes] = useState([]);
  const [links, setLinks] = useState([]);
  const [highlightnode, sethighlightNode] = useState({});
  const [highlightlist, sethighlightList] = useState([]);
  const [input, setInput] = useState("");
  const handleChange = (e) => {
    setInput(e.target.value);
  };

  const borderWeight = 1;
  const svgSize = Math.min(width, height) - borderWeight * 2;

  const max = Math.max(...Object.keys(count).map((key) => count[key]));
  const min = 1;
  const normalNodeColor = d3.interpolateGreens;
  const highlightNodeColor = d3.interpolateBlues;
  const selectedNodeColor = d3.interpolateOranges;

  useEffect(() => {
    const firstSimuration = (nodes, links) => {
      //ここ参照https://wizardace.com/d3-forcesimulation-onlynode/
      const simulation = d3
        .forceSimulation() //ここで引力とかの設定を行う
        .force(
          "collide",
          d3
            .forceCollide()
            .radius(function (d) {
              return d.r;
            })
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
        // .force("center", d3.forceCenter(svgSize / 2, svgSize / 2))
        .force(
          "charge",
          d3.forceManyBody().strength((d) => (d.r / 2) * -50)
        ) //縮小していいかどうか全体を描画してから縮小一番上のノードと一番下のノードの高さ（横も叱り）の絶対値から全体の描画の大きさがわかる
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
      setNodes(nodes.slice());
      setLinks(links.slice());
    };
    const startLineChart = async () => {
      const [nodes, links] = await (async () => {
        const data = initialNetwork;
        const nodes = Array();
        const links = Array();
        let highlightnodes = {};
        for (const item of data.node) {
          highlightnodes[`${item.id}`] = [];
        }

        for (const item of data.link) {
          highlightnodes[`${item.source}`].push(item.target);
          highlightnodes[`${item.target}`].push(item.source);
        }
        sethighlightNode(highlightnodes);

        const r = 10;

        for (const item of data.node) {
          const normalizedCount =
            max > 1 ? (count[item.id] - min) / (max - min) : 0.5;
          nodes.push({
            id: item.id,
            name: item.name,
            r: (normalizedCount + 0.2) * 20,
          });
        }
        for (const item of data.link) {
          links.push({
            source: item.source,
            target: item.target,
            weight: item.weight,
            r,
          });
        }
        return [nodes, links];
      })();
      firstSimuration(nodes, links);
    };

    startLineChart();
  }, []);
  useEffect(() => {
    const highlightlist_ = Array();
    if (selected.length !== 0) {
      nodes.map((node, i) => {
        if (
          selected.every((select, i) => {
            return highlightnode[`${select}`].includes(node.id);
          })
        ) {
          highlightlist_.push(node.id);
        }
      });
    }
    links.map((link, i) => {
      const sourceId = link.source.id;
      const targetId = link.target.id;
      if (
        selected.includes(link.target.id) &&
        selected.includes(link.source.id)
      ) {
        link.highlight = "#E64A19";
      } else if (
        (selected.includes(link.target.id) ||
          selected.includes(link.source.id)) &&
        (highlightlist_.includes(link.target.id) ||
          highlightlist_.includes(link.source.id))
      ) {
        link.highlight = "#9C27B0";
      } else {
        link.highlight =
          count[sourceId] > 1 || count[targetId] > 1 ? "#CFD8DC" : null;
      }
    });
    sethighlightList(highlightlist_.slice());
  }, [selected, nodes, links]);
  return (
    <div
      style={{
        border: `${borderWeight}px solid #FCE08A`,
        // width: Math.min(width, height),
        // height: Math.min(width, height),
        width,
        height,
      }}
    >
      <input
        name="name"
        className="input"
        type="text"
        value={input}
        placeholder="俳優を検索"
        onChange={(e) => handleChange(e)}
      />
      <ZoomableSVG width={width} height={height}>
        <g>
          <g>
            {links.map((link, i) => {
              const target = link.target.id;
              const source = link.source.id;

              return (
                <g key={i}>
                  <line
                    x1={link.target.x}
                    y1={link.target.y}
                    x2={link.source.x}
                    y2={link.source.y}
                    strokeWidth="1"
                    stroke={link.highlight}
                  />
                </g>
              );
            })}
          </g>
          <g>
            {nodes.map((node, i) => {
              const normalizedCount =
                max > 1 ? (count[node.id] - min) / (max - min) : 0.5;
              return (
                <g key={i} onClick={() => handleSelect(node)}>
                  <circle
                    r={node.r}
                    cx={node.x}
                    cy={node.y}
                    fill={
                      selected.includes(node.id)
                        ? "#FFB300" //selectedNodeColor(normalizedCount)
                        : selected.length === 0
                        ? normalNodeColor(normalizedCount)
                        : selected.every((select, i) => {
                            return highlightnode[`${select}`].includes(node.id);
                          })
                        ? highlightNodeColor(normalizedCount)
                        : normalNodeColor(normalizedCount)
                    }
                    style={{ stroke: "#546E7A", strokeWidth: "1px" }}
                    // highlightnode.includes(node.id) ? "black" : "silver"
                  />

                  <text
                    className="kanekyo"
                    x={node.x + node.r + 2}
                    y={node.y + 6}
                    fill={
                      input === ""
                        ? "black"
                        : node.name.includes(input)
                        ? "black"
                        : "gray"
                    }
                  >
                    {node.name}
                  </text>
                </g>
              );
            })}
          </g>
        </g>
      </ZoomableSVG>
    </div>
  );
};

export default NetworkActor;

export const getServerSideProps = async () => {
  const data = [
    await prisma.person.findMany({
      where: {
        name: "有村架純",
      },
      include: {
        relatedMovies: {
          include: {
            movie: {
              include: {
                productionMembers: {
                  include: {
                    person: true,
                    occupation: true,
                  },
                },
              },
            },
            occupation: true,
          },
          where: {
            occupation: {
              is: {
                name: "出演者",
              },
            },
          },
        },
      },
    }),
  ];

  return {
    props: {
      data: JSON.parse(JSON.stringify(data)),
    },
  };
};
