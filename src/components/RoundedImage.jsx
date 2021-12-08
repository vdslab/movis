import { Box } from "@mui/system";

export const RoundedImage = ({ src, alt, r = "5%", ...rest }) => {
  return (
    <Box
      component="img"
      src={src}
      alt={alt}
      {...rest}
      sx={{ borderRadius: r }}
    />
  );
};
