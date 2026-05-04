import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getHealth() {
    return {
      name: 'Lucky Lemurs API',
      status: 'ok',
    };
  }
}
