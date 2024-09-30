import { useEffect, useState } from "react";
import { Alert, Button, Heading } from "@stellar/design-system";

import { Box } from "@/components/layout/Box";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import { C_ACCOUNT_ED25519_SIGNER } from "@/config/settings";
import { useContractSignerStore } from "@/store/useContractSignerStore";
import { useWebAuth } from "@/query/useWebAuth";
import { AuthEntrySigner } from "@/services/AuthEntrySigner";

export const UserAccountConfig = () => {
  const defaultSignerAddressId = C_ACCOUNT_ED25519_SIGNER.PUBLIC_KEY;
  const defaultSignerSigningMethod: AuthEntrySigner = AuthEntrySigner.fromKeypairSecret(
    C_ACCOUNT_ED25519_SIGNER.PRIVATE_KEY,
  );

  // Populate Store with default values
  const { contractSigner, setContractSigner } = useContractSignerStore();

  const [isDefaultSignerModalVisible, setDefaultSignerModalVisible] = useState(false);
  const [isClearSignerModalVisible, setClearSignerModalVisible] = useState(false);

  const {
    data: execWebAuthResponse,
    mutate: execWebAuth,
    error: execWebAuthError,
    isPending: isExecWebAuthPending,
    reset: resetExecWebAuth,
  } = useWebAuth();

  useEffect(() => {
    resetExecWebAuth();
  }, [contractSigner]);

  const renderResponse = () => {
    if (execWebAuthError !== null) {
      console.error("execWebAuthError: ", execWebAuthError);
    }

    return (
      <>
        {execWebAuthError ? (
          <Alert variant="error" placement="inline" title="Error">{`Error invoking WebAuth: ${JSON.stringify(
            execWebAuthError,
          )}`}</Alert>
        ) : null}

        {execWebAuthResponse ? (
          <Alert
            variant="success"
            placement="inline"
            title="Success"
          >{`WebAuth response successful? ${execWebAuthResponse}`}</Alert>
        ) : null}
      </>
    );
  };

  return (
    <>
      <Box gap="lg">
        <Box gap="md" direction="row" align="center" justify="space-between">
          <Heading size="md" as="h3">
            Account: {contractSigner?.addressId || "No account selected"}
          </Heading>

          <Box gap="md" direction="row" align="center">
            <Button
              size="md"
              variant="primary"
              onClick={() => {
                setDefaultSignerModalVisible(true);
                resetExecWebAuth();
              }}
            >
              Set Default Account
            </Button>

            <Button
              size="md"
              variant="secondary"
              onClick={() => {
                execWebAuth({ signer: contractSigner! });
              }}
              disabled={!contractSigner || isExecWebAuthPending}
              isLoading={isExecWebAuthPending}
            >
              require_auth()
            </Button>

            <Button
              size="md"
              variant="destructive"
              onClick={() => {
                setClearSignerModalVisible(true);
                resetExecWebAuth();
              }}
              disabled={!contractSigner}
            >
              Logout
            </Button>
          </Box>
        </Box>

        <>{renderResponse()}</>
      </Box>

      <ConfirmationModal
        title="Set default signer"
        visible={isDefaultSignerModalVisible}
        onClose={() => setDefaultSignerModalVisible(false)}
        onConfirm={() => {
          setDefaultSignerModalVisible(false);
          setContractSigner({
            addressId: defaultSignerAddressId,
            method: defaultSignerSigningMethod,
          });
        }}
      >
        Are you sure you want to use the default signer?
      </ConfirmationModal>

      <ConfirmationModal
        title="Clear signer"
        visible={isClearSignerModalVisible}
        onClose={() => setClearSignerModalVisible(false)}
        onConfirm={() => {
          setClearSignerModalVisible(false);
          setContractSigner(null);
        }}
      >
        Are you sure you want to clear the stored signer?
      </ConfirmationModal>
    </>
  );
};
