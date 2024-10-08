import { BroadcastStatusFn, isFinal, TransactionStatus } from "@/types/types";

export const pollSep24Deposit = async ({
  sep24TransferServerUrl,
  transactionId,
  sep10Token,
  broadcastStatus,
}: {
  sep24TransferServerUrl: string;
  transactionId: string;
  sep10Token: string;
  broadcastStatus: BroadcastStatusFn;
}) => {
  let currentStatus = TransactionStatus.INCOMPLETE;
  let message = "";

  const transactionUrl = new URL(`${sep24TransferServerUrl}/transaction?id=${transactionId}&lang=en`);

  while (!isFinal(currentStatus)) {
    const response = await fetch(transactionUrl.toString(), {
      headers: { Authorization: `Bearer ${sep10Token}` },
    });

    const transactionJson = await response.json();

    if (transactionJson.transaction.status !== currentStatus) {
      currentStatus = transactionJson.transaction.status;

      switch (currentStatus) {
        case TransactionStatus.PENDING_USER_TRANSFER_START: {
          message = "The anchor is waiting on you to take the action described in the popup";
          break;
        }
        case TransactionStatus.PENDING_ANCHOR: {
          message = "The anchor is processing the transaction";
          break;
        }
        case TransactionStatus.PENDING_STELLAR: {
          message = "The Stellar network is processing the transaction";
          break;
        }
        case TransactionStatus.PENDING_EXTERNAL: {
          message = "The transaction is being processed by an external system";
          break;
        }
        case TransactionStatus.PENDING_TRUST: {
          message = "You must add a trustline to the asset in order to receive your deposit";
          break;
        }
        case TransactionStatus.PENDING_USER: {
          message = "The anchor is waiting for you to take the action described in the popup";
          break;
        }
        case TransactionStatus.ERROR: {
          message = "There was a problem processing your transaction";
          break;
        }
        default:
        // do nothing
      }
    }
    console.log(`[${currentStatus}] SEP-24 deposit: ${message}`);
    broadcastStatus(currentStatus, message, isFinal(currentStatus));

    // run loop every 2 seconds
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  return currentStatus;
};
