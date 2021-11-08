
import { ApiPromise, HttpProvider, WsProvider } from '@polkadot/api'
import { Keyring } from '@polkadot/keyring'
import { khala } from '@phala/typedefs'
import { typesChain as phalaTypesChain } from '@phala/typedefs'
import logger from './logger'
import { cryptoWaitReady } from '@polkadot/util-crypto'

const PHALA_SS58_FORMAT = 30

await cryptoWaitReady()
export const keyring = new Keyring({
  type: 'sr25519',
  ss58Format: PHALA_SS58_FORMAT,
})

const typesBundle = {
  spec: {
    khala,
  },
}

const rpc = {
  pha: {
    getStorageChanges: {
      description: 'Return the storage changes made by each block one by one',
      params: [
        {
          name: 'from',
          type: 'Hash',
        },
        {
          name: 'to',
          type: 'Hash',
        },
      ],
      type: 'Vec<StorageChanges>',
    },
    getMqNextSequence: {
      description:
        'Return the next mq sequence number for given sender which take the ready transactions in txpool in count.',
      params: [
        {
          name: 'senderHex',
          type: 'string', // hex string of scale-encoded `MessageOrigin`
        },
      ],
      type: 'u64',
    },
  },
}

let _phalaApi

const setupPhalaApi = async (
  endpoint,
  useHttp = false,
  forceRecreate = false
) => {
  if (!forceRecreate && !!_phalaApi) {
    throw new Error('Phala API already created!')
  }

  const phalaProvider = new (useHttp ? HttpProvider : WsProvider)(endpoint)
  const phalaApi = await ApiPromise.create({
    provider: phalaProvider,
    typesChain: {
      ...phalaTypesChain,
    },
    typesBundle,
    rpc,
    typesAlias: {
      ChainId: 'u8',
    },
  })

  phalaApi.on('disconnected', (e) => {
    logger.info(e)
    if (_phalaApi === phalaApi) {
      process.exit(255)
    }
  })

  const [phalaChain, phalaNodeName, phalaNodeVersion] = (
    await Promise.all([
      phalaApi.rpc.system.chain(),
      phalaApi.rpc.system.name(),
      phalaApi.rpc.system.version(),
    ])
  ).map((i) => i.toString())

  logger.info(
    { chain: phalaChain },
    `Connected to chain ${phalaChain} using ${phalaNodeName} v${phalaNodeVersion}`
  )

  Object.assign(phalaApi, {
    phalaChain,
    phalaNodeName,
    phalaNodeVersion,
    eventsStorageKey: phalaApi.query.system.events.key(),
  })

  _phalaApi = phalaApi

  return phalaApi
}

export {
  _phalaApi as phalaApi,
  setupPhalaApi
}
