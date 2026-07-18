import { Controller, Get } from '@nestjs/common';

// Lightweight, unauthenticated health check for host uptime probes
// (Render, Cloud Run, Railway, etc all expect a fast 200 response on some
// path to know the container is alive). Resolves to GET /api/health since
// the global 'api' prefix is applied in main.ts.
@Controller()
export class AppController {
  @Get('health')
  health() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
