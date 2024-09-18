import { Alert, Button } from "@stellar/design-system";

import { Box } from "@/components/layout/Box";
import { STELLAR, WEBAUTH_CONTRACT } from "@/config/settings";
import { formatBigIntWithDecimals } from "@/helpers/formatBigIntWithDecimals";
import { truncateStr } from "@/helpers/truncateStr";
import { useBalance } from "@/query/useBalance";
import { useTransfer } from "@/query/useTransfer";
import { ContractSigner } from "@/types/types";
import { useWebAuth } from "@/query/useWebAuth";
import { Keypair } from "@stellar/stellar-sdk";

interface AccountBalanceProps {
  accountSigner: ContractSigner;
  contractId: string;
  tokenName: string;
}

export const AccountBalance: React.FC<AccountBalanceProps> = ({
  accountSigner,
  contractId,
  tokenName,
}: AccountBalanceProps) => {
  const {
    data: fetchBalanceResponse,
    mutate: fetchBalance,
    error: fetchBalanceError,
    isPending: isFetchBalancePending,
    reset: resetFetchBalance,
  } = useBalance();

  const {
    data: fetchTransferResponse,
    mutate: fetchTransfer,
    error: fetchTransferError,
    isPending: isFetchTransferPending,
    reset: resetFetchTransfer,
  } = useTransfer();

  const {
    data: fetchWebAuthResponse,
    mutate: fetchWebAuth,
    error: fetchWebAuthError,
    isPending: isFetchWebAuthPending,
    reset: resetFetchWebAuth,
  } = useWebAuth();

  const renderResponse = () => {
    if (fetchTransferError) {
      console.log(fetchTransferError);
    }
    if (fetchBalanceError) {
      console.log(fetchTransferResponse);
    }
    if (fetchWebAuthError) {
      console.log(fetchWebAuthError);
    }

    const title =
      fetchBalanceResponse !== undefined
        ? "Successfully fetched balance"
        : fetchTransferResponse !== undefined
        ? "Successfully transferred 1.0 XLM"
        : null;
    const balance = fetchBalanceResponse !== undefined ? fetchBalanceResponse : fetchTransferResponse;
    return (
      <>
        {balance !== undefined && title !== undefined ? (
          <Alert variant="success" placement="inline" title={title}>{`Balance: ${formatBigIntWithDecimals(
            balance,
            7,
          )} ${tokenName}`}</Alert>
        ) : null}

        {fetchWebAuthResponse ? (
          <Alert
            variant="success"
            placement="inline"
            title="Success"
          >{`WebAuth response successful? ${fetchWebAuthResponse}`}</Alert>
        ) : null}

        {fetchBalanceError ? (
          <Alert variant="error" placement="inline" title="Error">{`Error invoking token balance: ${JSON.stringify(
            fetchBalanceError,
          )}`}</Alert>
        ) : null}

        {fetchTransferError ? (
          <Alert variant="error" placement="inline" title="Error">{`Error invoking transfer: ${JSON.stringify(
            fetchTransferError,
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
          variant="secondary"
          onClick={() => {
            resetFetchWebAuth();
            resetFetchTransfer();
            fetchBalance({
              accountId: accountSigner.addressId,
              contractId,
            });
          }}
          isLoading={isFetchBalancePending}
          disabled={isFetchTransferPending}
        >
          Invoke token balance
        </Button>
        <Button
          size="md"
          variant="secondary"
          onClick={() => {
            resetFetchWebAuth();
            resetFetchBalance();
            fetchTransfer({
              contractId,
              fromAccId: accountSigner.addressId,
              toAccId: toAcc,
              amount: stroopsAmount.toString(),
              signer: accountSigner,
            });
          }}
          isLoading={isFetchTransferPending}
          disabled={isFetchBalancePending}
        >
          Transfer {amount} to {toAccTruncated}
        </Button>

        <Button
          size="md"
          variant="secondary"
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
          disabled={isFetchBalancePending || isFetchTransferPending}
        >
          WebAuth
        </Button>

        <Button
          size="md"
          variant="tertiary"
          onClick={() => {
            resetFetchBalance();
            resetFetchTransfer();
            resetFetchWebAuth();
          }}
          disabled={
            isFetchBalancePending ||
            isFetchTransferPending ||
            (!(fetchBalanceResponse || fetchBalanceError) && !(fetchTransferResponse || fetchTransferError))
          }
        >
          Clear
        </Button>
      </Box>

      <>{renderResponse()}</>
    </Box>
  );
};
