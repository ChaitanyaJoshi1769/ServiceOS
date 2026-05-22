import { Logger } from '@serviceos/shared';
const logger = new Logger('PatientIntake');
export class PatientIntake {
  async createPatient(data: any) {
    logger.info('Creating patient record');
    return { patientId: `pat_${Date.now()}`, created: true };
  }
  async collectInfo(patientId: string) {
    return { collected: true, fields: 15 };
  }
}
