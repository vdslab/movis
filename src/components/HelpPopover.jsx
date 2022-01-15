import { HelpOutline } from "@mui/icons-material";
import { Box, IconButton, Paper, Popover, Typography } from "@mui/material";
import { memo, useCallback, useState } from "react";

const DescriptionPopover = memo(function DescriptionPopover({
  text,
  anchorEl,
  toggleOpen,
}) {
  return (
    <Popover
      open={!!anchorEl}
      anchorEl={anchorEl}
      onClose={toggleOpen}
      anchorOrigin={{
        vertical: "top",
        horizontal: "left",
      }}
      transformOrigin={{
        vertical: "bottom",
        horizontal: "left",
      }}
    >
      <Paper>
        <Typography sx={{ p: 2, whiteSpace: "pre-wrap" }}>{text}</Typography>
      </Paper>
    </Popover>
  );
});

export const HelpPopover = memo(function HelpPopover({ text }) {
  const [anchorEl, setAnchorEl] = useState(null);

  const toggleOpen = useCallback((event) => {
    setAnchorEl((prev) => (prev ? null : event.currentTarget));
  }, []);

  return (
    <Box>
      <IconButton onClick={toggleOpen}>
        <HelpOutline />
      </IconButton>
      <Box sx={{ top: "100px" }}>
        <DescriptionPopover
          text={text}
          anchorEl={anchorEl}
          toggleOpen={toggleOpen}
        />
      </Box>
    </Box>
  );
});
