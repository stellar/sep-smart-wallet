import { Alert, Button } from "@stellar/design-system";

import { Box } from "@/components/layout/Box";
import { STELLAR, WEBAUTH_CONTRACT } from "@/config/settings";
import { truncateStr } from "@/helpers/truncateStr";
import { useTransfer } from "@/query/useTransfer";
import { ContractSigner } from "@/types/types";
import { useWebAuth } from "@/query/useWebAuth";
import { Keypair } from "@stellar/stellar-sdk";
import { useRegisterPasskey } from "@/query/useRegisterPasskey";

interface PassKeyManagerProps {
  accountSigner: ContractSigner;
  contractId: string;
  tokenName: string;
}

export const PassKeyManager: React.FC<PassKeyManagerProps> = ({ accountSigner, contractId }: PassKeyManagerProps) => {
  const {
    data: registerPasskeyResponse,
    mutate: registerPasskey,
    error: registerPasskeyError,
    isPending: isregisterPasskeyPending,
    reset: resetregisterPasskey,
  } = useRegisterPasskey();

  const {
    data: connectPasskeyResponse,
    mutate: connectPasskey,
    error: connectPasskeyError,
    isPending: isconnectPasskeyPending,
    reset: resetconnectPasskey,
  } = useTransfer();

  const {
    data: fetchWebAuthResponse,
    mutate: fetchWebAuth,
    error: fetchWebAuthError,
    isPending: isFetchWebAuthPending,
    reset: resetFetchWebAuth,
  } = useWebAuth();

  const renderResponse = () => {
    if (connectPasskeyError !== null) {
      console.log(connectPasskeyError);
    }
    if (registerPasskeyError !== null) {
      console.log(registerPasskeyError);
    }
    if (fetchWebAuthError !== null) {
      console.log(fetchWebAuthError);
    }

    return (
      <>
        {registerPasskeyResponse ? (
          <Alert variant="success" placement="inline" title={"Success!"}>
            {"Passkey Registered ✅"}
          </Alert>
        ) : null}

        {fetchWebAuthResponse ? (
          <Alert
            variant="success"
            placement="inline"
            title="Success"
          >{`WebAuth response successful? ${fetchWebAuthResponse}`}</Alert>
        ) : null}

        {registerPasskeyError ? (
          <Alert variant="error" placement="inline" title="Error">{`Error invoking token balance: ${JSON.stringify(
            registerPasskeyError,
          )}`}</Alert>
        ) : null}

        {connectPasskeyError ? (
          <Alert variant="error" placement="inline" title="Error">{`Error invoking transfer: ${JSON.stringify(
            connectPasskeyError,
          )}`}</Alert>
        ) : null}

        {fetchWebAuthError ? (
          <Alert variant="error" placement="inline" title="Error">{`Error invoking WebAuth: ${JSON.stringify(
            fetchWebAuthError,
          )}`}</Alert>
        ) : null}
      </>
    );
  };

  const toAcc = STELLAR.SOURCE_ACCOUNT.PUBLIC_KEY;
  const toAccTruncated = truncateStr(toAcc, 4);
  const amount: number = 1;
  const stroopsAmount = BigInt(amount) * BigInt(10 ** 7);

  return (
    <Box gap="lg">
      <Box gap="md" direction="row" align="center">
        <Button
          size="md"
          variant="primary"
          onClick={() => {
            const userName = prompt("Give this passkey a name", "passkey-marcelo-localhost");
            console.log("userName", userName);
            if (userName) {
              resetFetchWebAuth();
              resetconnectPasskey();
              registerPasskey({
                projectName: "Meridian 2024 Smart Wallet!",
                userName,
              });
            }
          }}
          isLoading={isregisterPasskeyPending}
          disabled={isconnectPasskeyPending}
        >
          Register Passkey
        </Button>
        <Button
          size="md"
          variant="primary"
          onClick={() => {
            resetFetchWebAuth();
            resetregisterPasskey();
            connectPasskey({
              contractId,
              fromAccId: accountSigner.addressId,
              toAccId: toAcc,
              amount: stroopsAmount.toString(),
              signer: accountSigner,
            });
          }}
          isLoading={isconnectPasskeyPending}
          disabled={isregisterPasskeyPending}
        >
          Transfer {amount} to {toAccTruncated}
        </Button>

        <Button
          size="md"
          variant="primary"
          onClick={() => {
            fetchWebAuth({
              contractId: WEBAUTH_CONTRACT.ID,
              signer: {
                addressId: WEBAUTH_CONTRACT.SIGNER.PUBLIC_KEY,
                method: Keypair.fromSecret(WEBAUTH_CONTRACT.SIGNER.PRIVATE_KEY),
              },
            });
          }}
          isLoading={isFetchWebAuthPending}
          disabled={isregisterPasskeyPending || isconnectPasskeyPending}
        >
          WebAuth
        </Button>

        <Button
          size="md"
          variant="tertiary"
          onClick={() => {
            resetregisterPasskey();
            resetconnectPasskey();
            resetFetchWebAuth();
          }}
          disabled={
            isregisterPasskeyPending ||
            isconnectPasskeyPending ||
            (!(registerPasskeyResponse || registerPasskeyError) && !(connectPasskeyResponse || connectPasskeyError))
          }
        >
          Clear
        </Button>
      </Box>

      <>{renderResponse()}</>
    </Box>
  );
};
