import { useEffect, useState } from "react";
import { Button, Loader, Notification } from "@stellar/design-system";

import { Box } from "@/components/layout/Box";
import { ButtonsBar } from "@/components/ButtonsBar";

import { useRegisterPasskey } from "@/query/useRegisterPasskey";
import { useConnectPasskey } from "@/query/useConnectPasskey";
import { useDemoStore } from "@/store/useDemoStore";
import { AuthEntrySigner } from "@/services/AuthEntrySigner";
import { PASSKEY } from "@/config/settings";
import { BroadcastPasskeySmartWalletCreationFn } from "@/types/types";

export const DebugPasskey = () => {
  const { setContractSigner } = useDemoStore();

  const [passkeyStatuses, setPasskeyStatuses] = useState<string[]>([]);

  const {
    data: registerPasskeyResponse,
    mutate: registerPasskey,
    error: registerPasskeyError,
    isPending: isRegisterPasskeyPending,
    reset: resetRegisterPasskey,
  } = useRegisterPasskey();

  const broadcastStatus: BroadcastPasskeySmartWalletCreationFn = (msg: string, _: boolean) => {
    setPasskeyStatuses((prev) => [...prev, msg]);
  };

  const {
    data: connectPasskeyResponse,
    mutate: connectPasskey,
    error: connectPasskeyError,
    isPending: isConnectPasskeyPending,
    reset: resetConnectPasskey,
  } = useConnectPasskey();

  const registerPasskeyContractId = registerPasskeyResponse?.contractId || "";
  const registerPasskeyKeyId = registerPasskeyResponse?.keyId || "";

  const connectPasskeyContractId = connectPasskeyResponse?.contractId || "";
  const connectPasskeyKeyId = connectPasskeyResponse?.keyId || "";

  useEffect(() => {
    if (registerPasskeyContractId && registerPasskeyKeyId) {
      setPasskeyStatuses([]);
      setContractSigner({
        addressId: registerPasskeyContractId,
        method: AuthEntrySigner.fromPasskeyKeyId(registerPasskeyKeyId),
      });
    }
  }, [registerPasskeyContractId, registerPasskeyKeyId, setContractSigner, setPasskeyStatuses]);

  useEffect(() => {
    if (connectPasskeyContractId && connectPasskeyKeyId) {
      setContractSigner({
        addressId: connectPasskeyContractId,
        method: AuthEntrySigner.fromPasskeyKeyId(connectPasskeyKeyId),
      });
    }
  }, [connectPasskeyContractId, connectPasskeyKeyId, setContractSigner]);

  const renderResponse = () => {
    return (
      <>
        {/* Register: pending */}
        {isRegisterPasskeyPending ? (
          <Notification variant="secondary" title="Smart Wallet deployment in progress…" icon={<Loader />} isFilled>
            <>
              {passkeyStatuses?.map((statusMsg, index) => (
                <div key={index}>{statusMsg}</div>
              ))}
            </>
          </Notification>
        ) : null}

        {/* Register: success */}
        {registerPasskeyResponse ? (
          <Notification variant="success" isFilled title={`Passkey Smart Wallet Registered`}>
            <Box gap="sm">
              <NotificationItem label="Contract ID" value={registerPasskeyResponse.contractId} />
              <NotificationItem label="Key ID" value={registerPasskeyResponse.keyId} />
            </Box>
          </Notification>
        ) : null}
        {/* Register: error */}
        {registerPasskeyError ? (
          <Notification variant="error" isFilled title="Error registering passkey">
            {JSON.stringify(registerPasskeyError)}
          </Notification>
        ) : null}

        {/* Connect: success */}
        {connectPasskeyResponse ? (
          <Notification variant="success" isFilled title={`Passkey Connected`}>
            <Box gap="sm">
              <NotificationItem label="Contract ID" value={connectPasskeyResponse.contractId} />
              <NotificationItem label="Key ID" value={connectPasskeyResponse.keyId} />
            </Box>
          </Notification>
        ) : null}
        {/* Connect: error */}
        {connectPasskeyError ? (
          <Notification variant="error" isFilled title="Error connecting passkey">
            {JSON.stringify(connectPasskeyError, null, 2)}
          </Notification>
        ) : null}
      </>
    );
  };

  return (
    <Box gap="sm" addlClassName="DebuggerCard">
      <ButtonsBar
        left={
          <>
            <Button
              size="md"
              variant="tertiary"
              isLoading={isRegisterPasskeyPending}
              disabled={isConnectPasskeyPending}
              onClick={(e) => {
                const userName = prompt("Give this passkey a name", PASSKEY.DEFAULT_NAME);

                if (userName) {
                  resetConnectPasskey();
                  registerPasskey({
                    projectName: PASSKEY.PROJECT_NAME,
                    userName,
                    broadcastStatus,
                  });
                } else {
                  (e.target as HTMLButtonElement).blur();
                }
              }}
            >
              Register Passkey
            </Button>

            <Button
              size="md"
              variant="tertiary"
              isLoading={isConnectPasskeyPending}
              disabled={isRegisterPasskeyPending}
              onClick={() => {
                resetRegisterPasskey();
                connectPasskey();
              }}
            >
              Connect Passkey
            </Button>
          </>
        }
        right={
          registerPasskeyResponse || connectPasskeyResponse || registerPasskeyError || connectPasskeyError ? (
            <Button
              size="md"
              variant="error"
              onClick={() => {
                resetRegisterPasskey();
                resetConnectPasskey();
              }}
            >
              Clear
            </Button>
          ) : undefined
        }
      />

      {renderResponse()}
    </Box>
  );
};

const NotificationItem = ({ label, value }: { label: string; value: string }) => (
  <Box gap="xs">
    <div className="NotificationItem__label">{label}</div>
    <div className="NotificationItem__value">{value}</div>
  </Box>
);
