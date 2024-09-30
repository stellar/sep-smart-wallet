import { useEffect, useRef, useState } from "react";
import { Alert, Button, Heading, Input, Modal, Notification } from "@stellar/design-system";
import { StrKey } from "@stellar/stellar-sdk";

import { Box } from "@/components/layout/Box";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import { STELLAR, TOKEN_CONTRACT } from "@/config/settings";
import { formatBigIntWithDecimals } from "@/helpers/formatBigIntWithDecimals";
import { truncateStr } from "@/helpers/truncateStr";
import { useBalance } from "@/query/useBalance";
import { useContractSignerStore } from "@/store/useContractSignerStore";
import { useTransfer } from "@/query/useTransfer";
import { useTokenStore } from "@/store/useTokenStore";
import { TokenInfo } from "@/types/types";

export const TokenConfig = () => {
  const defaultTokenContractId = TOKEN_CONTRACT.NATIVE;
  const defaultTokenCode = "XLM";

  const { contractSigner } = useContractSignerStore();
  const { tokenInfo, setTokenInfo } = useTokenStore();

  const [isDefaultTokenModalVisible, setDefaultTokenModalVisible] = useState(false);
  const [isUpdateTokenModalVisible, setUpdateTokenModalVisible] = useState(false);
  const [isClearTokenModalVisible, setClearTokenModalVisible] = useState(false);

  const {
    data: sendTransferResponse,
    mutate: sendTransfer,
    error: sendTransferError,
    isPending: isSendTransferPending,
    reset: resetSendTransfer,
  } = useTransfer();

  const {
    data: fetchBalanceResponse,
    mutate: fetchBalance,
    error: fetchBalanceError,
    isPending: isFetchBalancePending,
    reset: resetFetchBalance,
  } = useBalance();

  const previousSendTransferResponse = useRef(sendTransferResponse);
  useEffect(() => {
    const transferDidntChange = sendTransferResponse === previousSendTransferResponse.current;
    const transferChangedToDefined = sendTransferResponse !== undefined;

    if (tokenInfo && contractSigner && (transferDidntChange || transferChangedToDefined)) {
      fetchBalance({
        contractId: tokenInfo!.contractId,
        accountId: contractSigner.addressId,
      });
    } else if (tokenInfo === null || contractSigner === null) {
      resetFetchBalance();
    }

    previousSendTransferResponse.current = sendTransferResponse;
  }, [tokenInfo, contractSigner, sendTransferResponse]);

  const renderResponse = () => {
    if (fetchBalanceError !== null) {
      console.error("fetchBalanceError: ", fetchBalanceError);
    }

    if (sendTransferError !== null) {
      console.error("sendTransferError: ", sendTransferError);
    }

    return (
      <>
        {fetchBalanceError ? (
          <Alert variant="error" placement="inline" title="Error">{`Error fetching balance: ${JSON.stringify(
            fetchBalanceError,
          )}`}</Alert>
        ) : null}

        {sendTransferError ? (
          <Alert variant="error" placement="inline" title="Error">{`Error sending transfer: ${JSON.stringify(
            sendTransferError,
          )}`}</Alert>
        ) : null}
      </>
    );
  };

  let balanceText = "-";
  if (fetchBalanceResponse !== undefined && tokenInfo) {
    const tokenName = `${tokenInfo.name} (${truncateStr(tokenInfo.contractId, 4)})`;
    balanceText = `${formatBigIntWithDecimals(fetchBalanceResponse, 7)} ${tokenName}`;
  }

  const toAcc = STELLAR.SOURCE_ACCOUNT.PUBLIC_KEY;
  const toAccTruncated = truncateStr(toAcc, 4);
  const amount: number = 1;
  const stroopsAmount = BigInt(amount) * BigInt(10 ** 7);

  return (
    <>
      <Box gap="lg">
        <Box gap="md" direction="row" align="center" justify="space-between">
          <Heading size="md" as="h4">
            Balance: {balanceText}
          </Heading>

          <Box gap="md" direction="row" align="center">
            <Button
              size="md"
              variant="primary"
              onClick={() => {
                setDefaultTokenModalVisible(true);
              }}
            >
              Use Default Token
            </Button>

            <Button
              size="md"
              variant="primary"
              onClick={() => {
                setUpdateTokenModalVisible(true);
              }}
            >
              Update Token
            </Button>

            <Button
              size="md"
              variant="secondary"
              onClick={() => {
                resetSendTransfer();
                sendTransfer({
                  contractId: tokenInfo!.contractId,
                  fromAccId: contractSigner!.addressId,
                  toAccId: toAcc,
                  amount: stroopsAmount.toString(),
                  signer: contractSigner!,
                });
              }}
              isLoading={isSendTransferPending}
              disabled={!tokenInfo || !contractSigner || isFetchBalancePending}
            >
              Transfer {amount} {tokenInfo?.name} to {toAccTruncated}
            </Button>

            <Button
              size="md"
              variant="destructive"
              onClick={() => {
                setClearTokenModalVisible(true);
              }}
              disabled={!tokenInfo}
            >
              Clear Token
            </Button>
          </Box>
        </Box>

        <>{renderResponse()}</>
      </Box>

      <ConfirmationModal
        title="Set default token"
        visible={isDefaultTokenModalVisible}
        onClose={() => setDefaultTokenModalVisible(false)}
        onConfirm={() => {
          setDefaultTokenModalVisible(false);
          resetFetchBalance();
          resetSendTransfer();
          setTokenInfo({
            contractId: defaultTokenContractId,
            name: defaultTokenCode,
          });
        }}
      >
        Are you sure you want to use the default token? The default token is {defaultTokenCode} (
        {defaultTokenContractId}) .
      </ConfirmationModal>

      <UpdateTokenModal
        visible={isUpdateTokenModalVisible}
        onClose={() => setUpdateTokenModalVisible(false)}
        onConfirm={(newTokenValue) => {
          setUpdateTokenModalVisible(false);
          resetFetchBalance();
          resetSendTransfer();
          setTokenInfo(newTokenValue);
        }}
      />

      <ConfirmationModal
        title="Clear token"
        visible={isClearTokenModalVisible}
        onClose={() => setClearTokenModalVisible(false)}
        onConfirm={() => {
          setClearTokenModalVisible(false);
          resetFetchBalance();
          resetSendTransfer();
          setTokenInfo(null);
        }}
      >
        Are you sure you want to clear the stored token?
      </ConfirmationModal>
    </>
  );
};

