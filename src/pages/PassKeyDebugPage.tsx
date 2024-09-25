import { Alert, Button, Heading } from "@stellar/design-system";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { Box } from "@/components/layout/Box";
import { useRegisterPasskey } from "@/query/useRegisterPasskey";
import { useContractSignerStore } from "@/store/useContractSignerStore";
import { useTokenStore } from "@/store/useTokenStore";
import { useConnectPasskey } from "@/query/useConnectPasskey";

export const PassKeyDebugPage = () => {
  const navigate = useNavigate();

  const { contractSigner } = useContractSignerStore();
  const { tokenInfo } = useTokenStore();
  useEffect(() => {
    if (!contractSigner || !tokenInfo) {
      navigate("/");
    }
  }, []);

  const {
    data: registerPasskeyResponse,
    mutate: registerPasskey,
    error: registerPasskeyError,
    isPending: isRegisterPasskeyPending,
    reset: resetRegisterPasskey,
  } = useRegisterPasskey();

  const {
    data: connectPasskeyResponse,
    mutate: connectPasskey,
    error: connectPasskeyError,
    isPending: isConnectPasskeyPending,
    reset: resetConnectPasskey,
  } = useConnectPasskey();

  // TODO: set contractSigner when we have the response
  // useEffect(() => {
  //   if (!!registerPasskeyResponse) {
  //     setContractSigner({
  //       addressId: registerPasskeyResponse,
  //       method:
  //     });
  //   }
  // }, [registerPasskeyResponse]);

  const renderResponse = () => {
    if (registerPasskeyError !== null) {
      console.log(registerPasskeyError);
    }

    return (
      <>
        {registerPasskeyError ? (
          <Alert variant="error" placement="inline" title="Error">{`Error registering passkey: ${JSON.stringify(
            registerPasskeyError,
          ).toString()}`}</Alert>
        ) : null}

        {registerPasskeyResponse ? (
          <Alert variant="success" placement="inline" title={"Success!"}>
            {`✅ Passkey Registered (ContractID: ${registerPasskeyResponse.contractId}, KeyID: ${registerPasskeyResponse.keyId})`}
          </Alert>
        ) : null}

        {connectPasskeyError ? (
          <Alert variant="error" placement="inline" title="Error">{`Error connecting passkey: ${JSON.stringify(
            connectPasskeyError,
          ).toString()}`}</Alert>
        ) : null}

        {connectPasskeyResponse ? (
          <Alert variant="success" placement="inline" title={"Success!"}>
            {`✅ Passkey Connected (ContractID: ${connectPasskeyResponse.contractId}, KeyID: ${connectPasskeyResponse.keyId})`}
          </Alert>
        ) : null}
      </>
    );
  };

  return (
    <Box gap="lg">
      <Heading size="md" as="h2">
        Passkey Debugger
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
            const userName = prompt("Give this passkey a name", "passkey-marcelo-localhost");
            console.log("userName", userName);
            if (userName) {
              registerPasskey({
                projectName: "Meridian 2024 Smart Wallet!",
                userName,
              });
            }
          }}
          isLoading={isRegisterPasskeyPending}
          disabled={isConnectPasskeyPending}
        >
          Register Passkey
        </Button>

        <Button
          size="md"
          variant="secondary"
          onClick={() => {
            connectPasskey();
          }}
          isLoading={isConnectPasskeyPending}
          disabled={isRegisterPasskeyPending}
        >
          Connect Passkey
        </Button>

        <Button
          size="md"
          variant="tertiary"
          onClick={() => {
            resetRegisterPasskey();
            resetConnectPasskey();
          }}
          disabled={
            (isRegisterPasskeyPending || !(registerPasskeyResponse || registerPasskeyError)) &&
            (isConnectPasskeyPending || !(connectPasskeyResponse || connectPasskeyError))
          }
        >
          Clear
        </Button>
      </Box>

      <>{renderResponse()}</>
    </Box>
  );
};
