import { Alert, Button } from "@stellar/design-system";
import { Keypair, scValToBigInt } from "@stellar/stellar-sdk";

import { Box } from "@/components/layout/Box";
import { SOURCE_ACCOUNT_PUBLIC_KEY } from "@/config/settings";
import { formatBigIntWithDecimals } from "@/helpers/formatBigIntWithDecimals";
import { truncateStr } from "@/helpers/truncateStr";
import { useBalance } from "@/query/useBalance";
import { useTransfer } from "@/query/useTransfer";

interface AccountBalanceProps {
  accountKP: Keypair;
  contractId: string;
  tokenName: string;
}

export const AccountBalance: React.FC<AccountBalanceProps> = ({
  accountKP,
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

  const renderResponse = () => {
    if (fetchTransferError) {
      console.log(fetchTransferError);
    }
    if (fetchBalanceError) {
      console.log(fetchTransferResponse);
    }

    const title = fetchBalanceResponse
      ? "Successfully fetched balance"
      : fetchTransferResponse
      ? "Successfully transferred 1.0 XLM"
      : null;
    const balance = fetchBalanceResponse || fetchTransferResponse;
    return (
      <>
        {balance && title ? (
          <Alert variant="success" placement="inline" title={title}>{`Balance: ${formatBigIntWithDecimals(
            balance,
            7,
          )} ${tokenName}`}</Alert>
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
      </>
    );
  };

  const toAcc = SOURCE_ACCOUNT_PUBLIC_KEY;
  const toAccTruncated = truncateStr(toAcc, 4);

  return (
    <Box gap="lg">
      <Box gap="md" direction="row" align="center">
        <Button
          size="md"
          variant="secondary"
          onClick={() => {
            resetFetchTransfer();
            fetchBalance({
              accountId: accountKP.publicKey(),
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
            resetFetchBalance();
            fetchTransfer({
              contractId,
              fromAccId: accountKP.publicKey(),
              toAccId: toAcc,
              amount: "10000000",
              signer: {
                addressId: accountKP.publicKey(),
                method: accountKP,
              },
            });
          }}
          isLoading={isFetchTransferPending}
          disabled={isFetchBalancePending}
        >
          Transfer 1.0 to {toAccTruncated}
        </Button>
        <Button
          size="md"
          variant="tertiary"
          onClick={() => {
            resetFetchBalance();
            resetFetchTransfer();
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
