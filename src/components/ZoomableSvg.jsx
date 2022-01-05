import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";

export const ZoomableSVG = ({ width, height, children, ...svgRest }) => {
  const svgRef = useRef();
  const [k, setK] = useState(1);
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);

  useEffect(() => {
    const zoom = d3.zoom().on("zoom", (event) => {
      const { x: newX, y: newY, k: newK } = event.transform;
      setX(newX);
      setY(newY);
      setK(newK);
    });
    d3.select(svgRef.current).call(zoom);
  }, []);

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      {...svgRest}
    >
      <g transform={`translate(${x},${y})scale(${k})`}>{children}</g>
    </svg>
  );
};
