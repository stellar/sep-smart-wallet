import { Alert, Button, Heading } from "@stellar/design-system";
import { Keypair } from "@stellar/stellar-sdk";
import { useNavigate } from "react-router-dom";

import { Box } from "@/components/layout/Box";
import { C_ACCOUNT_ED25519_SIGNER, STELLAR, TOKEN_CONTRACT } from "@/config/settings";
import { formatBigIntWithDecimals } from "@/helpers/formatBigIntWithDecimals";
import { truncateStr } from "@/helpers/truncateStr";
import { useBalance } from "@/query/useBalance";
import { useTransfer } from "@/query/useTransfer";
import { ContractSigner, TokenInfo } from "@/types/types";

export const TokenDebugPage = () => {
  const accountSigner: ContractSigner = {
    addressId: C_ACCOUNT_ED25519_SIGNER.PUBLIC_KEY,
    method: Keypair.fromSecret(C_ACCOUNT_ED25519_SIGNER.PRIVATE_KEY),
  };

  const tokenInfo: TokenInfo = {
    contractId: TOKEN_CONTRACT.NATIVE,
    name: "XLM",
  };

  const { contractId, name: tokenName } = tokenInfo;

  const navigate = useNavigate();

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

  const renderResponse = () => {
    if (sendTransferError !== null) {
      console.log(sendTransferError);
    }
    if (fetchBalanceError !== null) {
      console.log(fetchBalanceError);
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
      </>
    );
  };

  const toAcc = STELLAR.SOURCE_ACCOUNT.PUBLIC_KEY;
  const toAccTruncated = truncateStr(toAcc, 4);
  const amount: number = 1;
  const stroopsAmount = BigInt(amount) * BigInt(10 ** 7);

  return (
    <Box gap="lg">
      <Heading size="md" as="h2">
        Token Debugger
      </Heading>

      <Box gap="md" direction="row" align="center">
        <Button
          size="md"
          variant="primary"
          onClick={() => {
            navigate("/");
          }}
        >
          Back to Home
        </Button>

        <Button
          size="md"
          variant="secondary"
          onClick={() => {
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
          variant="tertiary"
          onClick={() => {
            resetFetchBalance();
            resetSendTransfer();
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
