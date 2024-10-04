import { TransactionStatus } from "@/types/types";

const END_STATUS = [TransactionStatus.PENDING_EXTERNAL, TransactionStatus.COMPLETED, TransactionStatus.ERROR];

export const pollSep24Deposit = async ({
  sep24TransferServerUrl,
  transactionId,
  sep10Token,
}: {
  sep24TransferServerUrl: string;
  transactionId: string;
  sep10Token: string;
}) => {
  let currentStatus = TransactionStatus.INCOMPLETE;

  const transactionUrl = new URL(`${sep24TransferServerUrl}/transaction?id=${transactionId}&lang=en`);

  while (!END_STATUS.includes(currentStatus)) {
    const response = await fetch(transactionUrl.toString(), {
      headers: { Authorization: `Bearer ${sep10Token}` },
    });

    const transactionJson = await response.json();

    if (transactionJson.transaction.status !== currentStatus) {
      currentStatus = transactionJson.transaction.status;

      switch (currentStatus) {
        case TransactionStatus.PENDING_USER_TRANSFER_START: {
          console.log("SEP-24 deposit: The anchor is waiting on you to take the action described in the popup");
          break;
        }
        case TransactionStatus.PENDING_ANCHOR: {
          console.log("SEP-24 deposit: The anchor is processing the transaction");
          break;
        }
        case TransactionStatus.PENDING_STELLAR: {
          console.log("SEP-24 deposit: The Stellar network is processing the transaction");
          break;
        }
        case TransactionStatus.PENDING_EXTERNAL: {
          console.log("SEP-24 deposit: The transaction is being processed by an external system");
          break;
        }
        case TransactionStatus.PENDING_TRUST: {
          console.log("SEP-24 deposit: You must add a trustline to the asset in order to receive your deposit");
          break;
        }
        case TransactionStatus.PENDING_USER: {
          console.log("SEP-24 deposit: The anchor is waiting for you to take the action described in the popup");
          break;
        }
        case TransactionStatus.ERROR: {
          console.log("SEP-24 deposit: There was a problem processing your transaction");
          break;
        }
        default:
        // do nothing
      }
    }

    // run loop every 2 seconds
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  return currentStatus;
};
