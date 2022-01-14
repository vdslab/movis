import { Box } from "@mui/material";
import { styled } from "@mui/material/styles";
import { memo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";

import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import {
  selectIsSearchOpen,
  selectIsSelectionOpen,
  toggleSearchOpen,
  toggleSelectionOpen,
} from "@/modules/features/app/slice";

const ContentRoot = styled(Box)(({ theme }) => ({
  display: "flex",
  flex: "1 1 auto",
  maxWidth: "100%",
  paddingTop: 64,
  [theme.breakpoints.up("lg")]: {
    paddingLeft: 300,
  },
}));

export const Layout = memo(function Layout({ children }) {
  const dispatch = useDispatch();

  const isSearchOpen = useSelector(selectIsSearchOpen);
  const isSelectionOpen = useSelector(selectIsSelectionOpen);

  const handleToggleSearchOpen = useCallback(() => {
    alert("hello");
    dispatch(toggleSearchOpen());
  }, [dispatch]);

  const handleToggleSelectionOpen = useCallback(() => {
    alert("hello");
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
            my: 5,
            mx: {
              xs: 2,
              md: 4,
            },
          }}
        >
          {children}
        </Box>
      </ContentRoot>
    </>
  );
});
