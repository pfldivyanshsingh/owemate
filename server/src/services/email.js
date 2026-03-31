const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendVerificationEmail = async (email, name, token) => {
  const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL,
    to: email,
    subject: 'Verify your OweMate account',
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Inter, sans-serif; background: #f4fbf4; padding: 40px;">
        <div style="max-width: 560px; margin: 0 auto; background: white; border-radius: 24px; padding: 40px; box-shadow: 0 12px 32px rgba(22,29,25,0.06);">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="font-family: Manrope, sans-serif; color: #006c49; font-size: 28px; margin: 0;">OweMate</h1>
            <p style="color: #6c7a71; font-size: 14px;">Split bills, not friendships.</p>
          </div>
          <h2 style="color: #161d19; font-size: 22px; margin-bottom: 16px;">Welcome, ${name}! 👋</h2>
          <p style="color: #3c4a42; font-size: 15px; line-height: 1.6;">Please verify your email address to start managing shared expenses with your friends.</p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${verifyUrl}" style="background: linear-gradient(135deg, #006c49, #10B981); color: white; text-decoration: none; padding: 16px 32px; border-radius: 9999px; font-size: 16px; font-weight: 600; display: inline-block;">
              Verify Email
            </a>
          </div>
          <p style="color: #6c7a71; font-size: 13px;">This link expires in 24 hours. If you didn't create an OweMate account, you can safely ignore this email.</p>
        </div>
      </body>
      </html>
    `,
  });
};

const sendPasswordResetEmail = async (email, name, token) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL,
    to: email,
    subject: 'Reset your OweMate password',
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Inter, sans-serif; background: #f4fbf4; padding: 40px;">
        <div style="max-width: 560px; margin: 0 auto; background: white; border-radius: 24px; padding: 40px; box-shadow: 0 12px 32px rgba(22,29,25,0.06);">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="font-family: Manrope, sans-serif; color: #006c49; font-size: 28px; margin: 0;">OweMate</h1>
          </div>
          <h2 style="color: #161d19; font-size: 22px; margin-bottom: 16px;">Password Reset Request</h2>
          <p style="color: #3c4a42; font-size: 15px; line-height: 1.6;">Hi ${name}, we received a request to reset your password.</p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${resetUrl}" style="background: linear-gradient(135deg, #006c49, #10B981); color: white; text-decoration: none; padding: 16px 32px; border-radius: 9999px; font-size: 16px; font-weight: 600; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p style="color: #6c7a71; font-size: 13px;">This link expires in 1 hour. If you didn't request a password reset, please ignore this email.</p>
        </div>
      </body>
      </html>
    `,
  });
};

const sendGroupInviteEmail = async (email, inviterName, groupName, token) => {
  const acceptUrl = `${process.env.CLIENT_URL}/invitations/${token}/accept`;
  const rejectUrl = `${process.env.CLIENT_URL}/invitations/${token}/reject`;

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL,
    to: email,
    subject: `${inviterName} invited you to "${groupName}" on OweMate`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Inter, sans-serif; background: #f4fbf4; padding: 40px;">
        <div style="max-width: 560px; margin: 0 auto; background: white; border-radius: 24px; padding: 40px; box-shadow: 0 12px 32px rgba(22,29,25,0.06);">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="font-family: Manrope, sans-serif; color: #006c49; font-size: 28px; margin: 0;">OweMate</h1>
          </div>
          <h2 style="color: #161d19; font-size: 22px; margin-bottom: 16px;">You're Invited! 🎉</h2>
          <p style="color: #3c4a42; font-size: 15px; line-height: 1.6;"><strong>${inviterName}</strong> has invited you to join the group <strong>"${groupName}"</strong> on OweMate.</p>
          <div style="text-align: center; margin: 32px 0; display: flex; gap: 16px; justify-content: center;">
            <a href="${acceptUrl}" style="background: linear-gradient(135deg, #006c49, #10B981); color: white; text-decoration: none; padding: 14px 28px; border-radius: 9999px; font-size: 15px; font-weight: 600; display: inline-block; margin: 0 8px;">
              Accept Invite
            </a>
            <a href="${rejectUrl}" style="background: #e8f0e9; color: #3c4a42; text-decoration: none; padding: 14px 28px; border-radius: 9999px; font-size: 15px; font-weight: 600; display: inline-block; margin: 0 8px;">
              Decline
            </a>
          </div>
          <p style="color: #6c7a71; font-size: 13px;">If you don't have an OweMate account, you'll be prompted to create one when you accept.</p>
        </div>
      </body>
      </html>
    `,
  });
};

module.exports = { sendVerificationEmail, sendPasswordResetEmail, sendGroupInviteEmail };
