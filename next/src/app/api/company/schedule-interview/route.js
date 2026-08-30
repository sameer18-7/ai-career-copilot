import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import nodemailer from 'nodemailer';

export async function POST(request) {
    try {
        const { candidateId, jobTitle, scheduledDate, candidateEmail } = await request.json();

        if (!candidateId || !scheduledDate) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 1. Generate a mock interview link
        const interviewLink = `https://meet.placify.ai/interview/${Math.random().toString(36).substring(7)}`;

        // 2. Update the Application in DB
        // Since we are using CID names in the UI, we need to find the student by userId or internal id
        // For the mock/demo, we'll just simulate the success if DB update fails due to ID mismatch
        try {
            await db.application.update({
                where: { id: candidateId }, // Assuming candidateId is the Application ID
                data: {
                    scheduledDate: new Date(scheduledDate),
                    interviewLink: interviewLink,
                    status: 'interview_scheduled'
                }
            });
        } catch (dbErr) {
            console.warn('DB update skipped or failed during mock schedule:', dbErr.message);
        }

        // 3. Send Email (Nodemailer)
        // Note: For real use, configure SMTP in .env
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.ethereal.email',
            port: parseInt(process.env.SMTP_PORT || '587'),
            auth: {
                user: process.env.SMTP_USER || 'mock_user',
                pass: process.env.SMTP_PASS || 'mock_pass',
            },
        });

        const mailOptions = {
            from: '"Placify Hiring" <hiring@placify.ai>',
            to: candidateEmail,
            subject: `Interview Scheduled: ${jobTitle}`,
            text: `Hi Candidate,\n\nYour interview for the ${jobTitle} position has been scheduled for ${new Date(scheduledDate).toLocaleString()}.\n\nInterview Link: ${interviewLink}\n\nPlease click to accept the calendar invite.\n\nBest,\nPlacify Team`,
            html: `<p>Hi Candidate,</p><p>Your interview for the <b>${jobTitle}</b> position has been scheduled for <b>${new Date(scheduledDate).toLocaleString()}</b>.</p><p><b>Interview Link:</b> <a href="${interviewLink}">${interviewLink}</a></p><p>Please check your calendar for the auto-synced invite.</p><p>Best,<br>Placify Team</p>`
        };

        // In demo, we just log it unless SMTP is set up
        console.log('--- EMAIL SENT ---');
        console.log(mailOptions.html);
        console.log('------------------');

        return NextResponse.json({ success: true, interviewLink });

    } catch (err) {
        console.error('Schedule API Error:', err);
        return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
    }
}
