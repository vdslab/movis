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

import { GenreList } from "@/components/Genre";
import { SearchForm } from "@/components/SearchForm";
import {
  relatedGenreSelectors,
  selectRelatedYears,
  selectSelectedYears,
  toggleSelectedYear,
  selectedNodeSelectors,
  toggleSelectedNode,
  toggleSearchOpen,
  toggleSelectionOpen,
  selectIsSearchOpen,
  selectIsSelectionOpen,
} from "@/modules/features/app/slice";

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

const SelectedNodeSection = ({ onClick }) => {
  const dispatch = useDispatch();
  const selectedNodes = useSelector(selectedNodeSelectors.selectAll);
  const router = useRouter();
  const isPersonPage = router.pathname === "/people/[personId]";

  const handleToggleNode = useCallback(
    (node) => {
      dispatch(toggleSelectedNode(node));
    },
    [dispatch]
  );

  const handleMoveDetails = useCallback(
    (personId) => {
      router.push(`/people/${personId}`);
      onClick();
    },
    [router, onClick]
  );

  return isPersonPage ? (
    <Box sx={{ m: 2 }}>
      <Paper
        component="div"
        sx={{
          p: 1,
          width: "100%",
        }}
      >
        <Typography sx={{ m: 1 }} component={"div"}>
          選択された
          <Chip
            label="人物"
            color="error"
            sx={{ m: 0.5, mb: 1 }}
            size="small"
          />
        </Typography>
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
    </Box>
  ) : null;
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
          <Typography sx={{ m: 1 }} component={"div"}>
            <Chip
              label="製作年度"
              color="warning"
              sx={{ m: 0.5, mb: 1 }}
              size="small"
            />
            を選択
          </Typography>
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

const RelatedGenreSection = () => {
  const relatedGenres = useSelector(relatedGenreSelectors.selectAll);

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
          <Typography sx={{ m: 1 }} component={"div"}>
            <Chip
              label="ジャンル"
              color="success"
              sx={{ m: 0.5, mb: 1 }}
              size="small"
            />
            を選択
          </Typography>
          <GenreList relatedGenres={relatedGenres} />
        </Paper>
      )}
    </Box>
  );
};

const XsSelectionDrawerBody = memo(function XsSelectionDrawerBody({
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

      <Box sx={{ height: "calc(100vh - 64px)", overflowY: "auto" }}>
        <SelectedNodeSection onClick={handleToggleSelectionOpen} />
        <SelectedYearSection />
        <RelatedGenreSection />
        <Box sx={{ mb: "240px" }} />
      </Box>
    </Box>
  );
});

const XsSearchDrawerBody = memo(function XsSearchDrawerBody({
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

const LgDrawerBody = memo(function LgDrawerBody() {
  return (
    <Box>
      <Box sx={{ m: 2 }}>
        <SearchForm />
      </Box>
      <Box>
        <SelectedNodeSection />
        <SelectedYearSection />
        <RelatedGenreSection />
      </Box>

      <Box sx={{ mb: "100px" }} />
    </Box>
  );
});

const XsDrawerBody = memo(function XsDrawerBody({}) {
  const dispatch = useDispatch();
  const isSearchOpen = useSelector(selectIsSearchOpen);
  const isSelectionOpen = useSelector(selectIsSelectionOpen);

  const handleToggleSearchOpen = useCallback(() => {
    dispatch(toggleSearchOpen());
  }, [dispatch]);

  const handleToggleSelectionOpen = useCallback(() => {
    dispatch(toggleSelectionOpen());
  }, [dispatch]);

  return (
    <Box>
      <Box sx={{ display: isSearchOpen ? "block" : "none" }}>
        <XsSearchDrawerBody handleToggleSearchOpen={handleToggleSearchOpen} />
      </Box>

      <Box sx={{ display: isSelectionOpen ? "block" : "none" }}>
        <XsSelectionDrawerBody
          handleToggleSelectionOpen={handleToggleSelectionOpen}
        />
      </Box>
    </Box>
  );
});

const DrawerBody = memo(function DrawerBody({ matchUpLg }) {
  return matchUpLg ? <LgDrawerBody /> : <XsDrawerBody />;
});

export const Sidebar = memo(function Sidebar({ window }) {
  const isSearchOpen = useSelector(selectIsSearchOpen);
  const isSelectionOpen = useSelector(selectIsSelectionOpen);
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
        <DrawerBody matchUpLg={matchUpLg} />
      </Drawer>
    </Box>
  );
});
