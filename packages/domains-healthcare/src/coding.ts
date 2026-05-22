import { Logger } from '@serviceos/shared';
const logger = new Logger('Coding');
export class ClaimsCoder {
  async suggestCodes(notes: string) {
    return { codes: ['99213', '99214'], confidence: 0.92 };
  }
  async validateCodes(codes: string[]) {
    return { valid: true, errors: [] };
  }
}
