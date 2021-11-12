import { keyring, phalaApi as api, setupPhalaApi } from '../utils/api'
import logger from '../utils/logger'

const watchList = process.env.WATCH_LIST.split(',').map(i => i.trim())
const fromAccount = keyring.addFromMnemonic(process.env.MNEMONIC)

await setupPhalaApi(process.env.PHALA_API_URL)

const THRESHOLD = api.createType('BalanceOf', process.env.THRESHOLD ?? '10000000000000')
const TOPUP_VALUE = api.createType('BalanceOf', process.env.TOPUP_VALUE ?? '10000000000000')

const { nonce } = await api.query.system.account(fromAccount.address)

logger.info(`Started with account ${fromAccount.address} and nonce ${nonce}`)
logger.info(`Watching ${watchList.length} addresses`, watchList)

watchList.forEach((address) => {
  let lastFree = api.createType('BalanceOf', '0')
  api.query.system.account(address, async ({ data: { free: currentFree }}) => {
    if (!(currentFree.eq(lastFree))) {
      logger.info({
        account: address,
        balance: currentFree.toHuman()
      }, 'Balance Changed.')
    }
    lastFree = currentFree
    if (currentFree.lt(THRESHOLD)) {
      const transfer = api.tx.balances.transfer(address, TOPUP_VALUE)
      const thisNonce = nonce
      nonce++
      logger.info({
        thisNonce,
        account: address,
        amount: TOPUP_VALUE.toHuman(),
        currentFree: currentFree.toHuman()
      }, 'Transferring')
      const hash = await transfer.signAndSend(fromAccount, { nonce: thisNonce })
      logger.info({ hash, thisNonce }, 'Transfer Sent.')
    }
  })
})
