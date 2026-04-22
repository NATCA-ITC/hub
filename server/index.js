import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import cookie from '@fastify/cookie'
import proxy from '@fastify/http-proxy'
import fstatic from '@fastify/static'

const __dirname = dirname(fileURLToPath(import.meta.url))
const isProd = process.env.NODE_ENV === 'production'
const PORT = parseInt(process.env.PORT || '1301', 10)
const CLIENT_PORT = parseInt(process.env.CLIENT_PORT || '1302', 10)
const PLATFORM_URL = process.env.PLATFORM_API_URL || 'http://localhost:1300'

const app = Fastify({ logger: true })

// Security headers
await app.register(helmet, {
  contentSecurityPolicy: false, // SPA handles its own CSP
})

// Cookies — forward to Platform for session validation
await app.register(cookie)

// CORS — allow the Vite dev server in development
if (!isProd) {
  await app.register(cors, {
    origin: `http://localhost:${CLIENT_PORT}`,
    credentials: true,
  })
}

// Proxy /api/* to Platform — forwards cookies for session auth
await app.register(proxy, {
  upstream: PLATFORM_URL,
  prefix: '/api',
  rewritePrefix: '/api',
  http2: false,
  httpMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  preHandler: (request, reply, done) => {
    // Log proxied requests in dev
    if (!isProd) {
      app.log.info({ path: request.url, method: request.method }, 'Proxying to Platform')
    }
    done()
  },
})

// Health check
app.get('/health', async () => ({ status: 'ok', service: 'hub', timestamp: new Date().toISOString() }))

// Production: serve built SPA from dist/
if (isProd) {
  await app.register(fstatic, {
    root: resolve(__dirname, '../dist'),
    prefix: '/',
  })

  // SPA fallback — all non-file routes serve index.html
  app.setNotFoundHandler((request, reply) => {
    if (request.url.startsWith('/api/')) {
      reply.status(404).send({ error: 'Not found' })
    } else {
      reply.sendFile('index.html')
    }
  })
}

// Start
try {
  await app.listen({ port: PORT, host: '0.0.0.0' })
  app.log.info(`Hub server listening on port ${PORT}`)
  app.log.info(`Platform upstream: ${PLATFORM_URL}`)
  if (isProd) {
    app.log.info('Serving static files from dist/')
  }
} catch (err) {
  app.log.error(err)
  process.exit(1)
}
