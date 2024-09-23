import { Alert, Button, Heading } from "@stellar/design-system";
import { Keypair } from "@stellar/stellar-sdk";
import { useNavigate } from "react-router-dom";

import { Box } from "@/components/layout/Box";
import { C_ACCOUNT_ED25519_SIGNER } from "@/config/settings";
import { useGetSEP10cChallenge } from "@/query/useGetSEP10cChallenge";
import { ContractSigner } from "@/types/types";

export const SEP10cDebugger = () => {
  const accountSigner: ContractSigner = {
    addressId: C_ACCOUNT_ED25519_SIGNER.PUBLIC_KEY,
    method: Keypair.fromSecret(C_ACCOUNT_ED25519_SIGNER.PRIVATE_KEY),
  };

  const navigate = useNavigate();
  const {
    data: fetchGetSEP10cChallengeResponse,
    mutate: fetchGetSEP10cChallenge,
    error: fetchGetSEP10cChallengeError,
    isPending: isfetchGetSEP10cChallengePending,
    reset: resetfetchGetSEP10cChallenge,
  } = useGetSEP10cChallenge();

  const renderResponse = () => {
    console.log(fetchGetSEP10cChallengeResponse);

    if (fetchGetSEP10cChallengeResponse) {
      return (
        <Alert
          variant="success"
          placement="inline"
          title="Success"
        >{`Account ${fetchGetSEP10cChallengeResponse} data fetched`}</Alert>
      );
    }

    if (fetchGetSEP10cChallengeError) {
      return (
        <Alert
          variant="error"
          placement="inline"
          title="Error"
        >{`Error fetching SEP-10c Challenge: ${fetchGetSEP10cChallengeError}`}</Alert>
      );
    }

    return null;
  };

  return (
    <Box gap="lg">
      <Heading size="md" as="h2">
        SEP-10c Debugger
      </Heading>

      <Box gap="md" direction="row" align="center">
        <Button
          size="md"
          variant="primary"
          onClick={() => {
            navigate("/");
          }}
        >
          Back to Home
        </Button>
        <Button
          size="md"
          variant="secondary"
          onClick={() => {
            fetchGetSEP10cChallenge({
              account: accountSigner.addressId,
            });
          }}
          isLoading={isfetchGetSEP10cChallengePending}
        >
          Fetch SEP-10c Challenge
        </Button>
        <Button
          size="md"
          variant="tertiary"
          onClick={resetfetchGetSEP10cChallenge}
          disabled={
            isfetchGetSEP10cChallengePending || !(fetchGetSEP10cChallengeResponse || fetchGetSEP10cChallengeError)
          }
        >
          Clear
        </Button>
      </Box>

      <>{renderResponse()}</>
    </Box>
  );
};
