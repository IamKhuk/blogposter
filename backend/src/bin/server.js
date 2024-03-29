require("../lib/bootstrap")
const pEvent = require("p-event")
const createServerAndListen = require("../lib/server")
const config = require("config")
const logger = require("../lib/logger")
const db = require("../lib/db")
// const redis = require("redis");

const app = require("../lib/app")

async function main() {
  const host = config.get("server.host")
  const port = config.get("server.port")
  let server

  try {
    await db.select(db.raw("1"))
    logger.debug("Database connected")


    // const client = await redis.createClient({
    //   host:"redis",
    //   port: 6379
    // })
    // .on('error', err => console.log('Redis Client Error', err))
    // .connect();

    // await client.set('siteConfigs', '{ theme: "black", isMobile: true }');
    // const value = await client.get('siteConfigs');
    // await client.disconnect();
    logger.debug(`Redis is set!`)

    server = await createServerAndListen(app, port, host)
    logger.debug(`Server is listening on: ${host}:${port}`)



    await Promise.race([
      ...["SIGINT", "SIGHUP", "SIGTERM"].map(s =>
        pEvent(process, s, {
          rejectionEvents: ["uncaughtException", "unhandledRejection"],
        }),
      ),
    ])


  } catch (err) {
    process.exitCode = 1
    logger.fatal(err)
  } finally {
    if (server) {
      logger.debug("Close server")
      await server.stop()
      logger.debug("Server closed")
    }

    logger.debug("Close database")
    await db.destroy()
    logger.debug("Database closed")

    setTimeout(() => process.exit(), 10000).unref()
  }
}

main()
