import { CloseOutlined, SearchOutlined } from "@mui/icons-material";
import {
  Box,
  Drawer,
  IconButton,
  InputBase,
  Paper,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";

export const Sidebar = ({ drawerOpen, drawerToggle, window }) => {
  const theme = useTheme();
  const matchUpLg = useMediaQuery(theme.breakpoints.up("lg"));
  const { register, handleSubmit } = useForm();
  const router = useRouter();

  const drawerWidth = matchUpLg ? 280 : "100%";

  // ゴミ処理
  const drawer = (
    <Box>
      <Box sx={{ display: { xs: "block", lg: "none" } }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            p: 2,
            mx: "auto",
          }}
        >
          <Typography variant="h6" sx={{ p: 1 }}>
            映画・人物を検索
          </Typography>
          <IconButton onClick={drawerToggle}>
            <CloseOutlined />
          </IconButton>
        </Box>
      </Box>
      <Box sx={{ m: 2 }}>
        <Paper
          component="form"
          sx={{
            p: "2px 4px",
            display: "flex",
            alignItems: "center",
            width: "100%",
          }}
          onSubmit={handleSubmit((data) => {
            router.push({
              pathname: "/search/[name]",
              query: { name: data.name },
            });
          })}
        >
          <InputBase
            sx={{ ml: 1, flex: 1 }}
            placeholder="人物・映画名で検索"
            {...register("name")}
          />
          <IconButton type="submit" sx={{ p: "10px" }}>
            <SearchOutlined />
          </IconButton>
        </Paper>
      </Box>
      {/* <BrowserView>
      <PerfectScrollbar
          component="div"
          style={{
              height: !matchUpMd ? 'calc(100vh - 56px)' : 'calc(100vh - 88px)',
              paddingLeft: '16px',
              paddingRight: '16px'
          }}
      >
          <MenuList />
          <MenuCard />
      </PerfectScrollbar>
  </BrowserView>
  <MobileView>
      <Box sx={{ px: 2 }}>
          <MenuList />
          <MenuCard />
      </Box>
  </MobileView> */}
    </Box>
  );

  const container =
    window !== undefined ? () => window.document.body : undefined;

  return (
    <Box
      component="nav"
      sx={{ flexShrink: { md: 0 }, width: matchUpLg ? drawerWidth : "auto" }}
      aria-label="search form"
    >
      <Drawer
        container={container}
        variant={matchUpLg ? "persistent" : "temporary"}
        anchor="left"
        open={drawerOpen || matchUpLg}
        onClose={drawerToggle}
        sx={{
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            background: theme.palette.background.default,
            color: theme.palette.text.primary,
            borderRight: "none",
            [theme.breakpoints.up("lg")]: {
              top: "88px",
            },
          },
        }}
        ModalProps={{ keepMounted: true }}
        color="inherit"
      >
        {drawer}
      </Drawer>
    </Box>
  );
};
