import { Box } from "@mui/material";
import Image from "next/image";

import { Link } from "@/components/Link";

export const Logo = () => {
  return (
    <Box sx={{ px: 3 }}>
      <Link href="/">
        <a>
          <Image src="/movis.svg" alt="movisロゴ" width="100" height="50" />
        </a>
      </Link>
    </Box>
  );
};
