import { Box } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useCallback } from "react";
import { useDispatch } from "react-redux";

import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { toggleDrawerOpen } from "@/modules/features/app/appSlice";

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
  const dispatch = useDispatch();

  const drawerToggle = useCallback(() => {
    dispatch(toggleDrawerOpen());
  }, [dispatch]);

  return (
    <>
      <Navbar drawerToggle={drawerToggle} />
      <Sidebar drawerToggle={drawerToggle} />
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
