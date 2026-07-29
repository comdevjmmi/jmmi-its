export interface CheckResult {
  status: 'passed' | 'failed';
  name?: string;
  codename?: string;
  message?: string;
}

export interface StaffAnnouncementModel {
  id: string;
  nrp: string;
  name: string;
  codename: string;
  createdAt: Date;
  viewedAt: Date | null;
}
