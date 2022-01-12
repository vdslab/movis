import { SearchOutlined, ClearOutlined } from "@mui/icons-material";
import {
  Typography,
  Box,
  Paper,
  InputBase,
  IconButton,
  Chip,
} from "@mui/material";
import * as d3 from "d3";
import { memo, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";

import { HelpPopover } from "@/components/HelpPopover";
import { Responsive } from "@/components/Responsive";
import { ZoomableSVG } from "@/components/ZoomableSvg";
import {
  clearKeyword,
  selectedNodeSelectors,
  selectKeyword,
  setKeyword,
} from "@/modules/features/app/slice";
import { filterMovieByNode } from "@/util";

const Form = memo(function Form() {
  const { register, handleSubmit, reset } = useForm();
  const dispatch = useDispatch();

  return (
    <Paper
      component="form"
      sx={{
        p: "2px 4px",
        my: 1,
        display: "flex",
        alignItems: "center",
        width: { xs: "100%", sm: "50%" },
      }}
      onSubmit={handleSubmit((formData) => {
        dispatch(setKeyword(formData.keyword));
      })}
    >
      <InputBase
        sx={{ ml: 1, flex: 1 }}
        placeholder="ネットワーク内の人物名を検索"
        {...register("keyword")}
      />
      <IconButton
        type="button"
        onClick={() => {
          reset({ keyword: "" });
          dispatch(clearKeyword());
        }}
        sx={{ p: "10px" }}
      >
        <ClearOutlined />
      </IconButton>
      <IconButton type="submit" sx={{ p: "10px" }}>
        <SearchOutlined />
      </IconButton>
    </Paper>
  );
});

const NetworkLink = memo(function NetworkLink({
  links,
  selectedNodeIds,
  highlightedNodeIds,
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
                  : highlightedNodeIds &&
                    ((selectedNodeIds.includes(link.source.id) &&
                      highlightedNodeIds.includes(link.target.id)) ||
                      (highlightedNodeIds.includes(link.source.id) &&
                        selectedNodeIds.includes(link.target.id)))
                  ? 5
                  : 1
              }
              stroke={
                selectedNodeIds.includes(link.source.id) &&
                selectedNodeIds.includes(link.target.id)
                  ? "#FFFF00"
                  : highlightedNodeIds &&
                    ((selectedNodeIds.includes(link.source.id) &&
                      highlightedNodeIds.includes(link.target.id)) ||
                      (highlightedNodeIds.includes(link.source.id) &&
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
  highlightedNodeIds,
  onNodeClick,
}) {
  const color = {
    normal: d3.interpolateBlues,
    highlight: "#F06292",
    selected: "#FFFF00",
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
                  highlightedNodeIds.includes(node.id)
                ) {
                  onNodeClick(node);
                }
              }}
              fill={color.normal(node.normalizedRelatedMoviesCount)}
              stroke={
                selectedNodeIds.includes(node.id)
                  ? color.selected
                  : selectedNodeIds.length !== 0 &&
                    highlightedNodeIds.includes(node.id)
                  ? color.highlight
                  : ""
              }
              strokeWidth={
                selectedNodeIds.includes(node.id)
                  ? 10
                  : selectedNodeIds.length !== 0 &&
                    highlightedNodeIds.includes(node.id)
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
  keyword,
  selectedNodeIds,
  highlightedNodeIds,
}) {
  return (
    <g>
      {nodes.map((node) => {
        if (
          !(
            node.name.includes(keyword) ||
            selectedNodeIds.length === 0 ||
            selectedNodeIds.includes(node.id) ||
            highlightedNodeIds.includes(node.id)
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
                keyword.length !== 0 && node.name.includes(keyword)
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

const NetworkBody = memo(function ActorNetwork({
  initialNetwork,
  handleNodeClick,
  relatedMovies,
  width,
  height,
}) {
  const selectedNodeIds = useSelector(selectedNodeSelectors.selectIds);
  const keyword = useSelector(selectKeyword);
  const [network, setNetwork] = useState({ nodes: [], links: [] });

  console.log(width, height);
  const nodeFilteredMovies = useMemo(
    () =>
      filterMovieByNode(
        relatedMovies.map((rm) => rm.movie),
        selectedNodeIds
      ),
    [relatedMovies, selectedNodeIds]
  );

  const highlightedNodeIds = useMemo(() => {
    const h = [];
    nodeFilteredMovies.forEach((movie) => {
      movie.productionMembers.forEach((pm) => {
        h.push(pm.person.id);
      });
    });

    return h;
  }, [nodeFilteredMovies]);

  useEffect(() => {
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
  }, [initialNetwork, width, height]);

  return (
    <g transform={`scale(0.1)`}>
      {/* link */}
      <NetworkLink
        links={network.links}
        selectedNodeIds={selectedNodeIds}
        highlightedNodeIds={highlightedNodeIds}
      />
      {/* label */}
      <NetworkLabel
        nodes={network.nodes}
        keyword={keyword}
        selectedNodeIds={selectedNodeIds}
        highlightedNodeIds={highlightedNodeIds}
      />
      {/* node */}
      <NetworkNode
        nodes={network.nodes}
        selectedNodeIds={selectedNodeIds}
        highlightedNodeIds={highlightedNodeIds}
        onNodeClick={handleNodeClick}
      />
    </g>
  );
});

const ResponsiveNetwork = memo(function ResponsiveNetwork({
  initialNetwork,
  handleNodeClick,
  relatedMovies,
}) {
  return (
    <Responsive
      render={(width, height) => {
        return (
          <Box
            sx={{
              width: width,
              height: height,
            }}
          >
            <ZoomableSVG
              width={width}
              height={height}
              style={{ backgroundColor: "#424242" }}
            >
              <NetworkBody
                width={width}
                height={height}
                initialNetwork={initialNetwork}
                handleNodeClick={handleNodeClick}
                relatedMovies={relatedMovies}
              />
            </ZoomableSVG>
          </Box>
        );
      }}
    />
  );
});

export const NetworkSection = memo(function NetworkSection({
  name,
  handleNodeClick,
  initialNetwork,
  relatedMovies,
}) {
  return (
    <>
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Typography sx={{ p: 1, display: "flex", alignItems: "center" }}>
          {name}
          と共演したことのある
          <Chip label="出演者" color="error" sx={{ m: 0.5 }} size="small" />
          を選択して、映画を絞り込みましょう。
        </Typography>
        <HelpPopover
          text={`この可視化は${name}が出演者として共演したことのある人物とその回数を円として表示しています。円の大きさは${name}との共演回数、円の色はその出演者が映画に出演したことのある回数を表しています。`}
        />
      </Box>

      <Form />

      <Box
        sx={{
          height: "50vh",
          border: "1px solid black",
        }}
      >
        <ResponsiveNetwork
          handleNodeClick={handleNodeClick}
          initialNetwork={initialNetwork}
          relatedMovies={relatedMovies}
        />
      </Box>
    </>
  );
});
