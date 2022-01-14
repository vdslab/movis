import { Box } from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import { memo } from "react";

// ゴミ処理　面倒でLogo以外の要素も持たせてある
export const Logo = memo(function Logo() {
  return (
    <Box sx={{ px: 3 }}>
      <Link href="/" passHref>
        <a>
          <Image src="/movis.svg" alt="movisロゴ" width="100" height="50" />
        </a>
      </Link>
    </Box>
  );
});
