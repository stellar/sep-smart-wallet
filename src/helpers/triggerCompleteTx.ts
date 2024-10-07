export const triggerCompleteTx = async ({ interactiveUrl }: { interactiveUrl: string }) => {
  try {
    const intUrl = new URL(interactiveUrl);
    const token = intUrl.searchParams.get("token");
    const transactionId = intUrl.searchParams.get("transaction_id");

    if (!token || !transactionId) {
      throw new Error("Missing token or transaction_id in the URL");
    }

    // Update pathname directly
    intUrl.pathname = "/sep24/interactive";

    const response = await fetch(intUrl.toString());
    await response.blob();
    if (!response.ok) {
      throw new Error(`${response.status} Error fetching transaction`);
    }
  } catch (e) {
    console.error(">>> triggerCompleteTx: ", e);
  }
};
