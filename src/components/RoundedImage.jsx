import { Box } from "@mui/system";
import { memo } from "react";

export const RoundedImage = memo(function RoundedImage({
  src,
  alt,
  r = "5%",
  ...rest
}) {
  return (
    <Box
      component="img"
      src={src}
      alt={alt}
      {...rest}
      sx={{ borderRadius: r }}
    />
  );
});
