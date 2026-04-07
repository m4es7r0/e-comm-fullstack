import 'dotenv/config'
import { buildApp } from './app.js'

const PORT = Number(process.env.BACKEND_PORT ?? 3001)
const HOST = process.env.BACKEND_HOST ?? '0.0.0.0'

async function start() {
  const app = await buildApp()

  try {
    await app.listen({ port: PORT, host: HOST })
    app.log.info(`Server running at http://${HOST}:${PORT}`)
  } catch (error) {
    app.log.error(error)
    process.exit(1)
  }
}

start()
