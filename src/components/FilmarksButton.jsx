import { Button } from "@mui/material";
import { memo } from "react";

export const FilmarksButton = memo(function FilmarksButton({ href }) {
  return (
    <Button
      target="_blank"
      rel="noreferrer"
      sx={{
        backgroundColor: "#FFE100",
        border: "solid 1px #000",
        color: "#000",
        ":hover": {
          backgroundColor: "#000",
          border: "solid 1px #FFE100",
          color: "#FFE100",
        },
      }}
      href={href}
    >
      Filmarksで詳しく見る
    </Button>
  );
});
