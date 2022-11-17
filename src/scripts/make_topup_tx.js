import { phalaApi as api, setupPhalaApi } from "../utils/api.js";
import logger from "../utils/logger.js";

const watchList = process.env.WATCH_LIST.split(",").map((i) => i.trim());

await setupPhalaApi(process.env.PHALA_API_URL);

const THRESHOLD = api.createType(
  "BalanceOf",
  process.env.THRESHOLD ?? "10000000000000"
);
const TOPUP_VALUE = api.createType(
  "BalanceOf",
  process.env.TOPUP_VALUE ?? "10000000000000"
);

logger.info(`Watching ${watchList.length} addresses`, watchList);

let transferTxs = [];
for (const address of watchList) {
  let lastFree = api.createType("BalanceOf", "0");
  let account = await api.query.system.account(address);
  let currentFree = account.data.free
  // console.log(currentFree);

  if (!currentFree.eq(lastFree)) {
    logger.info(
      {
        account: address,
        balance: currentFree.toHuman(),
      },
      "Balance Changed."
    );
  }
  lastFree = currentFree;
  if (currentFree.lt(THRESHOLD)) {
    transferTxs.push(api.tx.balances.transfer(address, TOPUP_VALUE));
    logger.info(
      {
        account: address,
        amount: TOPUP_VALUE.toHuman(),
        currentFree: currentFree.toHuman(),
      },
      "Transferring"
    );
  }
}

const batchPromise = api.tx.utility.batchAll(transferTxs);

console.log("Hex");
console.log(batchPromise.toHex());

process.exit(0)
