import { CloseOutlined, SearchOutlined } from "@mui/icons-material";
import {
  Box,
  Drawer,
  IconButton,
  InputBase,
  Paper,
  Typography,
  useMediaQuery,
  Chip,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";

import { toggleSelected } from "@/modules/features/app/appSlice";

export const Sidebar = ({ drawerOpen, drawerToggle, window }) => {
  const theme = useTheme();
  const matchUpLg = useMediaQuery(theme.breakpoints.up("lg"));
  const { register, handleSubmit, reset } = useForm();
  const router = useRouter();
  const [genres, setGenres] = useState([]);
  const { selected, person } = useSelector((state) => state.app);
  const dispatch = useDispatch();

  const drawerWidth = matchUpLg ? 280 : "100%";

  useEffect(() => {
    const loadGenres = async () => {
      const res = await fetch("/api/genres");
      const data = await res.json();

      setGenres(data);
    };

    loadGenres();
  }, []);

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
            reset({ name: "" });
            drawerToggle();
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
      {genres.length > 0 && router.pathname === "/person/[personId]" && (
        <Box sx={{ m: 2 }}>
          <Paper
            component="form"
            sx={{
              p: 1,
              // display: "flex",
              // alignItems: "center",
              width: "100%",
            }}
            onSubmit={handleSubmit((data) => {
              router.push({
                pathname: "/search/[name]",
                query: { name: data.name },
              });
              drawerToggle();
              reset({ name: "" });
            })}
          >
            <Typography sx={{ m: 1 }}>ジャンル</Typography>
            {genres.map((genre) => {
              return (
                <Chip
                  disabled={!person.genreIds.includes(genre.id)}
                  label={genre.name}
                  key={genre.id}
                  color={
                    selected.genreIds.includes(genre.id) ? "success" : void 0
                  }
                  onClick={() =>
                    dispatch(
                      toggleSelected({ target: "genre", value: genre.id })
                    )
                  }
                  sx={{ m: "2px" }}
                />
              );
            })}
          </Paper>
        </Box>
      )}
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
