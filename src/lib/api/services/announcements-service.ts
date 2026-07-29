import prisma from '../db';
import { CheckResult, StaffAnnouncementModel } from '../types/announcements';

export class AnnouncementsService {
  async checkStatus(nrp: string): Promise<CheckResult> {
    const announcement = (await prisma.staffAnnouncement.findUnique({
      where: {
        nrp,
      },
    })) as unknown as StaffAnnouncementModel | null;

    if (!announcement) {
      return {
        status: 'failed',
        name: 'Peserta Seleksi Staff Muda JMMI ITS 2026',
      };
    }

    return {
      status: 'passed',
      name: announcement.name,
      codename: announcement.codename,
    };
  }
}
