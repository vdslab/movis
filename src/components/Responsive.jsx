import { Box } from "@mui/material";
import { memo, useEffect, useRef, useState } from "react";

export const Responsive = memo(function Responsive({ render }) {
  const wrapperRef = useRef();
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

  const handleResize = () => {
    setWidth(wrapperRef.current.clientWidth);
    setHeight(wrapperRef.current.clientHeight);
  };

  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <Box sx={{ width: "100%", height: "100%" }} ref={wrapperRef}>
      {render(width, height)}
    </Box>
  );
});
