import { useCallback, useEffect, useState } from "react";

// ゴミ処理
export const useSelectedItems = (movies) => {
  const [selectedNodeIds, setSelectedNodeIds] = useState([]);
  const [selectedYears, setSelectedYears] = useState([]);
  const [selectedGenreIds, setSelectedGenreIds] = useState([]);
  const [nodeFilteredMovieIds, setNodeFilteredMovieIds] = useState([]);
  const [yearFilteredMovieIds, setYearFilteredMovieIds] = useState([]);
  const [genreFilteredMovieIds, setGenreFilteredMovieIds] = useState([]);

  const toggleSelectedNode = useCallback((nodeId) => {
    setSelectedNodeIds((prev) => {
      const index = prev.indexOf(nodeId);
      const nodeIds = [...prev];

      if (index < 0) {
        nodeIds.push(nodeId);
      } else {
        nodeIds.splice(index, 1);
      }

      return nodeIds;
    });
  }, []);

  const toggleSelectedYear = useCallback((year) => {
    setSelectedYears((prev) => {
      const index = prevs.indexOf(year);
      const years = [...prev];
      if (index < 0) {
        years.push(year);
      } else {
        years.splice(index, 1);
      }
      return years;
    });
  }, []);

  const toggleSelectedGenres = useCallback((nodeId) => {
    setSelectedGenreIds((prev) => {
      const index = prev.indexOf(nodeId);
      const genres = [...prev];

      if (index < 0) {
        genres.push(nodeId);
      } else {
        genres.splice(index, 1);
      }
    });
  }, []);

  const clearNodeSlection = useCallback(() => {
    setSelectedNodeIds([]);
  }, []);

  const clearYearSelection = useCallback(() => {
    setSelectedYears([]);
  }, []);

  const clearGenreSelection = useCallback(() => {
    setSelectedGenreIds([]);
  }, []);

  const clearAllSelection = useCallback(() => {
    clearNodeSlection();
    clearYearSelection();
    clearGenreSelection();
  }, [clearNodeSlection, clearYearSelection, clearGenreSelection]);

  useEffect(() => {
    if (selectedNodeIds.length === 0) {
      return;
    }

    // 選択ノードの'かつ'で絞り込んだmovie ids
    const andFilteredMovieIds = movies
      .filter((movie) => {
        const movieProductionMemberIds = movie.productionMembers.map(
          (pm) => pm.person.id
        );
        const and = selectedNodeIds.every((nodeId) =>
          movieProductionMemberIds.includes(nodeId)
        );

        return and;
      })
      .map((movie) => movie.id);

    // 選択ノードの'または'で絞り込んだmovie ids
    const orFilteredMovieIds = movies
      .filter((movie) => {
        const movieProductionMemberIds = movie.productionMembers.map(
          (pm) => pm.person.id
        );
        const or = selectedNodeIds.some((nodeId) =>
          movieProductionMemberIds.includes(nodeId)
        );

        return or;
      })
      .map((movie) => movie.id);

    setNodeFilteredMovieIds(andFilteredMovieIds);
  }, [movies, selectedNodeIds]);

  useEffect(() => {
    if (selectedYears.length === 0) {
      return;
    }

    const filteredMovieIds = movies.filter((movie) =>
      selectedYears.includes(movie.productionYear)
    );

    setYearFilteredMovieIds(filteredMovieIds);
  }, [movies, selectedYears]);

  useEffect(() => {
    if (selectedGenreIds.length === 0) {
      return;
    }

    // 選択ジャンルの'かつ'で絞り込んだmovie ids
    const andFilteredMovieIds = movies
      .filter((movie) => {
        const and = selectedGenreIds.every((genreId) =>
          selectedGenreIds.includes(genreId)
        );

        return and;
      })
      .map((movie) => movie.id);

    // 選択ジャンルの'または'で絞り込んだmovie ids
    const orFilteredMovieIds = movies
      .filter((movie) => {
        const or = selectedGenreIds.some((genreId) =>
          selectedGenreIds.includes(genreId)
        );

        return or;
      })
      .map((movie) => movie.id);

    setGenreFilteredMovieIds(andFilteredMovieIds);
  }, [movies, selectedGenreIds]);

  return {
    selectedNodeIds,
    selectedYears,
    selectedGenreIds,
    nodeFilteredMovieIds,
    yearFilteredMovieIds,
    genreFilteredMovieIds,
    toggleSelectedNode,
    toggleSelectedYear,
    toggleSelectedGenres,
    clearNodeSlection,
    clearYearSelection,
    clearGenreSelection,
    clearAllSelection,
  };
};
