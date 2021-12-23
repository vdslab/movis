import { SearchOutlined } from "@mui/icons-material";
import { AppBar, IconButton, Toolbar, Tooltip } from "@mui/material";
import { styled } from "@mui/material/styles";
import { memo } from "react";

import { Logo } from "@/components/Logo";

const NavbarRoot = styled(AppBar)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[3],
}));

export const Navbar = memo(function Navbar({ drawerToggle }) {
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
        <Tooltip title="Search" sx={{ display: { lg: "none" } }}>
          <IconButton
            onClick={() => {
              alert("clicked");
              drawerToggle();
            }}
          >
            <SearchOutlined />
          </IconButton>
        </Tooltip>
      </Toolbar>
    </NavbarRoot>
  );
});
