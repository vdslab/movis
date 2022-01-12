import { CloseOutlined } from "@mui/icons-material";
import { DeleteOutline, InfoOutlined } from "@mui/icons-material";
import {
  Box,
  Drawer,
  IconButton,
  Paper,
  Typography,
  useMediaQuery,
  Chip,
  List,
  ListItemText,
  Divider,
  ListItem,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useRouter } from "next/router";
import { memo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";

import { SearchForm } from "@/components/SearchForm";
import {
  relatedGenreSelectors,
  selectSelectedGenreIds,
  toggleSelectedGenre,
  selectRelatedYears,
  selectSelectedYears,
  toggleSelectedYear,
  selectedNodeSelectors,
  toggleSelectedNode,
} from "@/modules/features/app-new/slice";

const NodeItem = memo(function NodeItem({ node, onDeleteClick, onInfoClick }) {
  return (
    <ListItem
      secondaryAction={
        <Box>
          <IconButton
            edge="end"
            aria-label="details"
            onClick={() => onInfoClick(node.id)}
          >
            <InfoOutlined />
          </IconButton>
          <IconButton
            edge="end"
            aria-label="delete"
            onClick={() => onDeleteClick(node)}
          >
            <DeleteOutline />
          </IconButton>
        </Box>
      }
    >
      <ListItemText primary={node.name} />
    </ListItem>
  );
});

const SelectedNodeSection = () => {
  const dispatch = useDispatch();
  const selectedNodes = useSelector(selectedNodeSelectors.selectAll);
  const router = useRouter();

  const handleToggleNode = useCallback(
    (node) => {
      dispatch(toggleSelectedNode(node));
    },
    [dispatch]
  );

  const handleMoveDetails = useCallback(
    (personId) => {
      router.push(`/people/${personId}`);
    },
    [router]
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
          <List sx={{ width: "100%" }}>
            {selectedNodes.map((node, index) => {
              return (
                <Box key={node.id}>
                  <NodeItem
                    node={node}
                    onDeleteClick={handleToggleNode}
                    onInfoClick={handleMoveDetails}
                  />
                  {index + 1 < selectedNodes.length ? (
                    <Divider variant="fullWidth" component="li" />
                  ) : null}
                </Box>
              );
            })}
          </List>
        </Paper>
      )}
    </Box>
  );
};

const YearItem = memo(function YearItem({ onClick, year, isSelected }) {
  return (
    <Chip
      key={year}
      label={year}
      color={isSelected ? "warning" : void 0}
      onClick={() => {
        onClick(year);
      }}
      sx={{ m: "2px" }}
    />
  );
});

const SelectedYearSection = () => {
  const dispatch = useDispatch();
  const relatedYears = useSelector(selectRelatedYears);
  const selectedYears = useSelector(selectSelectedYears);

  const handleYearItemClick = useCallback(
    (year) => {
      dispatch(toggleSelectedYear(year));
    },
    [dispatch]
  );

  return (
    <Box sx={{ m: 2 }}>
      {relatedYears.length > 0 && (
        <Paper
          component="div"
          sx={{
            p: 1,
            width: "100%",
          }}
        >
          <Typography sx={{ m: 1 }}>製作年度を選択</Typography>
          {relatedYears.map((year) => {
            const isSelected = selectedYears.includes(year);

            return (
              <YearItem
                key={year}
                onClick={handleYearItemClick}
                year={year}
                isSelected={isSelected}
              />
            );
          })}
        </Paper>
      )}
    </Box>
  );
};

const GenreItem = memo(function GenreItem({ onClick, genre, isSelected }) {
  return (
    <Chip
      key={genre.id}
      label={genre.name}
      color={isSelected ? "success" : void 0}
      onClick={() => onClick(genre.id)}
      sx={{ m: 0.5 }}
    />
  );
});

