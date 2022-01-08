import { FilterAltOutlined, SearchOutlined } from "@mui/icons-material";
import { AppBar, Box, IconButton, Toolbar, Tooltip } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useRouter } from "next/router";
import { memo } from "react";

import { Logo } from "@/components/Logo";

const NavbarRoot = styled(AppBar)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[3],
}));

export const Navbar = memo(function Navbar({
  handleSearchMenuModalToggle,
  handleSelectedStatusModalToggle,
}) {
  const router = useRouter();

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
          {router.asPath === "/people/[personId]" && (
            <Tooltip title="フィルター" sx={{ display: { lg: "none" } }}>
              <IconButton onClick={handleSelectedStatusModalToggle}>
                <FilterAltOutlined />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="検索" sx={{ display: { lg: "none" } }}>
            <IconButton onClick={handleSearchMenuModalToggle}>
              <SearchOutlined />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </NavbarRoot>
  );
});
