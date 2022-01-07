import {
  Avatar,
  Box,
  Container,
  Divider,
  FormControl,
  InputLabel,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Select,
  Step,
  StepContent,
  StepLabel,
  Stepper,
  Typography,
} from "@mui/material";
import { ResponsiveCirclePacking } from "@nivo/circle-packing";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { Link } from "@/components/Link";
import prisma from "@/lib/prisma";
import {
  loadCountries,
  selectCountries,
  selectSelectedCountry,
  toggleSelectedCountry,
} from "@/modules/features/country/countrySlice";
import {
  loadCountryRelatedGenres,
  selectCountryRelatedGenres,
  selectSelectedGenre,
  toggleSelectedSingleGenre,
} from "@/modules/features/genres/genresSlice";
import { fetchTmdbPersonImg, forceSerialize } from "@/util";

const Top = (props) => {
  const countries = useSelector(selectCountries.selectAll);
  const selectedCountry = useSelector(selectSelectedCountry);
  const countryRelatedGenres = useSelector(selectCountryRelatedGenres);
  const selectedGenre = useSelector(selectSelectedGenre);
  const dispatch = useDispatch();
  const [activeStep, setActiveStep] = useState(0);
  const [people, setPeople] = useState([]);

  const handleChangeSelectedCountry = useCallback(
    (countryId) => {
      dispatch(toggleSelectedCountry(countryId));
      dispatch(toggleSelectedSingleGenre(""));
    },
    [dispatch]
  );

  const handleChangeSelectedGenre = useCallback(
    (genreId) => {
      dispatch(toggleSelectedSingleGenre(genreId));
    },
    [dispatch]
  );

  const genreGraphData = useMemo(() => {
    if (countryRelatedGenres.length === 0) {
      return void 0;
    }
    const d = {
      name: "",
      children: countryRelatedGenres,
    };

    return d;
  }, [countryRelatedGenres]);

  useEffect(() => {
    console.log("hello");
    console.log(props.countries);
    dispatch(loadCountries(props.countries));
  }, [dispatch, props.countries]);

  // people取得
  useEffect(() => {
    if (!selectedCountry || !selectedGenre) {
      return;
    }

    (async () => {
      console.log(
        `/api/top/person?countryId=${selectedCountry}&genreId=${selectedGenre}`
      );
      const res = await fetch(
        `/api/top/person?countryId=${selectedCountry}&genreId=${selectedGenre}`
      );
      const data = await res.json();

      for (const person of data.p) {
        person["imgUrl"] = await fetchTmdbPersonImg(person.name);
      }

      console.log(data.p);

      setPeople(data.p);
    })();
  }, [selectedCountry, selectedGenre]);

  // genre取得
  useEffect(() => {
    if (!selectedCountry) {
      return;
    }

    (async () => {
      const res = await fetch(`/api/top/genre?countryId=${selectedCountry}`);
      const data = await res.json();

      dispatch(loadCountryRelatedGenres(data.g));
    })();
    dispatch(toggleSelectedSingleGenre(""));
  }, [dispatch, selectedCountry]);

  return (
    <Container maxWidth="xl" sx={{ my: 3 }}>
      <Typography variant="h5">
        製作国とジャンルから活躍している出演者を探してみましょう
      </Typography>
      <Stepper activeStep={activeStep} orientation="vertical">
        {/* select country */}
        <Step expanded={0 <= activeStep}>
          <StepLabel>製作国を選択</StepLabel>
          <StepContent>
            <Typography>出演者が活躍している製作国を選択</Typography>
            <Box>
              <FormControl sx={{ m: 1, width: 300 }}>
                <InputLabel id="top-country-select-label">
                  製作国を選択
                </InputLabel>
                <Select
                  labelId="top-country-select-label"
                  value={selectedCountry}
                  onChange={(e) => {
                    const countryId = e.target.value;
                    handleChangeSelectedCountry(countryId);
                    setActiveStep(1);
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
            </Box>
          </StepContent>
        </Step>

        {/* select genre */}
        <Step expanded={1 <= activeStep}>
          <StepLabel>ジャンルを選択</StepLabel>
          <StepContent>
            <Typography>出演者が活躍しているジャンルを選択</Typography>

            {genreGraphData && (
              <Box sx={{ height: 400, maxWidth: "sm" }}>
                <ResponsiveCirclePacking
                  data={genreGraphData}
                  margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                  id="name"
                  value="movieCount"
                  colors={{ scheme: "nivo" }}
                  childColor={{
                    from: "color",
                    modifiers: [["brighter", 0.4]],
                  }}
                  padding={4}
                  enableLabels={true}
                  labelTextColor={{
                    from: "color",
                    modifiers: [["darker", 2]],
                  }}
                  borderWidth={1}
                  borderColor={{
                    from: "color",
                    modifiers: [["darker", 0.5]],
                  }}
                  defs={[
                    {
                      id: "lines",
                      type: "patternLines",
                      background: "none",
                      color: "#f1e15b",
                      rotation: -45,
                      lineWidth: 5,
                      spacing: 8,
                    },
                  ]}
                  fill={[
                    {
                      match: (d) => d.data.id === selectedGenre,
                      id: "lines",
                    },
                  ]}
                  onClick={(t) => {
                    const genreId = t.data.id;
                    handleChangeSelectedGenre(genreId);
                    setActiveStep(2);
                  }}
                />
              </Box>
            )}

            <FormControl sx={{ m: 1, width: 300 }}>
              <InputLabel id="top-genre-select-label">
                ジャンルを選択
              </InputLabel>
              <Select
                labelId="top-genre-select-label"
                value={selectedGenre}
                onChange={(e) => {
                  const genreId = e.target.value;
                  handleChangeSelectedGenre(genreId);
                  setActiveStep(2);
                }}
                input={<OutlinedInput label="ジャンルを選択" />}
              >
                {countryRelatedGenres.map((genre) => {
                  return (
                    <MenuItem key={genre.id} value={genre.id}>
                      {genre.name}
                      {`（${genre.movieCount}件）`}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          </StepContent>
        </Step>

        {/* people list */}
        <Step expanded={2 <= activeStep}>
          <StepLabel>出演者を確認</StepLabel>
          <StepContent>
            <Typography>製作国・ジャンルでの活躍が多い上位5人を確認</Typography>
            <Box>
              <List sx={{ width: "100%" }}>
                {people.map((person, index) => {
                  return (
                    <Link
                      href={`/people/${person.id}`}
                      sx={{ textDecoration: "none", color: "currentcolor" }}
                      key={person.id}
                    >
                      <ListItemButton alignItems="center">
                        <ListItemAvatar>
                          <Avatar
                            variant="square"
                            alt={person.name}
                            src={person.imgUrl}
                          />
                        </ListItemAvatar>
                        <ListItemText primary={person.name} />
                      </ListItemButton>
                      {index + 1 < people.length ? (
                        <Divider variant="inset" component="li" />
                      ) : null}
                    </Link>
                  );
                })}
              </List>
            </Box>
          </StepContent>
        </Step>
      </Stepper>
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
