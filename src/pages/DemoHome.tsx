import { useEffect, useState } from "react";
import { Badge, Button, Card, Display, Input, Layout, Loader, Notification, Text } from "@stellar/design-system";
import { useBalance } from "@/query/useBalance";

import { useDemoStore } from "@/store/useDemoStore";
import { C_ACCOUNT_ED25519_SIGNER, TOKEN_CONTRACT } from "@/config/settings";
import { AuthEntrySigner } from "@/services/AuthEntrySigner";
import { truncateStr } from "@/helpers/truncateStr";

import { Box } from "@/components/layout/Box";
import { formatBigIntWithDecimals } from "@/helpers/formatBigIntWithDecimals";

const DEFAULT_SIGNER_ADDRESS_ID = C_ACCOUNT_ED25519_SIGNER.PUBLIC_KEY;
const DEFAULT_SIGNER_SIGNING_METHOD: AuthEntrySigner = AuthEntrySigner.fromKeypairSecret(
  C_ACCOUNT_ED25519_SIGNER.PRIVATE_KEY,
);

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

  const [tomlDomainInput, setTomlDomainInput] = useState<string>("");
  const [contractSignerAddressIdInput, setContractSignerAddressIdInput] = useState<string>("");

  const contractSignerAddressId = contractSigner?.addressId || "";
  const tokenContractId = tokenInfo?.contractId || "";
  const tokenCode = tokenInfo?.name || "";

  useEffect(() => {
    setTomlDomainInput(tomlDomain || "");
  }, [tomlDomain]);

  useEffect(() => {
    setContractSignerAddressIdInput(contractSignerAddressId);
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
                    addressId: DEFAULT_SIGNER_ADDRESS_ID,
                    method: DEFAULT_SIGNER_SIGNING_METHOD,
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
                    clearTokenInfo();
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
                  <Button size="md" variant="secondary" disabled={tokenCode !== "USDC"}>
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
      </Box>
    </Layout.Inset>
  );
};

const ButtonsBar = ({ left, right }: { left?: React.ReactNode; right?: React.ReactNode }) => (
  <Box gap="sm" direction="row" align="center" justify="space-between">
    <>
      {left ? (
        <Box gap="sm" direction="row" align="center">
          <>{left}</>
        </Box>
      ) : null}
      {right ? (
        <Box gap="sm" direction="row" align="center" justify="end">
          <>{right}</>
        </Box>
      ) : null}
    </>
  </Box>
);

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
