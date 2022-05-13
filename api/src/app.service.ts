import { Injectable } from '@nestjs/common';
import { Lib, ServerEngine } from 'lance-gg';

@Injectable()
export class AppService {
  
  getHello(): string {
    return 'Hello World!';
  }
}
