import { SearchOutlined } from "@mui/icons-material";
import { Container, InputBase, IconButton, Paper } from "@mui/material";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";

const Top = (props) => {
  const { register, handleSubmit } = useForm();
  const router = useRouter();

  return (
    <Container maxWidth="sm" sx={{ pt: 5 }}>
      <Paper
        component="form"
        sx={{
          p: "2px 4px",
          display: "flex",
          alignItems: "center",
          width: "100%",
        }}
        onSubmit={handleSubmit((data) => {
          router.push({
            pathname: "/search/[name]",
            query: { name: data.name },
          });
        })}
      >
        <InputBase
          sx={{ ml: 1, flex: 1 }}
          placeholder="人物・映画名で検索"
          {...register("name")}
        />
        <IconButton type="submit" sx={{ p: "10px" }}>
          <SearchOutlined />
        </IconButton>
      </Paper>
    </Container>
  );
};

export default Top;
