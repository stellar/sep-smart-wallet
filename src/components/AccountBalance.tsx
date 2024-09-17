import { Alert, Button } from "@stellar/design-system";
import { Keypair, scValToBigInt } from "@stellar/stellar-sdk";

import { Box } from "@/components/layout/Box";
import { ACCOUNT_A_PRIVATE_KEY, SOURCE_ACCOUNT_PUBLIC_KEY } from "@/config/settings";
import { formatBigIntWithDecimals } from "@/helpers/formatBigIntWithDecimals";
import { truncateStr } from "@/helpers/truncateStr";
import { useContractBalance } from "@/query/useContractBalance";
import { useTransfer } from "@/query/useTransfer";

interface AccountBalanceProps {
  accountId: string;
  contractId: string;
  tokenName: string;
}

export const AccountBalance: React.FC<AccountBalanceProps> = ({
  accountId,
  contractId,
  tokenName,
}: AccountBalanceProps) => {
  const {
    data: fetchContractBalanceResponse,
    mutate: fetchContractBalance,
    error: fetchContractBalanceError,
    isPending: isFetchContractBalancePending,
    reset: resetFetchContractBalance,
  } = useContractBalance();

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
    if (fetchContractBalanceError) {
      console.log(fetchTransferResponse);
    }
    return (
      <>
        {fetchContractBalanceResponse ? (
          <Alert variant="success" placement="inline" title="Success">{`Balance: ${formatBigIntWithDecimals(
            scValToBigInt(fetchContractBalanceResponse.returnValue!),
            7,
          )} ${tokenName}`}</Alert>
        ) : null}

        {fetchContractBalanceError ? (
          <Alert variant="error" placement="inline" title="Error">{`Error invoking token balance: ${JSON.stringify(
            fetchContractBalanceError,
          )}`}</Alert>
        ) : null}

        {fetchTransferResponse ? (
          <Alert variant="success" placement="inline" title="Success">
            Transfer successful
          </Alert>
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
            fetchContractBalance({
              accountId,
              contractId,
            });
          }}
          isLoading={isFetchContractBalancePending || isFetchTransferPending}
        >
          Invoke token balance
        </Button>
        <Button
          size="md"
          variant="secondary"
          onClick={() => {
            resetFetchContractBalance();
            fetchTransfer({
              contractId,
              fromAccId: accountId,
              toAccId: SOURCE_ACCOUNT_PUBLIC_KEY,
              amount: "10000000",
              signer: {
                addressId: accountId,
                method: Keypair.fromSecret(ACCOUNT_A_PRIVATE_KEY),
              },
            });
          }}
          isLoading={isFetchContractBalancePending || isFetchTransferPending}
        >
          Transfer 1.0 to {toAccTruncated}
        </Button>
        <Button
          size="md"
          variant="tertiary"
          onClick={() => {
            resetFetchContractBalance();
            resetFetchTransfer();
          }}
          disabled={
            isFetchContractBalancePending ||
            isFetchTransferPending ||
            !(fetchContractBalanceResponse || fetchContractBalanceError) ||
            !(fetchTransferResponse || fetchTransferError)
          }
        >
          Clear
        </Button>
      </Box>

      <>{renderResponse()}</>
    </Box>
  );
};
