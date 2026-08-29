import * as React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kalender',
  description: 'Kalender kegiatan JMMI ITS berisi agenda, jadwal acara, lokasi, dan informasi aktivitas organisasi.',
};

export default function KalenderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
