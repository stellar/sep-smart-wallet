import { useNavigate } from "react-router-dom";
import { Alert, Button, Heading } from "@stellar/design-system";
import { useStellarAccount } from "@/query/useStellarAcount";
import { Box } from "@/components/layout/Box";
import { STELLAR } from "@/config/settings";

const PUBLIC_KEY = "GAMQTINWD3YPP3GLTQZ4M6FKCCSRGROQLIIRVECIFC6VEGL5F64CND22";
// const PUBLIC_KEY = "GDB7YEJN44SX76U43ZWXZUBEENCHOARNN6HCNTCWOZHAS73LKVJ6GNJH";

export const SecondPage = () => {
  const navigate = useNavigate();
  const {
    data: fetchAccountResponse,
    mutate: fetchAccount,
    error: fetchAccountError,
    isPending: isFetchAccountPending,
    reset: resetFetchAccount,
  } = useStellarAccount();

  const renderResponse = () => {
    if (fetchAccountResponse) {
      return (
        <Alert
          variant="success"
          placement="inline"
          title="Success"
        >{`Account ${fetchAccountResponse.account_id} data fetched`}</Alert>
      );
    }

    if (fetchAccountError) {
      return (
        <Alert
          variant="error"
          placement="inline"
          title="Error"
        >{`Error fetching account ${PUBLIC_KEY}: ${fetchAccountError}`}</Alert>
      );
    }

    return null;
  };

  return (
    <Box gap="lg">
      <Heading size="md" as="h2">
        Second
      </Heading>

      <Box gap="md" direction="row" align="center">
        <Button
          size="md"
          variant="primary"
          onClick={() => {
            navigate("/debug");
          }}
        >
          Back to Home
        </Button>
        <Button
          size="md"
          variant="secondary"
          onClick={() => {
            fetchAccount({
              horizonUrl: STELLAR.HORIZON_URL,
              publicKey: PUBLIC_KEY,
            });
          }}
          isLoading={isFetchAccountPending}
        >
          Fetch account
        </Button>
        <Button
          size="md"
          variant="tertiary"
          onClick={() => {
            resetFetchAccount();
          }}
          disabled={isFetchAccountPending || !(fetchAccountResponse || fetchAccountError)}
        >
          Clear
        </Button>
      </Box>

      <>{renderResponse()}</>
    </Box>
  );
};
