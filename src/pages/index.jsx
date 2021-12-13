import { Container } from "@mui/material";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";

const Top = (props) => {
  const { register, handleSubmit } = useForm();
  const router = useRouter();

  return <Container maxWidth="sm" sx={{ pt: 5 }}></Container>;
};

export default Top;
