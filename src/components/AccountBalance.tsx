import { Alert, Button } from "@stellar/design-system";
import { Box } from "@/components/layout/Box";
import { useContractBalance } from "@/query/useContractBalance";
import { scValToBigInt } from "@stellar/stellar-sdk";
import { formatBigIntWithDecimals } from "@/helpers/formatBigIntWithDecimals";

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

  const renderResponse = () => {
    if (fetchContractBalanceResponse) {
      const balanceBigInt = scValToBigInt(
        fetchContractBalanceResponse.returnValue!,
      );
      const balanceStr = formatBigIntWithDecimals(balanceBigInt, 7);
      return (
        <Alert
          variant="success"
          placement="inline"
          title="Success"
        >{`Balance: ${balanceStr} ${tokenName}`}</Alert>
      );
    }

    if (fetchContractBalanceError) {
      return (
        <Alert
          variant="error"
          placement="inline"
          title="Error"
        >{`Error invoking token balance: ${fetchContractBalanceError}`}</Alert>
      );
    }

    return null;
  };

  return (
    <Box gap="lg">
      <Box gap="md" direction="row" align="center">
        <Button
          size="md"
          variant="secondary"
          onClick={() => {
            fetchContractBalance({
              accountId,
              contractId,
            });
          }}
          isLoading={isFetchContractBalancePending}
        >
          Invoke token balance
        </Button>
        <Button
          size="md"
          variant="tertiary"
          onClick={() => {
            resetFetchContractBalance();
          }}
          disabled={
            isFetchContractBalancePending ||
            !(fetchContractBalanceResponse || fetchContractBalanceError)
          }
        >
          Clear
        </Button>
      </Box>

      <>{renderResponse()}</>
    </Box>
  );
};
