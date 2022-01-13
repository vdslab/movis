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
import { memo, useCallback } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";

import { HelpPopover } from "@/components/HelpPopover";
import { Responsive } from "@/components/Responsive";
import { ZoomableSVG } from "@/components/ZoomableSvg";
import { useNetwork } from "@/hooks/network";
import {
  clearKeyword,
  selectedNodeSelectors,
  selectKeyword,
  setKeyword,
  toggleSelectedNode,
} from "@/modules/features/app/slice";

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
  x1,
  x2,
  y1,
  y2,
  strokeWidth,
  stroke,
}) {
  return (
    <g>
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        strokeWidth={strokeWidth}
        stroke={stroke}
      />
    </g>
  );
});

const NetworkLinks = memo(function NetworkLinks({
  links,
  selectedNodeIds,
  highlightedNodeIds,
}) {
  const strokeWidthMap = {
    selected: 10,
    highlighted: 5,
    normal: 1,
  };

  const strokeColorMap = {
    selected: "#FFFF00",
    highlighted: "#F06292",
    normal: "#dedede",
  };

  return (
    <g>
      {links.map((link) => {
        const key = link.source.id + link.target.id;
        const isSelected =
          selectedNodeIds.includes(link.source.id) &&
          selectedNodeIds.includes(link.target.id);

        const isHighlighted =
          highlightedNodeIds &&
          ((selectedNodeIds.includes(link.source.id) &&
            highlightedNodeIds.includes(link.target.id)) ||
            (highlightedNodeIds.includes(link.source.id) &&
              selectedNodeIds.includes(link.target.id)));

        const status = isSelected
          ? "selected"
          : isHighlighted
          ? "highlighted"
          : "normal";

        return (
          <NetworkLink
            key={key}
            x1={link.source.x}
            y1={link.source.y}
            x2={link.target.x}
            y2={link.target.y}
            strokeWidth={strokeWidthMap[status]}
            stroke={strokeColorMap[status]}
          />
        );
      })}
    </g>
  );
});

const NetworkNode = memo(function NetworkNode({
  id,
  name,
  r,
  cx,
  cy,
  fill,
  stroke,
  strokeWidth,
  onNodeClick,
  isClickable,
}) {
  return (
    <g>
      <circle
        id={id}
        name={name}
        r={r}
        cx={cx}
        cy={cy}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        onClick={() => onNodeClick({ id, name, isClickable })}
      />
    </g>
  );
});

const NetworkNodes = memo(function NetworkNodes({
  nodes,
  selectedNodeIds,
  highlightedNodeIds,
}) {
  const dispatch = useDispatch();

  const nodeColor = d3.interpolateBlues;

  const strokeWidthMap = {
    selected: 10,
    highlighted: 5,
    normal: 0,
  };

  const strokeColorMap = {
    selected: "#FFFF00",
    highlighted: "#F06292",
    normal: void 0,
  };

  const handleNodeClick = useCallback(
    ({ id, name, isClickable }) => {
      const node = { id, name };

      if (isClickable) {
        dispatch(toggleSelectedNode(node));
      }
    },
    [dispatch]
  );

  return (
    <g>
      {nodes.map((node) => {
        const isSelected = selectedNodeIds.includes(node.id);
        const isHighlighted =
          selectedNodeIds.length !== 0 && highlightedNodeIds.includes(node.id);
        const isClickable =
          selectedNodeIds.length === 0 ||
          selectedNodeIds.includes(node.id) ||
          highlightedNodeIds.includes(node.id);

        const status = isSelected
          ? "selected"
          : isHighlighted
          ? "highlighted"
          : "normal";

        return (
          <NetworkNode
            key={node.id}
            id={node.id}
            name={node.name}
            r={node.r}
            cx={node.x}
            cy={node.y}
            fill={nodeColor(node.normalizedRelatedMoviesCount)}
            stroke={strokeColorMap[status]}
            strokeWidth={strokeWidthMap[status]}
            onNodeClick={handleNodeClick}
            isClickable={isClickable}
          />
        );
      })}
    </g>
  );
});

const NetworkLabel = memo(function NetworkLabel({ name, x, y, textColor }) {
  return (
    <g>
      <text fontSize="80px" x={x} y={y} fill={textColor}>
        {name}
      </text>
    </g>
  );
});

const NetworkLabels = memo(function NetworkLabels({ nodes }) {
  const keyword = useSelector(selectKeyword);

  const labelColorMap = {
    normal: "#00C853",
    keywordIncluded: "#FFA000",
  };

  return (
    <g>
      {nodes.map((node) => {
        const isKeywordIncluded =
          keyword.length !== 0 && node.name.includes(keyword);
        const status = isKeywordIncluded ? "keywordIncluded" : "normal";

        const textColor = labelColorMap[status];

        return (
          <NetworkLabel
            key={node.id}
            name={node.name}
            x={node.x + node.r}
            y={node.y + node.r}
            textColor={textColor}
          />
        );
      })}
    </g>
  );
});

const NetworkBody = memo(function NetworkBody({
  relatedMovies,
  width,
  height,
}) {
  const { network, highlightedNodeIds } = useNetwork(
    relatedMovies,
    width,
    height
  );
  const selectedNodeIds = useSelector(selectedNodeSelectors.selectIds);

  return (
    <g>
      <NetworkLinks
        links={network.links}
        selectedNodeIds={selectedNodeIds}
        highlightedNodeIds={highlightedNodeIds}
      />

      <NetworkLabels nodes={network.nodes} />

      <NetworkNodes
        nodes={network.nodes}
        selectedNodeIds={selectedNodeIds}
        highlightedNodeIds={highlightedNodeIds}
      />
    </g>
  );
});

const ResponsiveNetwork = memo(function ResponsiveNetwork({ relatedMovies }) {
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
  relatedMovies,
}) {
  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Typography sx={{ p: 1 }} component={"div"}>
          {name}
          と共演したことのある
          <Chip
            label="出演者"
            color="error"
            sx={{ m: 0.5, mb: 1 }}
            size="small"
          />
          を選択して、映画を絞り込みましょう。
        </Typography>
        <HelpPopover
          text={`この可視化は${name}が出演者として共演したことのある人物とその回数を円として表示しています。円の大きさは${name}との共演回数、円の色はその出演者が映画に出演したことのある回数を表しています。`}
        />
      </Box>
      <Form />

      <Box sx={{ height: "50vh", border: "1px solid black" }}>
        <ResponsiveNetwork relatedMovies={relatedMovies} />
      </Box>
    </Box>
  );
});
