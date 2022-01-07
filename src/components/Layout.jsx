import { Box } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useRouter } from "next/router";
import { useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";

import { SearchAndSelectionMenu } from "@/components/Menu";
import { Navbar } from "@/components/Navbar";
import {
  selectIsSearchModalOpen,
  selectIsSelectedStatusModalOpen,
  toggleDrawerOpen,
  toggleSearchModalOpen,
  toggleSelectedStatusModalOpen,
} from "@/modules/features/app/appSlice";
import { resetGenres } from "@/modules/features/genres/genresSlice";
import { removeNetwork } from "@/modules/features/network/networkSlice";
import { removePerson } from "@/modules/features/person/personSlice";
import { removeYears } from "@/modules/features/years/yearsSlice";

const ContentRoot = styled(Box)(() => ({
  display: "flex",
  flex: "1 1 auto",
  maxWidth: "100%",
  paddingTop: 64,
}));

export const Layout = ({ children }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { register, handleSubmit, reset } = useForm();

  const isSearchModalOpen = useSelector(selectIsSearchModalOpen);
  const isSelectedStatusModalOpen = useSelector(
    selectIsSelectedStatusModalOpen
  );

  const drawerToggle = useCallback(() => {
    dispatch(toggleDrawerOpen());
  }, [dispatch]);

  const handleSearchMenuModalToggle = useCallback(() => {
    dispatch(toggleSearchModalOpen());
  }, [dispatch]);

  const handleSelectedStatusModalToggle = useCallback(() => {
    dispatch(toggleSelectedStatusModalOpen());
  }, [dispatch]);

  useEffect(() => {
    if (router.pathname === "/people/[personId]") {
      return;
    }
    dispatch(resetGenres());
    dispatch(removeNetwork());
    dispatch(removePerson());
    dispatch(removeYears());
  }, [dispatch, router.pathname]);

  console.log({ isSearchModalOpen, isSelectedStatusModalOpen });

  return (
    <>
      <Navbar
        drawerToggle={drawerToggle}
        handleSearchMenuModalToggle={handleSearchMenuModalToggle}
        handleSelectedStatusModalToggle={handleSelectedStatusModalToggle}
      />

      <Box sx={{ display: "flex", flex: "1 0 auto" }}>
        <SearchAndSelectionMenu
          handleSearchMenuModalToggle={handleSearchMenuModalToggle}
          handleSelectedStatusModalToggle={handleSelectedStatusModalToggle}
        />
        <ContentRoot>
          <Box
            sx={{
              display: "flex",
              flex: "1 1 auto",
              flexDirection: "column",
              width: "100%",
            }}
            maxWidth="xl"
          >
            {children}
          </Box>
        </ContentRoot>
      </Box>
    </>
  );
};
