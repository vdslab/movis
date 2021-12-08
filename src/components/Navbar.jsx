import { SearchOutlined } from "@mui/icons-material";
import { AppBar, Box, IconButton, Toolbar, Tooltip } from "@mui/material";
import { styled } from "@mui/material/styles";
import Image from "next/image";
import Link from "next/link";

const NavbarRoot = styled(AppBar)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[3],
}));

export const Navbar = () => {
  return (
    <NavbarRoot>
      <Toolbar disableGutters sx={{ minHeight: 64, left: 0, px: 2 }}>
        <Box sx={{ px: 3 }}>
          <Link href="/">
            <a>
              <Image src="/movis.svg" alt="movisロゴ" width="100" height="50" />
            </a>
          </Link>
        </Box>
        <Tooltip title="Search">
          <IconButton sx={{ ml: 1 }}>
            <SearchOutlined />
          </IconButton>
        </Tooltip>
      </Toolbar>
    </NavbarRoot>
  );
};
