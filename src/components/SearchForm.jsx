import { SearchOutlined } from "@mui/icons-material";
import { IconButton, InputBase, Paper } from "@mui/material";
import { useRouter } from "next/router";
import { memo } from "react";
import { useForm } from "react-hook-form";

export const SearchForm = memo(function SearchForm({ toggleOpen }) {
  const { register, handleSubmit, reset } = useForm();
  const router = useRouter();

  return (
    <Paper
      component="form"
      sx={{
        p: "2px 4px",
        display: "flex",
        alignItems: "center",
        width: "100%",
      }}
      onSubmit={handleSubmit((data) => {
        const encodedKeyword = encodeURIComponent(data.keyword);
        router.push(`/people?keyword=${encodedKeyword}`);
        reset({ keyword: "" });
        if (toggleOpen) {
          toggleOpen();
        }
      })}
    >
      <InputBase
        sx={{ ml: 1, flex: 1 }}
        placeholder="人物・映画名で検索"
        {...register("keyword")}
      />
      <IconButton type="submit" sx={{ p: "10px" }}>
        <SearchOutlined />
      </IconButton>
    </Paper>
  );
});
