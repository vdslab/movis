import { Box } from "@mui/material";
import Image from "next/image";
import { memo } from "react";

import { Link } from "@/components/Link";

// ゴミ処理　面倒でLogo以外の要素も持たせてある
export const Logo = memo(function Logo() {
  return (
    <Box sx={{ px: 3 }}>
      <Link href="/" passHref>
        <Image src="/movis.svg" alt="movisロゴ" width="100" height="50" />
      </Link>
    </Box>
  );
});
