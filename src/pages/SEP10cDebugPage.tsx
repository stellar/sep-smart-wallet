import { Alert, Button, Heading } from "@stellar/design-system";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Box } from "@/components/layout/Box";
import { useGetSEP10cChallenge } from "@/query/useGetSEP10cChallenge";
import { useSignGetSEP10cChallenge } from "@/query/useSignGetSEP10cChallenge";
import { usePostSEP10cChallenge } from "@/query/usePostSEP10cChallenge";
import { useContractSignerStore } from "@/store/useContractSignerStore";
import { SEP10cClient } from "@/types/types";
import { SEP10cClientMock } from "@/services/clients/SEP10cClientMock";
import { useTomlDomainStore } from "@/store/useTomlDomainStore";
import { SEP10cClientToml } from "@/services/clients/SEP10cClientToml";

export const SEP10cDebugPage = () => {
  const navigate = useNavigate();

  const [sep10cClient, setSep10cClient] = useState<SEP10cClient>(SEP10cClientMock.getInstance());
  const { tomlDomain } = useTomlDomainStore();
  useEffect(() => {
    if (!tomlDomain) {
      setSep10cClient(SEP10cClientMock.getInstance());
    } else {
      setSep10cClient(new SEP10cClientToml(tomlDomain));
    }
  }, [tomlDomain]);

  const { contractSigner } = useContractSignerStore();
  useEffect(() => {
    if (contractSigner === undefined) {
      navigate("/debug");
    }
  }, [contractSigner]);

  const {
    data: getSEP10cChallengeResponse,
    mutate: getSEP10cChallenge,
    error: getSEP10cChallengeError,
    isPending: isGetSEP10cChallengePending,
    reset: resetGetSEP10cChallenge,
  } = useGetSEP10cChallenge();

  const {
    data: signSEP10cChallengeResponse,
    mutate: signSEP10cChallenge,
    error: signSEP10cChallengeError,
    isPending: isSignSEP10cChallengePending,
    reset: resetSignSEP10cChallenge,
  } = useSignGetSEP10cChallenge();

  const {
    data: postSEP10cChallengeResponse,
    mutate: postSEP10cChallenge,
    error: postSEP10cChallengeError,
    isPending: isPostSEP10cChallengePending,
    reset: resetPostSEP10cChallenge,
  } = usePostSEP10cChallenge();

  const renderResponse = () => {
    return (
      <>
        {getSEP10cChallengeError && (
          <Alert
            variant="error"
            placement="inline"
            title="Error"
          >{`Error fetching SEP-10c Challenge: ${getSEP10cChallengeError}`}</Alert>
        )}

        {getSEP10cChallengeResponse && (
          <Alert variant="success" placement="inline" title="Success">{`✅ (1/3) SEP-10c challenge fetched`}</Alert>
        )}

        {signSEP10cChallengeError && (
          <Alert
            variant="error"
            placement="inline"
            title="Error"
          >{`Error signing SEP-10c Challenge: ${signSEP10cChallengeError}`}</Alert>
        )}

        {signSEP10cChallengeResponse && (
          <Alert
            variant="success"
            placement="inline"
            title="Success"
          >{`✅ (2/3) SEP-10c challenge signed. Credentials: ${signSEP10cChallengeResponse}`}</Alert>
        )}

        {postSEP10cChallengeError && (
          <Alert
            variant="error"
            placement="inline"
            title="Error"
          >{`Error posting SEP-10c Challenge: ${postSEP10cChallengeError}`}</Alert>
        )}

        {postSEP10cChallengeResponse && (
          <Alert
            variant="success"
            placement="inline"
            title="Success 🎉🎉🎉🎉"
          >{`✅ (3/3) SEP-10c challenge posted. Token: ${postSEP10cChallengeResponse}`}</Alert>
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
            navigate("/debug");
          }}
        >
          Back to Home
        </Button>

        <Button
          size="md"
          variant="secondary"
          onClick={() => {
            resetSignSEP10cChallenge();
            resetPostSEP10cChallenge();
            getSEP10cChallenge({
              address: contractSigner!.addressId,
              sep10cClient,
            });
          }}
          isLoading={isGetSEP10cChallengePending}
        >
          Fetch SEP-10c Challenge
        </Button>

        <Button
          size="md"
          variant="secondary"
          onClick={() => {
            signSEP10cChallenge({
              authEntry: getSEP10cChallengeResponse!.authorization_entry,
              signer: contractSigner!,
              sep10cClient,
            });
            resetPostSEP10cChallenge();
          }}
          isLoading={isSignSEP10cChallengePending}
          disabled={!getSEP10cChallengeResponse}
        >
          Sign Challenge
        </Button>

        <Button
          size="md"
          variant="secondary"
          onClick={() => {
            postSEP10cChallenge({
              req: {
                authorization_entry: getSEP10cChallengeResponse!.authorization_entry,
                server_signature: getSEP10cChallengeResponse!.server_signature,
                credentials: [signSEP10cChallengeResponse!],
              },
              sep10cClient,
            });
          }}
          isLoading={isPostSEP10cChallengePending}
          disabled={!signSEP10cChallengeResponse}
        >
          Post Signed Challenge
        </Button>

        <Button
          size="md"
          variant="tertiary"
          onClick={() => {
            resetGetSEP10cChallenge();
            resetSignSEP10cChallenge();
            resetPostSEP10cChallenge();
          }}
          disabled={
            (isGetSEP10cChallengePending || !(getSEP10cChallengeResponse || getSEP10cChallengeError)) &&
            (isSignSEP10cChallengePending || !(signSEP10cChallengeResponse || signSEP10cChallengeError)) &&
            (isPostSEP10cChallengePending || !(postSEP10cChallengeResponse || postSEP10cChallengeError))
          }
        >
          Clear
        </Button>
      </Box>

      <>{renderResponse()}</>
    </Box>
  );
};
