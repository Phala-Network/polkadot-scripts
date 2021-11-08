import { createLogger } from 'bunyan'

export const logger = createLogger({
  level: process.env.LOG_LEVEL ?? 'info',
  name: 'phala'
})
export const loggerLevel = logger.level()
logger.info({ loggerLevel }, 'Logging Enabled.')


export default logger