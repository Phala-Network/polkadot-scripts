`@phala/polkadot-scripts`
----------------------------------------------------------------

Collection of useful scripts for Polkadot.js working with Phala Network.

Before starting:

```bash
https://github.com/Phala-Network/polkadot-scripts
cd polkadot-scipts
npm i -g pnpm bunyan
pnpm install
```

## `watch_and_topup`

Watch the balances of given list of accounts and topup them if they are below the threshold.

Add a comma between accounts in the watch list.

```bash
SCRIPT_NAME=watch_and_topup \
WATCH_LIST=5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty,some_other_address \
MNEMONIC="feed me with some mneonic" \
PHALA_API_URL=wss://khala-api.phala.network/ws \
pnpm start | bunyan
```