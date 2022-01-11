import { Box } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useRouter } from "next/router";
import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";

import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import {
  selectIsSearchOpen,
  selectIsSelectionOpen,
  toggleSearchOpen,
  toggleSelectionOpen,
} from "@/modules/features/app-new/slice";

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

  const isSearchOpen = useSelector(selectIsSearchOpen);
  const isSelectionOpen = useSelector(selectIsSelectionOpen);

  const handleToggleSearchOpen = useCallback(() => {
    dispatch(toggleSearchOpen());
  }, [dispatch]);

  const handleToggleSelectionOpen = useCallback(() => {
    dispatch(toggleSelectionOpen());
  }, [dispatch]);

  return (
    <>
      <Navbar
        handleToggleSearchOpen={handleToggleSearchOpen}
        handleToggleSelectionOpen={handleToggleSelectionOpen}
      />
      <Sidebar
        handleToggleSearchOpen={handleToggleSearchOpen}
        handleToggleSelectionOpen={handleToggleSelectionOpen}
        isSearchOpen={isSearchOpen}
        isSelectionOpen={isSelectionOpen}
      />
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
