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
import { memo, useCallback } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";

import { RelatedGenreList } from "@/components/Genre";
import { selectIsDrawerOpen } from "@/modules/features/app/appSlice";
import {
  selectPersonRelatedGenres,
  toggleSelectedGenre,
} from "@/modules/features/genres/genresSlice";
import {
  selectSelectedNodes,
  toggleSelectedNode,
} from "@/modules/features/network/networkSlice";
import {
  selectYears,
  toggleSelectedYear,
} from "@/modules/features/years/yearsSlice";

const NodeItem = memo(function NodeItem({ name, id, handleClick }) {
  return (
    <Chip
      label={name}
      color={"error"}
      onClick={() => handleClick(id)}
      sx={{ m: "2px" }}
    />
  );
});

const SelectedNodeSection = () => {
  const dispatch = useDispatch();
  const selectedNodes = useSelector(selectSelectedNodes.selectAll);

  const handleItemClick = useCallback(
    (nodeId) => {
      dispatch(toggleSelectedNode(nodeId));
    },
    [dispatch]
  );

  return (
    <Box sx={{ m: 2 }}>
      {selectedNodes.length > 0 && (
        <Paper
          component="div"
          sx={{
            p: 1,
            width: "100%",
          }}
        >
          <Typography sx={{ m: 1 }}>選択された出演者</Typography>
          {selectedNodes.map((sn) => {
            return (
              <NodeItem
                name={sn.name}
                id={sn.id}
                handleClick={handleItemClick}
                key={sn.id}
              />
            );
          })}
        </Paper>
      )}
    </Box>
  );
};

const YearItem = memo(function YearItem({ year, isSelected, handleClick }) {
  return (
    <Chip
      label={year}
      color={isSelected ? "warning" : void 0}
      onClick={() => {
        handleClick(year);
      }}
      sx={{ m: "2px" }}
    />
  );
});

const SelectedYearSection = () => {
  const dispatch = useDispatch();
  const years = useSelector(selectYears.selectAll);

  const handleItemClick = useCallback(
    (year) => {
      dispatch(toggleSelectedYear(year));
    },
    [dispatch]
  );

  return (
    <Box sx={{ m: 2 }}>
      {years.length > 0 && (
        <Paper
          component="div"
          sx={{
            p: 1,
            width: "100%",
          }}
        >
          <Typography sx={{ m: 1 }}>製作年度</Typography>
          {years.map((year) => {
            return (
              <YearItem
                year={year.year}
                isSelected={year.isSelected}
                handleClick={handleItemClick}
                key={year.year}
              />
            );
          })}
        </Paper>
      )}
    </Box>
  );
};

const RelatedGenreSection = () => {
  const dispatch = useDispatch();
  const personRelatedGenres = useSelector(selectPersonRelatedGenres);

  const handleGenreItemClick = useCallback(
    (genreId) => {
      dispatch(toggleSelectedGenre(genreId));
    },
    [dispatch]
  );

  return (
    <Box sx={{ m: 2 }}>
      {personRelatedGenres.length > 0 && (
        <Paper
          component="div"
          sx={{
            p: 1,
            width: "100%",
          }}
        >
          <Typography sx={{ m: 1 }}>ジャンル</Typography>
          <RelatedGenreList
            personRelatedGenres={personRelatedGenres}
            handleGenreItemClick={handleGenreItemClick}
          />
        </Paper>
      )}
    </Box>
  );
};

const DrawerBody = memo(function DrawerBody({
  drawerToggle,
  handleSubmit,
  register,
  reset,
  router,
}) {
  return (
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
            const encodedKeyword = encodeURIComponent(data.keyword);
            router.push(`/people?keyword=${encodedKeyword}`);
            reset({ keyword: "" });
            drawerToggle();
          })}
        >
          <InputBase
            sx={{ ml: 1, flex: 1 }}
            placeholder="人物・映画名で検索"
            {...register("keyword")}
          />
          <IconButton type="submit" sx={{ p: "10px" }}>
            <SearchOutlined />
          </IconButton>
        </Paper>
      </Box>
      <SelectedNodeSection />
      <SelectedYearSection />
      <RelatedGenreSection />
    </Box>
  );
});

export const Sidebar = memo(function Sidebar({ drawerToggle, window }) {
  const theme = useTheme();
  const matchUpLg = useMediaQuery(theme.breakpoints.up("lg"));
  const { register, handleSubmit, reset } = useForm();
  const router = useRouter();

  const isDrawerOpen = useSelector(selectIsDrawerOpen);

  const drawerWidth = matchUpLg ? 280 : "100%";

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
        open={isDrawerOpen || matchUpLg}
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
        <DrawerBody
          drawerToggle={drawerToggle}
          handleSubmit={handleSubmit}
          register={register}
          reset={reset}
          router={router}
        />
      </Drawer>
    </Box>
  );
});
