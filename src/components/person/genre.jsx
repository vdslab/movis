import { Box, Chip, Typography } from "@mui/material";
import { memo } from "react";

import { GenreList } from "@/components/Genre";
import { HelpPopover } from "@/components/HelpPopover";

export const GenreSection = memo(function GenreSection({
  name,
  relatedGenres,
}) {
  const hint = `${name}が製作に携わったことがある映画の全てのジャンルが表示されています。

ジャンルを選択することで${name}が制作に携わった映画から選択したジャンルのいずれかを含む映画を絞り込むことができます。`;

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center" }}>
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
        <HelpPopover text={hint} />
      </Box>

      <GenreList relatedGenres={relatedGenres} />
    </Box>
  );
});
