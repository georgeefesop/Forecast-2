/**
 * Professional email template for Forecast sign-in magic links
 * Uses brand colors and modern HTML email design
 */

export function getSignInEmailHTML(url: string, host: string): string {
  const appName = "Forecast";
  const appUrl = process.env.NEXTAUTH_URL || "https://forecast.app";
  const brandColor = "#6366f1"; // Indigo
  const brandAccent = "#8b5cf6"; // Purple
  const textColor = "#111827";
  const textSecondary = "#6b7280";
  const borderColor = "#e5e7eb";
  const bgColor = "#ffffff";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sign in to ${appName}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; background-color: #f9fafb; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f9fafb; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; background-color: ${bgColor}; border-radius: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 32px 40px; text-align: center; border-bottom: 1px solid ${borderColor};">
              <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: ${brandColor}; letter-spacing: -0.5px;">
                ${appName}
              </h1>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 600; color: ${textColor}; line-height: 1.3;">
                Sign in to ${appName}
              </h2>
              <p style="margin: 0 0 32px 0; font-size: 16px; line-height: 1.6; color: ${textSecondary};">
                Click the button below to securely sign in to your account. This link will expire in 24 hours.
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td align="center" style="padding: 0 0 32px 0;">
                    <a href="${url}" style="display: inline-block; padding: 14px 32px; background-color: ${brandColor}; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600; text-align: center; box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1); transition: background-color 0.2s;">
                      Sign in to ${appName}
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Alternative Link -->
              <p style="margin: 0 0 32px 0; font-size: 14px; line-height: 1.5; color: ${textSecondary};">
                Or copy and paste this link into your browser:<br>
                <a href="${url}" style="color: ${brandColor}; text-decoration: underline; word-break: break-all;">${url}</a>
              </p>
              
              <!-- Security Notice -->
              <div style="padding: 16px; background-color: #f9fafb; border-radius: 8px; border-left: 4px solid ${brandColor};">
                <p style="margin: 0; font-size: 14px; line-height: 1.5; color: ${textSecondary};">
                  <strong style="color: ${textColor};">Security tip:</strong> If you didn't request this email, you can safely ignore it. This link will only work once and expires in 24 hours.
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 32px 40px; background-color: #f9fafb; border-top: 1px solid ${borderColor}; border-radius: 0 0 12px 12px;">
              <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.5; color: ${textSecondary}; text-align: center;">
                This email was sent to you because someone requested to sign in to ${appName}.
              </p>
              <p style="margin: 0 0 24px 0; font-size: 12px; line-height: 1.5; color: ${textSecondary}; text-align: center;">
                © ${new Date().getFullYear()} ${appName}. All rights reserved.
              </p>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td align="center" style="padding: 0;">
                    <p style="margin: 0; font-size: 12px; line-height: 1.5;">
                      <a href="${appUrl}/privacy" style="color: ${textSecondary}; text-decoration: none; margin: 0 12px;">Privacy Policy</a>
                      <span style="color: ${borderColor}; margin: 0 8px;">|</span>
                      <a href="${appUrl}/support" style="color: ${textSecondary}; text-decoration: none; margin: 0 12px;">Support</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        
        <!-- Bottom Spacing -->
        <p style="margin: 32px 0 0 0; font-size: 12px; color: ${textSecondary}; text-align: center;">
          You're receiving this because you requested a sign-in link for ${appName}.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export function getSignInEmailText(url: string, host: string): string {
  const appName = "Forecast";
  return `
Sign in to ${appName}

Click the link below to securely sign in to your account. This link will expire in 24 hours.

${url}

If you didn't request this email, you can safely ignore it.

© ${new Date().getFullYear()} ${appName}. All rights reserved.
  `.trim();
}
