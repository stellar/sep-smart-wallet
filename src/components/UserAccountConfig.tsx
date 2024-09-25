import { useState } from "react";
import { Button, Heading } from "@stellar/design-system";
import { Keypair } from "@stellar/stellar-sdk";

import { Box } from "@/components/layout/Box";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import { C_ACCOUNT_ED25519_SIGNER } from "@/config/settings";
import { useContractSignerStore } from "@/store/useContractSignerStore";

export const UserAccountConfig = () => {
  const defaultSignerAddressId = C_ACCOUNT_ED25519_SIGNER.PUBLIC_KEY;
  const defaultSignerSigningMethod = Keypair.fromSecret(C_ACCOUNT_ED25519_SIGNER.PRIVATE_KEY);

  // Populate Store with default values
  const { contractSigner, setContractSigner } = useContractSignerStore();

  const [isDefaultSignerModalVisible, setDefaultSignerModalVisible] = useState(false);
  const [isClearSignerModalVisible, setClearSignerModalVisible] = useState(false);

  return (
    <>
      <Box gap="lg">
        <Box gap="md" direction="row" align="center" justify="space-between">
          <Heading size="md" as="h3">
            AccountID: {contractSigner?.addressId || "No account selected"}
          </Heading>

          <Box gap="md" direction="row" align="center">
            <Button
              size="md"
              variant="primary"
              onClick={() => {
                setDefaultSignerModalVisible(true);
              }}
            >
              Set Default
            </Button>

            <Button
              size="md"
              variant="secondary"
              onClick={() => {
                alert("TODO: not implemented yet");
              }}
              disabled={!contractSigner}
            >
              WebAuth
            </Button>

            <Button
              size="md"
              variant="destructive"
              onClick={() => {
                setClearSignerModalVisible(true);
              }}
              disabled={!contractSigner}
            >
              Clear
            </Button>
          </Box>
        </Box>
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
