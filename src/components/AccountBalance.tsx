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
    data: sendTransferResponse,
    mutate: sendTransfer,
    error: sendTransferError,
    isPending: isSendTransferPending,
    reset: resetSendTransfer,
  } = useTransfer();

  const {
    data: execWebAuthResponse,
    mutate: execWebAuth,
    error: execWebAuthError,
    isPending: isExecWebAuthPending,
    reset: resetExecWebAuth,
  } = useWebAuth();

  const renderResponse = () => {
    if (sendTransferError !== null) {
      console.log(sendTransferError);
    }
    if (fetchBalanceError !== null) {
      console.log(fetchBalanceError);
    }
    if (execWebAuthError !== null) {
      console.log(execWebAuthError);
    }

    const title =
      fetchBalanceResponse !== undefined
        ? "Successfully fetched balance"
        : sendTransferResponse !== undefined
        ? "Successfully transferred 1.0 XLM"
        : null;
    const balance = fetchBalanceResponse !== undefined ? fetchBalanceResponse : sendTransferResponse;
    return (
      <>
        {balance !== undefined && title !== undefined ? (
          <Alert variant="success" placement="inline" title={title}>{`Balance: ${formatBigIntWithDecimals(
            balance,
            7,
          )} ${tokenName}`}</Alert>
        ) : null}

        {execWebAuthResponse ? (
          <Alert
            variant="success"
            placement="inline"
            title="Success"
          >{`WebAuth response successful? ${execWebAuthResponse}`}</Alert>
        ) : null}

        {fetchBalanceError ? (
          <Alert variant="error" placement="inline" title="Error">{`Error invoking token balance: ${JSON.stringify(
            fetchBalanceError,
          )}`}</Alert>
        ) : null}

        {sendTransferError ? (
          <Alert variant="error" placement="inline" title="Error">{`Error invoking transfer: ${JSON.stringify(
            sendTransferError,
          )}`}</Alert>
        ) : null}

        {execWebAuthError ? (
          <Alert variant="error" placement="inline" title="Error">{`Error invoking WebAuth: ${JSON.stringify(
            execWebAuthError,
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
            resetExecWebAuth();
            resetSendTransfer();
            fetchBalance({
              accountId: accountSigner.addressId,
              contractId,
            });
          }}
          isLoading={isFetchBalancePending}
          disabled={isSendTransferPending}
        >
          Invoke {tokenName} balance
        </Button>
        <Button
          size="md"
          variant="secondary"
          onClick={() => {
            resetExecWebAuth();
            resetFetchBalance();
            sendTransfer({
              contractId,
              fromAccId: accountSigner.addressId,
              toAccId: toAcc,
              amount: stroopsAmount.toString(),
              signer: accountSigner,
            });
          }}
          isLoading={isSendTransferPending}
          disabled={isFetchBalancePending}
        >
          Transfer {amount} {tokenName} to {toAccTruncated}
        </Button>

        <Button
          size="md"
          variant="secondary"
          onClick={() => {
            execWebAuth({
              contractId: WEBAUTH_CONTRACT.ID,
              signer: {
                addressId: WEBAUTH_CONTRACT.SIGNER.PUBLIC_KEY,
                method: Keypair.fromSecret(WEBAUTH_CONTRACT.SIGNER.PRIVATE_KEY),
              },
            });
          }}
          isLoading={isExecWebAuthPending}
          disabled={isFetchBalancePending || isSendTransferPending}
        >
          WebAuth
        </Button>

        <Button
          size="md"
          variant="tertiary"
          onClick={() => {
            resetFetchBalance();
            resetSendTransfer();
            resetExecWebAuth();
          }}
          disabled={
            isFetchBalancePending ||
            isSendTransferPending ||
            (!(fetchBalanceResponse || fetchBalanceError) && !(sendTransferResponse || sendTransferError))
          }
        >
          Clear
        </Button>
      </Box>

      <>{renderResponse()}</>
    </Box>
  );
};
