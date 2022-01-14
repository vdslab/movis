import { FilterAltOutlined, SearchOutlined } from "@mui/icons-material";
import { AppBar, Box, IconButton, Toolbar } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useRouter } from "next/router";
import { memo, useCallback } from "react";
import { useDispatch } from "react-redux";

import { Logo } from "@/components/Logo";
import {
  toggleSearchOpen,
  toggleSelectionOpen,
} from "@/modules/features/app/slice";

const NavbarRoot = styled(AppBar)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[3],
}));

const SelectionIconButton = memo(function SelectionIconButton({
  handleToggleSelectionOpen,
}) {
  const router = useRouter();

  return router.pathname === "/people/[personId]" ? (
    <IconButton onClick={handleToggleSelectionOpen} disableRipple>
      <FilterAltOutlined />
    </IconButton>
  ) : null;
});

export const Navbar = memo(function Navbar({}) {
  const dispatch = useDispatch();

  const handleToggleSearchOpen = useCallback(() => {
    dispatch(toggleSearchOpen());
  }, [dispatch]);

  const handleToggleSelectionOpen = useCallback(() => {
    dispatch(toggleSelectionOpen());
  }, [dispatch]);

  return (
    <NavbarRoot>
      <Toolbar
        disableGutters
        sx={{
          display: "flex",
          justifyContent: "space-between",
          minHeight: 64,
          left: 0,
          px: 2,
        }}
      >
        <Logo />
        <Box>
          <SelectionIconButton
            handleToggleSelectionOpen={handleToggleSelectionOpen}
          />
          <IconButton onClick={handleToggleSearchOpen} disableRipple>
            <SearchOutlined />
          </IconButton>
        </Box>
      </Toolbar>
    </NavbarRoot>
  );
});
