import { Box } from "@mui/material";
import { styled } from "@mui/material/styles";

import { Navbar } from "@/components/Navbar";

const ContentRoot = styled(Box)(({ theme }) => ({
  display: "flex",
  flex: "1 1 auto",
  maxWidth: "100%",
  paddingTop: 64,
  [theme.breakpoints.up("lg")]: {
    paddingLeft: 280,
  },
}));

export const Layout = ({ children }) => {
  return (
    <>
      <Navbar />
      <ContentRoot>
        <Box
          sx={{
            display: "flex",
            flex: "1 1 auto",
            flexDirection: "column",
            width: "100%",
          }}
          maxWidth="xl"
        >
          {children}
        </Box>
      </ContentRoot>
    </>
  );
};
