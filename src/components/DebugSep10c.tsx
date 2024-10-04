import { useEffect, useState } from "react";
import { Button, Notification } from "@stellar/design-system";

import { useGetSEP10cChallenge } from "@/query/useGetSEP10cChallenge";
import { useSignGetSEP10cChallenge } from "@/query/useSignGetSEP10cChallenge";
import { usePostSEP10cChallenge } from "@/query/usePostSEP10cChallenge";

import { useDemoStore } from "@/store/useDemoStore";
import { SEP10cClientMock } from "@/services/clients/SEP10cClientMock";
import { SEP10cClientToml } from "@/services/clients/SEP10cClientToml";

import { ButtonsBar } from "@/components/ButtonsBar";
import { Box } from "@/components/layout/Box";

import { SEP10cClient } from "@/types/types";

export const DebugSep10c = () => {
  const { contractSigner, tomlDomain } = useDemoStore();

  const [sep10cClient, setSep10cClient] = useState<SEP10cClient>(SEP10cClientMock.getInstance());

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

  useEffect(() => {
    if (tomlDomain) {
      setSep10cClient(new SEP10cClientToml(tomlDomain));
    } else {
      setSep10cClient(SEP10cClientMock.getInstance());
    }
  }, [tomlDomain]);

  const contractSignerAddressId = contractSigner?.addressId || "";

  const maybeResetSignAndPost = () => {
    if (signSEP10cChallengeResponse) {
      resetSignSEP10cChallenge();
    }

    if (postSEP10cChallengeResponse) {
      resetPostSEP10cChallenge();
    }
  };

  const renderResponse = () => {
    return (
      <>
        {/* Post signed challenge: success */}
        {postSEP10cChallengeResponse ? (
          <Notification
            variant="success"
            isFilled
            title={`(3/3) SEP-10c challenge successfully posted. Token: ${postSEP10cChallengeResponse}`}
          />
        ) : null}
        {/* Post signed challenge: error */}
        {postSEP10cChallengeError ? (
          <Notification
            variant="error"
            isFilled
            title={`(3/3) Error posting SEP-10c Challenge: ${postSEP10cChallengeError}`}
          />
        ) : null}

        {/* Sign challenge: success */}
        {signSEP10cChallengeResponse ? (
          <Notification
            variant="success"
            isFilled
            title={`(2/3) SEP-10c challenge signed. Credentials: ${signSEP10cChallengeResponse}`}
          />
        ) : null}
        {/* Sign challenge: error */}
        {signSEP10cChallengeError ? (
          <Notification
            variant="error"
            isFilled
            title={`(2/3) Error signing SEP-10c Challenge: ${signSEP10cChallengeError}`}
          />
        ) : null}

        {/* Fetch challenge: success */}
        {getSEP10cChallengeResponse ? (
          <Notification variant="success" isFilled title="(1/3) SEP-10c challenge successfully fetched" />
        ) : null}
        {/* Fetch challenge: error */}
        {getSEP10cChallengeError ? (
          <Notification
            variant="error"
            isFilled
            title={`(1/3) Error signing SEP-10c Challenge: ${getSEP10cChallengeError}`}
          />
        ) : null}
      </>
    );
  };

  return (
    <Box gap="sm" addlClassName="DebuggerCard">
      <ButtonsBar
        left={
          <>
            <Button
              size="md"
              variant="tertiary"
              disabled={!contractSignerAddressId || isSignSEP10cChallengePending || isPostSEP10cChallengePending}
              isLoading={isGetSEP10cChallengePending}
              onClick={() => {
                maybeResetSignAndPost();

                if (contractSignerAddressId) {
                  getSEP10cChallenge({
                    address: contractSignerAddressId,
                    sep10cClient,
                  });
                }
              }}
            >
              Fetch SEP-10c Challenge
            </Button>

            {getSEP10cChallengeResponse && contractSigner ? (
              <>
                <Button
                  size="md"
                  variant="tertiary"
                  isLoading={isSignSEP10cChallengePending}
                  disabled={isPostSEP10cChallengePending}
                  onClick={() => {
                    resetPostSEP10cChallenge();

                    signSEP10cChallenge({
                      authEntry: getSEP10cChallengeResponse.authorization_entry,
                      signer: contractSigner,
                      sep10cClient,
                    });
                  }}
                >
                  Sign Challenge
                </Button>

                <Button
                  size="md"
                  variant="tertiary"
                  isLoading={isPostSEP10cChallengePending}
                  disabled={!signSEP10cChallengeResponse}
                  onClick={() => {
                    if (signSEP10cChallengeResponse) {
                      postSEP10cChallenge({
                        req: {
                          authorization_entry: getSEP10cChallengeResponse.authorization_entry,
                          server_signature: getSEP10cChallengeResponse.server_signature,
                          credentials: [signSEP10cChallengeResponse],
                        },
                        sep10cClient,
                      });
                    }
                  }}
                >
                  Post Signed Challenge
                </Button>
              </>
            ) : null}
          </>
        }
        right={
          getSEP10cChallengeResponse || getSEP10cChallengeError ? (
            <Button
              size="md"
              variant="error"
              onClick={() => {
                resetGetSEP10cChallenge();
                maybeResetSignAndPost();
              }}
            >
              Clear
            </Button>
          ) : undefined
        }
      />

      {renderResponse()}
    </Box>
  );
};
