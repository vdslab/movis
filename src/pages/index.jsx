import {
  Avatar,
  Box,
  CircularProgress,
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
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { ResponsiveCirclePacking } from "@nivo/circle-packing";
import { memo, useCallback, useEffect, useMemo, useState } from "react";

import { HelpPopover } from "@/components/HelpPopover";
import { Link } from "@/components/Link";
import { SearchForm } from "@/components/SearchForm";
import prisma from "@/lib/prisma";
import { fetchTmdbPersonImg, forceSerialize } from "@/util";

const FirstStepContent = memo(function FirstStep({
  selectedCountryId,
  countries,
  handleChange,
}) {
  return (
    <Box>
      <StepLabel>製作国を選択</StepLabel>
      <StepContent>
        <Typography>興味がある製作国を選択</Typography>
        <Box>
          <FormControl sx={{ m: 1, width: 300 }}>
            <InputLabel id="top-country-select-label">製作国を選択</InputLabel>
            <Select
              labelId="top-country-select-label"
              value={selectedCountryId}
              onChange={handleChange}
              input={<OutlinedInput label="製作国を選択" />}
            >
              {countries.map((c) => {
                return (
                  <MenuItem key={c.id} value={c.id}>
                    {c.name}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        </Box>
      </StepContent>
    </Box>
  );
});

const ResponsiveCirclePackingComponent = memo(
  function ResponsiveCirclePackingComponent({
    data,
    handleClick,
    selectedGenreId,
  }) {
    return (
      <ResponsiveCirclePacking
        data={data}
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
            match: (d) => d.data.id === selectedGenreId,
            id: "lines",
          },
        ]}
        onClick={handleClick}
      />
    );
  }
);

const SecondStepContent = memo(function SecondStep({
  genreGraphData,
  handleChangeGenre,
  handleClickCircle,
  genres,
  selectedGenreId,
  countryName,
}) {
  return (
    <Box>
      <StepLabel>ジャンルを選択</StepLabel>
      <StepContent>
        {genreGraphData && genres.length > 0 ? (
          <Box>
            <Typography>
              {countryName}
              に関わりのあるジャンルを選択
            </Typography>

            <Box sx={{ height: 400, maxWidth: "sm" }}>
              <ResponsiveCirclePackingComponent
                data={genreGraphData}
                handleClick={handleClickCircle}
                selectedGenreId={selectedGenreId}
              />
            </Box>

            <FormControl sx={{ m: 1, width: 300 }}>
              <InputLabel id="top-genre-select-label">
                ジャンルを選択
              </InputLabel>
              <Select
                labelId="top-genre-select-label"
                value={selectedGenreId}
                onChange={handleChangeGenre}
                input={<OutlinedInput label="ジャンルを選択" />}
              >
                {genres.map((g) => {
                  return (
                    <MenuItem key={g.id} value={g.id}>
                      {g.name}
                      {`（${g.movieCount}件）`}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          </Box>
        ) : (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
            }}
          >
            <Typography>ジャンル情報を取得中</Typography>
            <CircularProgress sx={{ m: 4 }} />
          </Box>
        )}
      </StepContent>
    </Box>
  );
});

const ThirdStepContent = memo(function ThirdStepContent({
  countryName,
  genreName,
  people,
  person2imgUrl,
}) {
  return (
    <Box>
      <StepLabel>人物を確認</StepLabel>
      <StepContent>
        <Typography>
          {countryName}の{genreName}
          での活躍数が多い上位10人を確認
        </Typography>
        {people.length > 0 ? (
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
                          src={person2imgUrl[person.id]}
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
        ) : (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
            }}
          >
            <Typography>人物情報を取得中</Typography>
            <CircularProgress sx={{ m: 4 }} />
          </Box>
        )}
      </StepContent>
    </Box>
  );
});

const Top = ({ countries }) => {
  const theme = useTheme();
  const matchUpLg = useMediaQuery(theme.breakpoints.up("lg"));
  const [activeStep, setActiveStep] = useState(0);
  const [people, setPeople] = useState([]);
  const [genres, setGenres] = useState([]);
  const [selectedCountryId, setSelectedCountryId] = useState("");
  const [selectedGenreId, setSelectedGenreId] = useState("");
  const [person2imgUrl, setPerson2imgUrl] = useState({});

  const country = useMemo(() => {
    return countries.filter((c) => c.id === selectedCountryId)?.[0];
  }, [countries, selectedCountryId]);

  const genre = useMemo(() => {
    return genres.filter((g) => g.id === selectedGenreId)?.[0];
  }, [genres, selectedGenreId]);

  const genreGraphData = useMemo(() => {
    if (genres.length === 0) {
      return void 0;
    }

    const data = {
      name: "",
      children: genres,
    };

    return data;
  }, [genres]);

  const handleChangeCountry = useCallback((e) => {
    const countryId = e.target.value;
    setSelectedCountryId(countryId);
  }, []);

  const handleChangeGenre = useCallback((e) => {
    const genreId = e.target.value;
    setSelectedGenreId(genreId);
  }, []);

  const handleClickCircle = useCallback((t) => {
    const genreId = t.data.id;
    if (genreId) {
      setSelectedGenreId(genreId);
    }
  }, []);

  // genre
  useEffect(() => {
    setPeople([]);
    setGenres([]);
    if (!selectedCountryId) {
      return;
    }

    (async () => {
      const res = await fetch(`/api/top/genre?countryId=${selectedCountryId}`);
      const data = await res.json();

      setGenres(data.g);
    })();
    setActiveStep(1);
  }, [selectedCountryId]);

  // people
  useEffect(() => {
    setPeople([]);
    if (!selectedCountryId || !selectedGenreId) {
      return;
    }
    (async () => {
      const res = await fetch(
        `/api/top/person?countryId=${selectedCountryId}&genreId=${selectedGenreId}`
      );
      const data = await res.json();

      setPeople(data.p);
    })();
    setActiveStep(2);
  }, [selectedCountryId, selectedGenreId]);

  useEffect(() => {
    if (people.length === 0) {
      return;
    }

    (async () => {
      const p2i = {};
      for (const person of people) {
        p2i[person.id] = await fetchTmdbPersonImg(person.name);
      }
      setPerson2imgUrl(p2i);
    })();
  }, [people]);

  return (
    <Box>
      <Box sx={{ my: 2 }}>
        <Typography variant="h5">movisとは</Typography>
        <Typography>
          おすすめなどの自分以外の評価に頼らず、「人」を起点に映画を探せるサービスです。
        </Typography>
        <Typography>
          作品情報や出演者・スタッフ情報の閲覧が可能であり、閲覧の補助をする可視化や機能が加えられています。
        </Typography>
      </Box>

      <Typography variant="h6" sx={{ my: 6 }}>
        まずは起点となる人を見つけましょう
      </Typography>
      <Box>
        <Typography>
          探したい人が決まっている場合は{matchUpLg && "左から"}
          名前で検索しましょう
        </Typography>
        {!matchUpLg && (
          <Box sx={{ pr: 2, mt: 2, mb: 4, width: { xs: "100%", sm: "50%" } }}>
            <SearchForm />
          </Box>
        )}
      </Box>

      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Typography>
          探したい人が決まっていない場合には関心のある製作国とジャンルから活躍している人物を探してみましょう
        </Typography>
        <HelpPopover
          text={
            "特定の国・ジャンルで活躍している人物を探すための機能です。関心のある国・ジャンルを選択してください。"
          }
        />
      </Box>
      <Stepper activeStep={activeStep} orientation="vertical">
        <Step expanded={0 <= activeStep}>
          <FirstStepContent
            countries={countries}
            selectedCountryId={selectedCountryId}
            handleChange={handleChangeCountry}
          />
        </Step>

        <Step expanded={1 <= activeStep}>
          <SecondStepContent
            genreGraphData={genreGraphData}
            handleChangeGenre={handleChangeGenre}
            handleClickCircle={handleClickCircle}
            genres={genres}
            selectedGenreId={selectedGenreId}
            countryName={country ? country.name : "選択した国"}
          />
        </Step>

        <Step expanded={2 <= activeStep} last>
          <ThirdStepContent
            countryName={country ? country.name : "選択した国"}
            genreName={genre ? genre.name : "選択したジャンル"}
            people={people}
            person2imgUrl={person2imgUrl}
          />
        </Step>
      </Stepper>
    </Box>
  );
};

export const getServerSideProps = async () => {
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
