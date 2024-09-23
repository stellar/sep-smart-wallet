import { Alert, Button, Heading } from "@stellar/design-system";
import { Keypair } from "@stellar/stellar-sdk";
import { useNavigate } from "react-router-dom";

import { Box } from "@/components/layout/Box";
import { C_ACCOUNT_ED25519_SIGNER } from "@/config/settings";
import { useGetSEP10cChallenge } from "@/query/useGetSEP10cChallenge";
import { ContractSigner } from "@/types/types";
import { useSignGetSEP10cChallenge } from "@/query/useSignGetSEP10cChallenge";

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
    isPending: isFetchGetSEP10cChallengePending,
    reset: resetFetchGetSEP10cChallenge,
  } = useGetSEP10cChallenge();

  const {
    data: fetchSignGetSEP10cChallengeResponse,
    mutate: fetchSignGetSEP10cChallenge,
    error: fetchSignGetSEP10cChallengeError,
    isPending: isfetchSignGetSEP10cChallengePending,
    reset: resetfetchSignGetSEP10cChallenge,
  } = useSignGetSEP10cChallenge();

  const renderResponse = () => {
    return (
      <>
        {fetchGetSEP10cChallengeError && (
          <Alert
            variant="error"
            placement="inline"
            title="Error"
          >{`Error fetching SEP-10c Challenge: ${fetchGetSEP10cChallengeError}`}</Alert>
        )}

        {fetchGetSEP10cChallengeResponse && (
          <Alert variant="success" placement="inline" title="Success">{`✅ (1/3) SEP-10c challenge fetched`}</Alert>
        )}

        {fetchSignGetSEP10cChallengeError && (
          <Alert
            variant="error"
            placement="inline"
            title="Error"
          >{`Error signing SEP-10c Challenge: ${fetchSignGetSEP10cChallengeError}`}</Alert>
        )}

        {fetchSignGetSEP10cChallengeResponse && (
          <Alert
            variant="success"
            placement="inline"
            title="Success"
          >{`✅ (2/3) SEP-10c challenge signed. Credentials: ${fetchSignGetSEP10cChallengeResponse}`}</Alert>
        )}
      </>
    );
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
          isLoading={isFetchGetSEP10cChallengePending}
        >
          Fetch SEP-10c Challenge
        </Button>
        <Button
          size="md"
          variant="secondary"
          onClick={() => {
            fetchSignGetSEP10cChallenge({
              authEntry: fetchGetSEP10cChallengeResponse!.authorization_entry,
              signer: accountSigner,
            });
          }}
          isLoading={isfetchSignGetSEP10cChallengePending}
          disabled={!fetchGetSEP10cChallengeResponse}
        >
          Sign Challenge
        </Button>
        <Button
          size="md"
          variant="tertiary"
          onClick={() => {
            resetFetchGetSEP10cChallenge();
            resetfetchSignGetSEP10cChallenge();
          }}
          disabled={
            (isFetchGetSEP10cChallengePending || !(fetchGetSEP10cChallengeResponse || fetchGetSEP10cChallengeError)) &&
            (isfetchSignGetSEP10cChallengePending ||
              !(fetchSignGetSEP10cChallengeResponse || fetchSignGetSEP10cChallengeError))
          }
        >
          Clear
        </Button>
      </Box>

      <>{renderResponse()}</>
    </Box>
  );
};