const RelatedGenreSection = () => {
  const dispatch = useDispatch();
  const relatedGenres = useSelector(relatedGenreSelectors.selectAll);
  const selectedGenreIds = useSelector(selectSelectedGenreIds);

  const handleGenreItemClick = useCallback(
    (genreId) => {
      dispatch(toggleSelectedGenre(genreId));
    },
    [dispatch]
  );

  return (
    <Box sx={{ m: 2 }}>
      {relatedGenres.length > 0 && (
        <Paper
          component="div"
          sx={{
            p: 1,
            width: "100%",
          }}
        >
          <Typography sx={{ m: 1 }}>ジャンルを選択</Typography>
          {relatedGenres.map((genre) => {
            const isSelected = selectedGenreIds.includes(genre.id);

            return (
              <GenreItem
                key={genre.id}
                genre={genre}
                isSelected={isSelected}
                onClick={handleGenreItemClick}
              />
            );
          })}
        </Paper>
      )}
    </Box>
  );
};

const MobileSelectionDrawerBody = memo(function MobileSelectionDrawerBody({
  handleToggleSelectionOpen,
}) {
  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          px: 2,
          mx: "auto",
          alignItems: "center",
          minHeight: 64,
        }}
      >
        <Typography variant="h6" sx={{ p: 1 }}>
          フィルター情報を選択
        </Typography>
        <IconButton onClick={handleToggleSelectionOpen}>
          <CloseOutlined />
        </IconButton>
      </Box>

      <Box>
        <SelectedNodeSection />
        <SelectedYearSection />
        <RelatedGenreSection />
      </Box>
    </Box>
  );
});

const MobileSearchDrawerBody = memo(function MobileSearchDrawerBody({
  handleToggleSearchOpen,
}) {
  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          px: 2,
          mx: "auto",
          alignItems: "center",
          minHeight: 64,
        }}
      >
        <Typography variant="h6" sx={{ p: 1 }}>
          映画・人物を検索
        </Typography>
        <IconButton onClick={handleToggleSearchOpen}>
          <CloseOutlined />
        </IconButton>
      </Box>

      <Box sx={{ m: 2 }}>
        <SearchForm toggleOpen={handleToggleSearchOpen} />
      </Box>
    </Box>
  );
});

const LgDrawerBody = memo(function LgDrawerBody({ handleToggleSearchOpen }) {
  return (
    <Box>
      <Box sx={{ m: 2 }}>
        <SearchForm toggleOpen={handleToggleSearchOpen} />
      </Box>
      <Box>
        <SelectedNodeSection />
        <SelectedYearSection />
        <RelatedGenreSection />
      </Box>
    </Box>
  );
});

const DrawerBody = memo(function DrawerBody({
  matchUpLg,
  isSearchOpen,
  isSelectionOpen,
  handleToggleSearchOpen,
  handleToggleSelectionOpen,
}) {
  if (matchUpLg) {
    return <LgDrawerBody handleToggleSearchOpen={handleToggleSearchOpen} />;
  } else {
    if (isSearchOpen) {
      return (
        <MobileSearchDrawerBody
          handleToggleSearchOpen={handleToggleSearchOpen}
        />
      );
    } else if (isSelectionOpen) {
      return (
        <MobileSelectionDrawerBody
          handleToggleSelectionOpen={handleToggleSelectionOpen}
        />
      );
    }
  }
  return null;
});

export const Sidebar = memo(function Sidebar({
  handleToggleSearchOpen,
  handleToggleSelectionOpen,
  isSearchOpen,
  isSelectionOpen,
  window,
}) {
  const theme = useTheme();
  const matchUpLg = useMediaQuery(theme.breakpoints.up("lg"));

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
        open={isSearchOpen || isSelectionOpen || matchUpLg}
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
          handleToggleSearchOpen={handleToggleSearchOpen}
          handleToggleSelectionOpen={handleToggleSelectionOpen}
          isSearchOpen={isSearchOpen}
          isSelectionOpen={isSelectionOpen}
          matchUpLg={matchUpLg}
        />
      </Drawer>
    </Box>
  );
});
