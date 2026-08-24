import { type NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const { email, message } = await request.json();

    if (!email || !message) {
      return NextResponse.json(
        { error: 'Email dan pesan wajib diisi' },
        { status: 400 }
      );
    }

    const host = process.env.SMTP_HOST || 'smtp-relay.brevo.com';
    const port = Number(process.env.SMTP_PORT) || 587;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const receiver = process.env.CONTACT_RECEIVER_EMAIL || user;

    if (!user || !pass) {
      return NextResponse.json(
        { error: 'Konfigurasi SMTP belum lengkap di server' },
        { status: 500 }
      );
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
    });

    await transporter.sendMail({
      from: `"JMMI ITS Contact" <${user}>`,
      replyTo: email,
      to: receiver,
      subject: `Pesan Baru Contact Us dari ${email}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #146637;">Pesan Baru Contact Us JMMI ITS</h2>
          <p><strong>Pengirim (Email):</strong> ${email}</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p><strong>Isi Pesan:</strong></p>
          <p style="white-space: pre-wrap; background: #f9f9f9; padding: 15px; border-radius: 8px;">${message}</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true, message: 'Pesan berhasil terkirim!' });
  } catch (error: unknown) {
    console.error('[SMTP Contact API Error]:', error);
    const errorMessage = error instanceof Error ? error.message : 'Gagal mengirim email';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
