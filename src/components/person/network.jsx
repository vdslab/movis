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
        width: { xs: "100%", sm: "60%" },
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
    selected: 40,
    highlighted: 20,
    neutral: 4,
  };

  const strokeColorMap = {
    selected: "#ffff00",
    highlighted: "#f06292",
    // neutral: "#fff",
    neutral: "#959593",
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
          : "neutral";

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
    selected: 40,
    highlighted: 40,
    neutral: 10,
  };

  const strokeColorMap = {
    selected: "#ffff00",
    highlighted: "#f06292",
    neutral: "#fff",
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
          : "neutral";

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

const NetworkLabel = memo(function NetworkLabel({
  name,
  x,
  y,
  textColor,
  isKeywordIncluded,
}) {
  return (
    <g>
      <text
        fontSize={isKeywordIncluded ? "800px" : "100px"}
        x={x}
        y={y}
        fill={textColor}
      >
        {name}
      </text>
    </g>
  );
});

const NetworkLabels = memo(function NetworkLabels({
  nodes,
  selectedNodeIds,
  highlightedNodeIds,
}) {
  const keyword = useSelector(selectKeyword);

  const labelColorMap = {
    neutral: "#a7ff83",
    keywordIncluded: "#ffa000",
    selected: "#ffff00",
    highlighted: "#f06292",
    inconspicuous: "#bdbdbd",
  };

  return (
    <g>
      {nodes.map((node) => {
        const isSelectedOneNode = selectedNodeIds.length > 0;
        const isSelected = selectedNodeIds.includes(node.id);
        const isHighlighted =
          selectedNodeIds.length !== 0 && highlightedNodeIds.includes(node.id);
        const isKeywordIncluded =
          keyword.length !== 0 && node.name.includes(keyword);
        const status = isKeywordIncluded
          ? "keywordIncluded"
          : isSelected
          ? "selected"
          : isHighlighted
          ? "highlighted"
          : isSelectedOneNode
          ? "inconspicuous"
          : "neutral";

        const textColor = labelColorMap[status];

        return (
          <NetworkLabel
            key={node.id}
            name={node.name}
            x={node.x + node.r}
            y={node.y + node.r}
            textColor={textColor}
            isKeywordIncluded={isKeywordIncluded}
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
    <g transform="scale(0.1)">
      <NetworkLinks
        links={network.links}
        selectedNodeIds={selectedNodeIds}
        highlightedNodeIds={highlightedNodeIds}
      />

      <NetworkLabels
        nodes={network.nodes}
        selectedNodeIds={selectedNodeIds}
        highlightedNodeIds={highlightedNodeIds}
      />

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
              style={{ backgroundColor: "#3d5952" }}
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
  const hint = `この可視化は${name}と映画製作に携わった人物を円として表示しています。

円の大きさは${name}と一緒に製作に携わった回数、円の内部の色はその人物が今までに製作に携わってきた回数を表しています。

また、${name}を含む人物同士で一緒に製作に携わったことがある場合に線が引かれています。

円を選択して${name}が製作に携わった映画から、選択した人物全員が一緒に製作に携わった映画を絞り込みましょう。

円を選択すると、選択された円は黄色に、選択された円と${name}と一緒に製作に携わったことがある人物の円はピンク色になります。
同様に線にも色がつきます。

円を1つ以上選択した後はピンク色の円のみを選択できます。`;

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Typography sx={{ p: 1 }} component={"div"}>
          {name}
          と関係のある
          <Chip
            label="人物"
            color="error"
            sx={{ m: 0.5, mb: 1 }}
            size="small"
          />
          を選択して、映画を絞り込みましょう。
        </Typography>
        <HelpPopover text={hint} />
      </Box>
      <Form />

      <Box sx={{ height: "50vh", border: "1px solid black" }}>
        <ResponsiveNetwork relatedMovies={relatedMovies} />
      </Box>
    </Box>
  );
});
