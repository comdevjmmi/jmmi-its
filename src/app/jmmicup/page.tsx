import { Metadata } from 'next';
import { redirect } from 'next/navigation';

const title = 'JMMI Cup 2026';
const description = 'Halaman JMMI Cup 2026 JMMI ITS untuk mengakses microsite kompetisi dan informasi kegiatan.';
const JMMICUP_URL = 'https://jmmicup2026.vercel.app/';

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: JMMICUP_URL,
  },
  openGraph: {
    title,
    description,
    url: JMMICUP_URL,
  },
  twitter: {
    title,
    description,
  },
};

export default function JMMICupPage() {
  redirect(JMMICUP_URL);
}