interface UpdateTomlModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (newTokenValue: TokenInfo) => void;
}

const UpdateTokenModal: React.FC<UpdateTomlModalProps> = ({ visible, onClose, onConfirm }: UpdateTomlModalProps) => {
  const [errorMessage, setErrorMessage] = useState("");
  const emptyTokenInfo: TokenInfo = { contractId: "", name: "" };

  const [newTokenValue, setNewTokenValue] = useState<TokenInfo>(emptyTokenInfo);
  const onTokenNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewTokenValue({ ...newTokenValue, name: e.target.value.trim() });
    setErrorMessage("");
  };
  const onTokenContractIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewTokenValue({ ...newTokenValue, contractId: e.target.value.trim() });
    setErrorMessage("");
  };

  useEffect(() => {
    if (!visible) {
      setNewTokenValue(emptyTokenInfo);
      setErrorMessage("");
    }
  }, [visible]);

  const handleCancel = () => {
    setNewTokenValue(emptyTokenInfo);
    setErrorMessage("");
    onClose();
  };

  const handleConfirm = () => {
    if (!StrKey.isValidContract(newTokenValue.contractId)) {
      setErrorMessage("Invalid ContractId");
      return;
    } else if (newTokenValue.name.length < 1 || newTokenValue.name.length > 12) {
      setErrorMessage("Name must be between 1 and 12 characters");
      return;
    }
    onConfirm(newTokenValue);
  };

  return (
    <Modal visible={visible} onClose={onClose}>
      <Modal.Heading>Update Token Information</Modal.Heading>

      <Modal.Body>
        {errorMessage ? (
          <Notification variant="error" title="Error">
            {errorMessage}
          </Notification>
        ) : null}

        <Input
          id="tokenName"
          fieldSize="md"
          type="text"
          label="Name"
          placeholder="USDC"
          value={newTokenValue.name}
          onChange={onTokenNameChange}
          error={!!errorMessage}
        ></Input>

        <Input
          id="tokenContractId"
          fieldSize="md"
          type="text"
          label="Contract Id"
          placeholder="CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA"
          value={newTokenValue.contractId}
          onChange={onTokenContractIdChange}
          error={!!errorMessage}
        ></Input>
      </Modal.Body>

      <Modal.Footer>
        <Button size="sm" variant="secondary" type="reset" onClick={handleCancel}>
          Cancel
        </Button>

        <Button
          size="sm"
          variant="primary"
          type="submit"
          disabled={!newTokenValue || !!errorMessage}
          onClick={handleConfirm}
        >
          Confirm
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
