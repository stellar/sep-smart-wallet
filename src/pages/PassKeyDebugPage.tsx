import { Alert, Button, Heading } from "@stellar/design-system";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { Box } from "@/components/layout/Box";
import { useRegisterPasskey } from "@/query/useRegisterPasskey";
import { useContractSignerStore } from "@/store/useContractSignerStore";
import { useTokenStore } from "@/store/useTokenStore";

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
    isPending: isregisterPasskeyPending,
    reset: resetregisterPasskey,
  } = useRegisterPasskey();

  const renderResponse = () => {
    if (registerPasskeyError !== null) {
      console.log(registerPasskeyError);
    }

    return (
      <>
        {registerPasskeyError ? (
          <Alert variant="error" placement="inline" title="Error">{`Error invoking token balance: ${JSON.stringify(
            registerPasskeyError,
          )}`}</Alert>
        ) : null}

        {registerPasskeyResponse ? (
          <Alert variant="success" placement="inline" title={"Success!"}>
            {`✅ Passkey Registered (ContractID: ${registerPasskeyResponse.contractId}, KeyID: ${registerPasskeyResponse.keyId})`}
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
          isLoading={isregisterPasskeyPending}
        >
          Register Passkey
        </Button>

        <Button
          size="md"
          variant="tertiary"
          onClick={() => {
            resetregisterPasskey();
          }}
          disabled={isregisterPasskeyPending || !(registerPasskeyResponse || registerPasskeyError)}
        >
          Clear
        </Button>
      </Box>

      <>{renderResponse()}</>
    </Box>
  );
};
