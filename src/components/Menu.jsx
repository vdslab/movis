import { CloseOutlined } from "@mui/icons-material";
import {
  Box,
  IconButton,
  Paper,
  Typography,
  Chip,
  useMediaQuery,
  Modal,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { memo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";

import { RelatedGenreList } from "@/components/Genre";
import { SearchForm } from "@/components/SearchForm";
import {
  selectIsSearchModalOpen,
  selectIsSelectedStatusModalOpen,
} from "@/modules/features/app/appSlice";
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
          <Typography sx={{ m: 1 }}>選択された人物</Typography>
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

export const LgUpMenuContent = memo(function LgUpMenuContent({}) {
  return (
    <Box>
      <Box sx={{ m: 2 }}>
        <SearchForm />
      </Box>
      <SelectedNodeSection />
      <SelectedYearSection />
      <RelatedGenreSection />
    </Box>
  );
});

export const SearchMenuModal = memo(function SearchMenuModal({
  toggleOpen,
  isOpen,
}) {
  return (
    <Modal open={isOpen} onClose={toggleOpen}>
      <Box
        sx={{
          backgroundColor: "#fff",
          width: "100vw",
          height: "100vh",
        }}
      >
        <Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              px: 2,
              mx: "auto",
              pt: 1,
            }}
          >
            <Typography variant="h6" sx={{ p: 1 }}>
              映画・人物を検索
            </Typography>
            <IconButton onClick={toggleOpen}>
              <CloseOutlined />
            </IconButton>
          </Box>
        </Box>
        <Box sx={{ m: 2 }}>
          <SearchForm toggleOpen={toggleOpen} />
        </Box>
      </Box>
    </Modal>
  );
});

export const SelectedStatusModal = memo(function SelectedStatusModal({
  toggleOpen,
  isOpen,
}) {
  return (
    <Modal open={isOpen} onClose={toggleOpen}>
      <Box
        sx={{
          backgroundColor: "#fff",
          width: "100vw",
          height: "100vh",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            px: 2,
            mx: "auto",
            pt: 1,
          }}
        >
          <Typography variant="h6" sx={{ p: 1 }}>
            選択中のフィルター
          </Typography>
          <IconButton onClick={toggleOpen}>
            <CloseOutlined />
          </IconButton>
        </Box>

        <SelectedNodeSection />
        <SelectedYearSection />
        <RelatedGenreSection />
      </Box>
    </Modal>
  );
});

export const SearchAndSelectionMenu = memo(function SearchAndSelectionMenu({
  handleSearchMenuModalToggle,
  handleSelectedStatusModalToggle,
}) {
  const theme = useTheme();
  const matchUpLg = useMediaQuery(theme.breakpoints.up("lg"));

  const isSearchModalOpen = useSelector(selectIsSearchModalOpen);
  const isSelectedStatusModalOpen = useSelector(
    selectIsSelectedStatusModalOpen
  );

  const MenuWidth = matchUpLg ? 280 : "100%";

  return (
    <Box>
      {matchUpLg ? (
        <Box
          sx={{
            flexShrink: { lg: 0 },
            width: matchUpLg ? MenuWidth : "auto",
            marginTop: "88px",
            position: "sticky",
            top: "88px",
          }}
        >
          <LgUpMenuContent />
        </Box>
      ) : (
        <Box>
          <SearchMenuModal
            toggleOpen={handleSearchMenuModalToggle}
            isOpen={isSearchModalOpen}
          />
          <SelectedStatusModal
            toggleOpen={handleSelectedStatusModalToggle}
            isOpen={isSelectedStatusModalOpen}
          />
        </Box>
      )}
    </Box>
  );
});
