-- Insert recovery template
SELECT update_email_template(
  'recovery',
  'Reset your password',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Reset your password</title>
</head>
<body style="font-family: system-ui, -apple-system, sans-serif; padding: 2rem; max-width: 600px; margin: 0 auto; color: #1f2937;">
  <div style="background-color: white; border-radius: 0.5rem; padding: 2rem; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);">
    <h1 style="color: #ea580c; font-size: 1.5rem; margin-bottom: 1.5rem;">Reset Your Password</h1>
    <p style="margin-bottom: 1.5rem;">You requested to reset your password. Click the button below to choose a new password:</p>
    <a href="{{ .ConfirmationURL }}" style="display: inline-block; background-color: #ea580c; color: white; padding: 0.75rem 1.5rem; border-radius: 0.375rem; text-decoration: none; font-weight: 500;">
      Reset Password
    </a>
    <p style="margin-top: 1.5rem; color: #6b7280; font-size: 0.875rem;">
      If you did not request a password reset, you can safely ignore this email.
      <br>This link will expire in 24 hours.
    </p>
  </div>
</body>
</html>'
);