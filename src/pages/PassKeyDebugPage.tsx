import { Alert, Button, Heading } from "@stellar/design-system";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { Box } from "@/components/layout/Box";
import { PASSKEY } from "@/config/settings";
import { useRegisterPasskey } from "@/query/useRegisterPasskey";
import { useContractSignerStore } from "@/store/useContractSignerStore";
import { useConnectPasskey } from "@/query/useConnectPasskey";
import { AuthEntrySigner } from "@/services/AuthEntrySigner";

export const PassKeyDebugPage = () => {
  const navigate = useNavigate();

  const { setContractSigner } = useContractSignerStore();

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

  useEffect(() => {
    if (connectPasskeyResponse !== undefined) {
      setContractSigner({
        addressId: connectPasskeyResponse.contractId,
        method: AuthEntrySigner.fromPasskeyKeyId(connectPasskeyResponse.keyId),
      });
    }
  }, [connectPasskeyResponse]);
  useEffect(() => {
    if (registerPasskeyResponse !== undefined) {
      setContractSigner({
        addressId: registerPasskeyResponse.contractId,
        method: AuthEntrySigner.fromPasskeyKeyId(registerPasskeyResponse.keyId),
      });
    }
  }, [registerPasskeyResponse]);

  const renderResponse = () => {
    if (registerPasskeyError !== null) {
      console.error("registerPasskeyError: ", registerPasskeyError);
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
            {`✅ Passkey Registered (ContractId: ${registerPasskeyResponse.contractId}, KeyID: ${registerPasskeyResponse.keyId})`}
          </Alert>
        ) : null}

        {connectPasskeyError ? (
          <Alert variant="error" placement="inline" title="Error">{`Error connecting passkey: ${JSON.stringify(
            connectPasskeyError,
          ).toString()}`}</Alert>
        ) : null}

        {connectPasskeyResponse ? (
          <Alert variant="success" placement="inline" title={"Success!"}>
            {`✅ Passkey Connected (ContractId: ${connectPasskeyResponse.contractId}, KeyID: ${connectPasskeyResponse.keyId})`}
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
            navigate("/debug");
          }}
        >
          Back to Home
        </Button>

        <Button
          size="md"
          variant="secondary"
          onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
            const userName = prompt("Give this passkey a name", PASSKEY.DEFAULT_NAME);
            if (userName) {
              resetConnectPasskey();
              registerPasskey({
                projectName: PASSKEY.PROJECT_NAME,
                userName,
              });
            } else {
              (e.target as HTMLButtonElement).blur();
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
            resetRegisterPasskey();
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
