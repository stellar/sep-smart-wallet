import { useEffect, useState } from "react";
import { Badge, Button, Card, Display, Input, Layout, Loader, Modal, Notification, Text } from "@stellar/design-system";
import { useBalance } from "@/query/useBalance";
import { useSep24Deposit } from "@/query/useSep24Deposit";
import { useSep24DepositPolling } from "@/query/useSep24DepositPolling";

import { useDemoStore } from "@/store/useDemoStore";
import { C_ACCOUNT_ED25519_SIGNER, TOKEN_CONTRACT } from "@/config/settings";
import { truncateStr } from "@/helpers/truncateStr";
import { formatBigIntWithDecimals } from "@/helpers/formatBigIntWithDecimals";
import { triggerCompleteTx } from "@/helpers/triggerCompleteTx";

import { Box } from "@/components/layout/Box";
import { ButtonsBar } from "@/components/ButtonsBar";

import { BroadcastStatusFn, TransactionStatus } from "@/types/types";

import IconUsdc from "@/assets/asset-usdc.svg?react";
import IconXlm from "@/assets/asset-xlm.svg?react";
import { snakeToTitleCase } from "@/helpers/snakeToTitleCase";
import { AuthEntrySigner } from "@/services/AuthEntrySigner";

const defaultSignerAddressId = C_ACCOUNT_ED25519_SIGNER.PUBLIC_KEY;
const defaultSignerSigningMethod: AuthEntrySigner = AuthEntrySigner.fromKeypairSecret(
  C_ACCOUNT_ED25519_SIGNER.PRIVATE_KEY,
);

const ASSET_ICON: { [key: string]: React.ReactElement } = {
  XLM: <IconXlm />,
  USDC: <IconUsdc />,
};

