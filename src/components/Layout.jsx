import { Box } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useRouter } from "next/router";
import { useCallback, useEffect } from "react";
import { useDispatch } from "react-redux";

import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { toggleDrawerOpen } from "@/modules/features/app/appSlice";
import { resetGenres } from "@/modules/features/genres/genresSlice";
import { removeNetwork } from "@/modules/features/network/networkSlice";
import { removePerson } from "@/modules/features/person/personSlice";
import { resetYearSelection } from "@/modules/features/years/yearsSlice";

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
  const router = useRouter();

  const drawerToggle = useCallback(() => {
    dispatch(toggleDrawerOpen());
  }, [dispatch]);

  useEffect(() => {
    if (router.pathname === "/people/[personId]") {
      return;
    }
    dispatch(resetGenres());
    dispatch(removeNetwork());
    dispatch(removePerson());
    dispatch(resetYearSelection());
  }, [dispatch, router.asPath, router.pathname]);

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
