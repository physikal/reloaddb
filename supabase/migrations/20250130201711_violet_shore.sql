-- Insert confirmation template
SELECT update_email_template(
  'confirmation',
  'Confirm your email',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Confirm your email</title>
</head>
<body style="font-family: system-ui, -apple-system, sans-serif; padding: 2rem; max-width: 600px; margin: 0 auto; color: #1f2937;">
  <div style="background-color: white; border-radius: 0.5rem; padding: 2rem; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);">
    <h1 style="color: #ea580c; font-size: 1.5rem; margin-bottom: 1.5rem;">Welcome to ReloadDB!</h1>
    <p style="margin-bottom: 1.5rem;">Please confirm your email address by clicking the button below:</p>
    <a href="{{ .ConfirmationURL }}" style="display: inline-block; background-color: #ea580c; color: white; padding: 0.75rem 1.5rem; border-radius: 0.375rem; text-decoration: none; font-weight: 500;">
      Confirm Email
    </a>
    <p style="margin-top: 1.5rem; color: #6b7280; font-size: 0.875rem;">
      If you did not create this account, you can safely ignore this email.
    </p>
  </div>
</body>
</html>'
);