import {
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
} from "@mui/material";
import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import prisma from "@/lib/prisma";
import {
  loadCountries,
  selectCountries,
  selectSelectedCountry,
  toggleSelectedCountry,
} from "@/modules/features/country/countrySlice";
import { selectSelectedGenre } from "@/modules/features/genres/genresSlice";
import { forceSerialize } from "@/util";

const Top = (props) => {
  const countries = useSelector(selectCountries.selectAll);
  const selectedCountry = useSelector(selectSelectedCountry);
  const selectedGenre = useSelector(selectSelectedGenre);
  const dispatch = useDispatch();

  const handleChangeSelectedCountry = useCallback(
    (countryId) => {
      dispatch(toggleSelectedCountry(countryId));
    },
    [dispatch]
  );

  useEffect(() => {
    dispatch(loadCountries(props.countries));
  }, [dispatch, props.countries]);

  useEffect(() => {}, []);

  console.log(selectedCountry);
  return (
    <Container maxWidth="xl" sx={{ my: 3 }}>
      {/* select country */}
      <FormControl sx={{ m: 1, width: 300 }}>
        <InputLabel id="top-country-select-label">製作国を選択</InputLabel>
        <Select
          labelId="top-country-select-label"
          value={selectedCountry}
          onChange={(e) => {
            const countryId = e.target.value;
            handleChangeSelectedCountry(countryId);
          }}
          input={<OutlinedInput label="製作国を選択" />}
        >
          {countries.map((country) => {
            return (
              <MenuItem key={country.id} value={country.id}>
                {country.name}
              </MenuItem>
            );
          })}
        </Select>
      </FormControl>

      {/* select genre */}
      {/* <FormControl sx={{ m: 1, width: 300 }}>
        <InputLabel id="top-country-select-label">製作国を選択</InputLabel>
        <Select
          labelId="top-country-select-label"
          value={selectedCountry}
          onChange={(e) => {
            const countryId = e.target.value;
            handleChangeSelectedCountry(countryId);
          }}
          input={<OutlinedInput label="製作国を選択" />}
        >
          {countries.map((country) => {
            return (
              <MenuItem key={country.id} value={country.id}>
                {country.name}
              </MenuItem>
            );
          })}
        </Select>
      </FormControl> */}
    </Container>
  );
};

export const getServerSideProps = async (ctx) => {
  const countries = await prisma.country.findMany({
    select: {
      id: true,
      name: true,
      _count: {
        select: {
          movie: true,
        },
      },
    },
    orderBy: {
      movie: {
        _count: "desc",
      },
    },
  });

  return {
    props: forceSerialize({ countries }),
  };
};

export default Top;
