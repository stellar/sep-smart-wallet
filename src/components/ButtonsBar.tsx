import { Box } from "@/components/layout/Box";

export const ButtonsBar = ({ left, right }: { left?: React.ReactNode; right?: React.ReactNode }) => (
  <Box gap="sm" direction="row" align="center" justify="space-between">
    <>
      {left ? (
        <Box gap="sm" direction="row" align="center">
          <>{left}</>
        </Box>
      ) : null}
      {right ? (
        <Box gap="sm" direction="row" align="center" justify="end">
          <>{right}</>
        </Box>
      ) : null}
    </>
  </Box>
);
