import { Alert, Button } from "@stellar/design-system";
import { Box } from "@/components/layout/Box";
import { useContractBalance } from "@/query/useContractBalance";

interface AccountBalanceProps {
  accountId: string;
  contractId: string;
}

export const AccountBalance: React.FC<AccountBalanceProps> = ({
  accountId,
  contractId,
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
      console.log(
        "fetchContractBalanceResponse: ",
        fetchContractBalanceResponse,
      );
      return (
        <Alert
          variant="success"
          placement="inline"
          title="Success"
        >{`Account ${accountId} data fetched`}</Alert>
      );
    }

    if (fetchContractBalanceError) {
      return (
        <Alert
          variant="error"
          placement="inline"
          title="Error"
        >{`Error fetching account ${accountId}: ${fetchContractBalanceError}`}</Alert>
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
          Fetch account
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
