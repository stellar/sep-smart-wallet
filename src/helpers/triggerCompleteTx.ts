// const REF_SERVER_URL = "https://anchor-reference-server-m24.stellar.org";
const REF_SERVER_URL = "http://localhost:8091";

export const triggerCompleteTx = async ({ interactiveUrl }: { interactiveUrl: string }) => {
  try {
    const intUrl = new URL(interactiveUrl);
    const token = intUrl.searchParams.get("token");
    const transactionId = intUrl.searchParams.get("transaction_id");

    const url = `${REF_SERVER_URL}/sep24/interactive?transaction_id=${transactionId}&token=${token}`;

    const completeTxRequest = await fetch(url.toString());
    await completeTxRequest.json();
  } catch (e) {
    console.log(">>> Complete tx error: ", e);
  }
};