export const DemoHome = () => {
  const {
    tomlDomain,
    setTomlDomain,
    clearTomlDomain,
    contractSigner,
    setContractSigner,
    clearContractSigner,
    tokenInfo,
    setTokenInfo,
    clearTokenInfo,
  } = useDemoStore();

  const {
    data: fetchBalanceResponse,
    mutate: fetchBalance,
    error: fetchBalanceError,
    isPending: isFetchBalancePending,
    reset: resetFetchBalance,
  } = useBalance();

  const {
    data: sep24DepositResponse,
    mutate: sep24DepositInit,
    isPending: isSep24DepositPending,
    error: sep24DepositError,
    isSuccess: isSep24DepositSuccess,
    isError: isSep24DepositError,
    reset: resetSep24Deposit,
  } = useSep24Deposit();

  const {
    data: sep24DepositPollingResponse,
    mutate: sep24DepositPolling,
    isPending: isSep24DepositPollingPending,
    reset: resetSep24DepositPolling,
  } = useSep24DepositPolling();

  type TxStatusAndMessage = {
    status: string;
    message: string;
  };
  const [intermediateTxStatus, setIntermediateTxStatus] = useState<TxStatusAndMessage[] | undefined>(undefined);
  const [tomlDomainInput, setTomlDomainInput] = useState<string>("");
  const [contractSignerAddressIdInput, setContractSignerAddressIdInput] = useState<string>("");

  const [isDepositModalVisible, setIsDepositModalVisible] = useState(false);
  const [depositAmountInput, setDepositAmountInput] = useState("");
  const [depositAddressInput, setDepositAddressInput] = useState("");
  const [isPolling, setIsPolling] = useState(false);

  const contractSignerAddressId = contractSigner?.addressId || "";
  const tokenContractId = tokenInfo?.contractId || "";
  const tokenCode = tokenInfo?.name || "";

  const interactiveUrl = sep24DepositResponse?.interactiveUrl || "";
  const sep24TransferServerUrl = sep24DepositResponse?.sep24TransferServerUrl || "";
  const sep10Token = sep24DepositResponse?.sep10Token || "";
  const transactionId = sep24DepositResponse?.interactiveId || "";

  useEffect(() => {
    setTomlDomainInput(tomlDomain || "");
  }, [tomlDomain]);

  useEffect(() => {
    setContractSignerAddressIdInput(contractSignerAddressId);
    setDepositAddressInput(contractSignerAddressId);
  }, [contractSignerAddressId]);

  useEffect(() => {
    if (contractSignerAddressId && tokenContractId) {
      fetchBalance({
        contractId: tokenContractId,
        accountId: contractSignerAddressId,
      });
    } else {
      resetFetchBalance();
    }
  }, [contractSignerAddressId, fetchBalance, resetFetchBalance, tokenContractId]);

  useEffect(() => {
    if (isSep24DepositError) {
      setIsDepositModalVisible(false);
    }
  }, [isSep24DepositError]);

  useEffect(() => {
    let popup: Window | null = null;

    if (!popup && isSep24DepositSuccess && interactiveUrl) {
      setIsDepositModalVisible(false);

      popup = open(interactiveUrl, "popup", "width=420,height=640");

      const trigger = async () => {
        await triggerCompleteTx({ interactiveUrl: interactiveUrl });
      };

      const interval = setInterval(() => {
        if (popup?.closed) {
          clearInterval(interval);

          trigger();
          setIsPolling(true);
        }
      }, 2000);
    }
  }, [interactiveUrl, isSep24DepositSuccess]);

  const broadcastStatus: BroadcastStatusFn = (txStatus: TransactionStatus, message: string, isFinal: boolean) => {
    console.log(`broadcastStatus: ${txStatus}, ${message}, ${isFinal}`);

    if (!isFinal) {
      setIntermediateTxStatus((prevState) => {
        if (txStatus === TransactionStatus.INCOMPLETE) {
          return prevState;
        }

        let alreadyExists = false;
        const status = snakeToTitleCase(txStatus);

        // Check if the status and message already exist in the previous state
        if (prevState !== undefined) {
          alreadyExists = prevState.some((tx) => {
            return tx.status === status && tx.message === message;
          });
        }

        // If it doesn't exist, add it to the state, otherwise return the same state
        if (!alreadyExists) {
          return prevState ? [...prevState, { status, message }] : [{ status, message }];
        }

        return prevState; // Return the previous state if nothing changes
      });
    }
  };

  useEffect(() => {
    if (isPolling && sep24TransferServerUrl && transactionId && sep10Token) {
      sep24DepositPolling({ sep24TransferServerUrl, transactionId, sep10Token, broadcastStatus });
    }
  }, [isPolling, sep24DepositPolling, sep24TransferServerUrl, sep10Token, transactionId]);

  useEffect(() => {
    if (sep24DepositPollingResponse === TransactionStatus.COMPLETED) {
      setIsPolling(false);
      setDepositAmountInput("");
      resetSep24Deposit();

      fetchBalance({
        contractId: tokenContractId,
        accountId: contractSignerAddressId,
      });

      const t = setTimeout(() => {
        setIntermediateTxStatus(undefined);
        resetSep24DepositPolling();
        clearTimeout(t);
      }, 10000);
    }
    // Not including tokenContractId and contractSignerAddressId
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchBalance, resetSep24Deposit, resetSep24DepositPolling, sep24DepositPollingResponse]);

  return (
    <Layout.Inset>
      <Box gap="xl" addlClassName="DemoHome">
        {/* TOML */}
        <Box gap="sm">
          <Input
            id="tomlDomain"
            fieldSize="md"
            label="Anchor TOML Domain"
            placeholder="Local Mock"
            onChange={(e) => {
              setTomlDomainInput(e.target.value);
            }}
            value={tomlDomainInput}
          />

          <ButtonsBar
            left={
              <Button
                size="md"
                variant="tertiary"
                disabled={!tomlDomainInput || tomlDomain === tomlDomainInput}
                onClick={() => {
                  setTomlDomain(tomlDomainInput);
                }}
              >
                Update
              </Button>
            }
            right={
              tomlDomain ? (
                <Button
                  size="md"
                  variant="error"
                  onClick={() => {
                    clearTomlDomain();
                  }}
                >
                  Reset
                </Button>
              ) : undefined
            }
          />
        </Box>

        {/* Account */}
        <Box gap="sm">
          <Input
            id="contractSignerAddressId"
            fieldSize="md"
            label="Account"
            value={contractSignerAddressIdInput}
            onChange={(e) => {
              setContractSignerAddressIdInput(e.target.value);
            }}
          />

          <ButtonsBar
            left={
              <Button
                size="md"
                variant="tertiary"
                onClick={() => {
                  setContractSigner({
                    addressId: defaultSignerAddressId,
                    method: defaultSignerSigningMethod,
                  });
                }}
              >
                Set Default Account
              </Button>
            }
            right={
              contractSignerAddressId ? (
                <Button
                  size="md"
                  variant="error"
                  onClick={() => {
                    clearContractSigner();
                  }}
                >
                  Logout
                </Button>
              ) : undefined
            }
          />
        </Box>

        {/* Balance */}
        <Box gap="sm">
          <BalanceBox
            tokenCode={tokenCode}
            tokenContractId={tokenContractId}
            amount={fetchBalanceResponse}
            isLoading={isFetchBalancePending}
          />

          <ButtonsBar
            left={
              <>
                {contractSignerAddressId && tokenContractId ? (
                  <Button
                    size="md"
                    variant="secondary"
                    onClick={() => {
                      setIsDepositModalVisible(true);
                    }}
                  >
                    Deposit with Cash-in
                  </Button>
                ) : null}

                <Button
                  size="md"
                  variant="tertiary"
                  onClick={() => {
                    setTokenInfo({
                      contractId: TOKEN_CONTRACT.NATIVE,
                      name: "XLM",
                    });
                  }}
                >
                  Set XLM Asset
                </Button>

                <Button
                  size="md"
                  variant="tertiary"
                  onClick={() => {
                    setTokenInfo({
                      contractId: TOKEN_CONTRACT.USDC,
                      name: "USDC",
                    });
                  }}
                >
                  Set USDC Asset
                </Button>
              </>
            }
            right={
              tokenContractId ? (
                <Button
                  size="md"
                  variant="error"
                  onClick={() => {
                    clearTokenInfo();
                  }}
                >
                  Clear
                </Button>
              ) : undefined
            }
          />

          <>
            {fetchBalanceError ? (
              <Notification variant="error" title="Error fetching balance" isFilled>
                <>{fetchBalanceError}</>
              </Notification>
            ) : null}
          </>
        </Box>

        <>
          {isSep24DepositPollingPending ||
          (sep24DepositPollingResponse && sep24DepositPollingResponse !== TransactionStatus.COMPLETED) ? (
            <Notification variant="secondary" title="Deposit in progress…" icon={<Loader />} isFilled>
              <>
                {intermediateTxStatus?.map((tx, index) => (
                  <div key={index}>
                    [{tx.status}] {tx.message}
                  </div>
                ))}
              </>
            </Notification>
          ) : null}

          {sep24DepositError ? (
            <Notification variant="error" title="Error depositing" isFilled>
              <>{sep24DepositError.message}</>
            </Notification>
          ) : null}

          {sep24DepositPollingResponse === TransactionStatus.COMPLETED ? (
            <Notification variant="success" title="Deposit completed" isFilled />
          ) : null}
        </>
      </Box>

      <Modal
        visible={isDepositModalVisible}
        onClose={() => {
          setIsDepositModalVisible(false);
          setDepositAmountInput("");
        }}
      >
        <Modal.Heading>Deposit with Cash-in</Modal.Heading>
        <Modal.Body>
          <Box gap="sm">
            <span>Choose an amount and a destination</span>

            <Input
              id="deposit-amount"
              fieldSize="md"
              label="Amount"
              rightElement={tokenCode}
              leftElement={<span className="Deposit__inputIcon">{ASSET_ICON[tokenCode]}</span>}
              value={depositAmountInput}
              onChange={(e) => {
                setDepositAmountInput(e.target.value);
              }}
            />
            <Input
              id="deposit-address"
              fieldSize="md"
              label="Destination"
              value={depositAddressInput}
              onChange={(e) => {
                setDepositAddressInput(e.target.value);
              }}
            />
          </Box>
        </Modal.Body>
        <Modal.Footer>
          <Button
            size="md"
            variant="tertiary"
            onClick={() => {
              setIsDepositModalVisible(false);
            }}
          >
            Cancel
          </Button>

          <Button
            size="md"
            variant="secondary"
            disabled={!depositAmountInput}
            isLoading={isSep24DepositPending}
            onClick={() => {
              if (contractSigner) {
                sep24DepositInit({
                  amount: depositAmountInput,
                  address: contractSignerAddressId,
                  signer: contractSigner,
                  assetCode: tokenCode,
                  homeDomain: tomlDomainInput,
                });
              }
            }}
          >
            Confirm Deposit
          </Button>
        </Modal.Footer>
      </Modal>
    </Layout.Inset>
  );
};

const BalanceBox = ({
  tokenCode,
  tokenContractId,
  amount,
  isLoading,
}: {
  tokenCode: string;
  tokenContractId: string;
  amount: bigint | undefined;
  isLoading: boolean;
}) => {
  const renderAmount = () => {
    if (isLoading) {
      return <Loader />;
    }

    if (amount === undefined) {
      return `- ${tokenCode}`;
    }

    return amount && tokenCode ? `${formatBigIntWithDecimals(amount, 7)} ${tokenCode}` : 0;
  };

  return (
    <Card noPadding>
      <Box gap="xl" addlClassName="BalanceBox">
        <Text as="div" size="md" weight="medium">
          Balance
        </Text>

        <Box gap="md" addlClassName="BalanceBox__assetWrapper">
          <Display as="div" size="xs" weight="medium" addlClassName="BalanceBox__amount">
            {renderAmount()}
          </Display>

          {tokenContractId ? (
            <Badge variant="secondary">{`Asset: ${truncateStr(tokenContractId, 4)}`}</Badge>
          ) : (
            <Badge variant="tertiary">No asset selected</Badge>
          )}
        </Box>
      </Box>
    </Card>
  );
};
