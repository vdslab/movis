import { Box, Chip, Typography } from "@mui/material";
import { memo } from "react";

import { GenreList } from "@/components/Genre";

export const GenreSection = memo(function GenreSection({
  name,
  relatedGenres,
}) {
  return (
    <Box>
      <Typography sx={{ p: 1 }} component={"div"}>
        {name}が制作に携わった映画の
        <Chip
          label="ジャンル"
          color="success"
          sx={{ m: 0.5, mb: 1 }}
          size="small"
        />
        を選択して、映画を絞り込みましょう
      </Typography>

      <GenreList relatedGenres={relatedGenres} />
    </Box>
  );
});
