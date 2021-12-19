import { Box } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useState } from "react";

import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";

const ContentRoot = styled(Box)(({ theme }) => ({
  display: "flex",
  flex: "1 1 auto",
  maxWidth: "100%",
  paddingTop: 64,
  [theme.breakpoints.up("lg")]: {
    paddingLeft: 300,
  },
}));

export const Layout = ({ children }) => {
  const [drawerOpened, setDrawerOpened] = useState(false);
  const handleDrawerToggle = () => {
    setDrawerOpened((prev) => !prev);
  };

  return (
    <>
      <Navbar drawerToggle={handleDrawerToggle} />
      <Sidebar drawerOpen={drawerOpened} drawerToggle={handleDrawerToggle} />
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
