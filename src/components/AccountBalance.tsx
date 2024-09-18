import { Alert, Button } from "@stellar/design-system";

import { Box } from "@/components/layout/Box";
import { STELLAR } from "@/config/settings";
import { formatBigIntWithDecimals } from "@/helpers/formatBigIntWithDecimals";
import { truncateStr } from "@/helpers/truncateStr";
import { useBalance } from "@/query/useBalance";
import { useTransfer } from "@/query/useTransfer";
import { ContractSigner } from "@/types/types";

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

  const renderResponse = () => {
    if (fetchTransferError) {
      console.log(fetchTransferError);
    }
    if (fetchBalanceError) {
      console.log(fetchTransferResponse);
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
