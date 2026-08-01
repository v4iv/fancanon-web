export default function verifyEmailTemplate(url: string) {
  return `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8" />
            <title>Confirm Your Email — fancanon</title>
          </head>
          <body style="margin: 0; padding: 0; background-color: #f0fdfa; font-family: 'Helvetica Neue', Helvetica, 'Avenir Next', Avenir, sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center" style="padding: 40px 20px;">
                  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(4, 47, 46, 0.08); overflow: hidden;">
                    <!-- Header -->
                    <tr>
                      <td style="background-color: #042f2e; padding: 20px 40px; text-align: center;">
                        <!-- Title -->
                        <h1><a href="https://fancanon.com" style="color: #5eead4; font-size: 24px; font-weight: 100; letter-spacing: 0.05em; text-decoration: none;">fancanon</a></h1>
                      </td>
                    </tr>
                    <!-- Body -->
                    <tr>
                      <td style="padding: 40px;">
                        <h2 style="margin-top: 0; color: #042f2e; font-size: 20px;">Confirm Your Email</h2>
                        <p style="color: #115e59; font-size: 16px; line-height: 1.5;">
                         Just one more step to get started with your <span style="font-weight: 100;">fancanon</span> account. Click the button below to confirm your email address.
                        </p>
                        <p style="margin: 30px 0; text-align: center;">
                          <a href="${url}" style="background-color: #0d9488; color: #f0fdfa; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">Confirm Email</a>
                        </p>
                        <p style="color: #5eead4; font-size: 14px;">If you didn't sign up for <span style="font-weight: 100;">fancanon</span>, <a href="mailto:support@fancanon.com" style="color: #0f766e;">Contact Us</a> immediately.</p>
                      </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                      <td style="background-color: #f0fdfa; padding: 20px 40px; text-align: center; font-size: 12px; color: #0f766e;">
                        Copyright © ${new Date().getFullYear()} <span style="font-weight: 100; letter-spacing: 0.05em;">fancanon</span> &bull; All rights reserved.
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
        `
}
