import { useEffect } from "react";
import { Heading } from "@stellar/design-system";
import { Keypair } from "@stellar/stellar-sdk";

import { Box } from "@/components/layout/Box";
import { RouterLink } from "@/components/RouterLink";
import { C_ACCOUNT_ED25519_SIGNER, TOKEN_CONTRACT } from "@/config/settings";
import { useContractSignerStore } from "@/store/useContractSignerStore";
import { useTokenStore } from "@/store/useTokenStore";

export const Home = () => {
  // Populate Store with default values
  const { contractSigner, setContractSigner } = useContractSignerStore();
  const { tokenInfo, setTokenInfo } = useTokenStore();
  useEffect(() => {
    setContractSigner({
      addressId: C_ACCOUNT_ED25519_SIGNER.PUBLIC_KEY,
      method: Keypair.fromSecret(C_ACCOUNT_ED25519_SIGNER.PRIVATE_KEY),
    });

    setTokenInfo({
      contractId: TOKEN_CONTRACT.NATIVE,
      name: "XLM",
    });
  }, []);

  return (
    <Box gap="lg">
      <Heading size="md" as="h2">
        {contractSigner?.addressId || "No account selected"}
      </Heading>
      <RouterLink to="/token" variant="primary">
        Token Debugger ({tokenInfo?.name})
      </RouterLink>
      <RouterLink to="/sep10c" variant="primary">
        SEP-10c Debugger
      </RouterLink>
      <RouterLink to="/passkey" variant="primary">
        Passkey Debugger
      </RouterLink>
    </Box>
  );
};
