# Supabase Email Templates

This directory contains custom email templates for the Infina Financial Hub application's authentication flows.

## Available Templates

### English Templates

1. **Password Reset Email** (`reset-password.html`): Sent when a user requests a password reset
2. **Signup Confirmation Email** (`signup-confirmation.html`): Sent to new users to confirm their email address

### Vietnamese Templates

1. **Password Reset Email (Vietnamese)** (`reset-password-vi.html`): Vietnamese version of the password reset email
2. **Signup Confirmation Email (Vietnamese)** (`signup-confirmation-vi.html`): Vietnamese version of the signup confirmation email

## How to Configure Email Templates in Supabase

To use these custom email templates in your Supabase project, follow these steps:

1. Log in to the [Supabase Dashboard](https://app.supabase.io/)
2. Select your project: "Infina Financial Hub"
3. Navigate to **Authentication** > **Email Templates** in the left sidebar
4. For each template you want to customize:
   - Select the template type (e.g., "Confirm Signup" or "Reset Password")
   - Toggle the "Custom Template" option to enable it
   - Copy and paste the HTML content from the respective template file in this directory
   - Use the "Test" button to send a test email and preview your template
   - Save the changes

### Configuring Multilingual Templates

Supabase doesn't natively support multiple languages in email templates. To implement multilingual email templates, you'll need to use one of these approaches:

#### Option 1: Language Detection in Supabase Edge Functions

1. Create a Supabase Edge Function that intercepts the email sending process
2. Detect the user's preferred language (stored in your user metadata)
3. Choose the appropriate template based on the user's language preference
4. Send the customized email using the Supabase Admin API

#### Option 2: Language Selection on Auth Pages

1. Add language selection to your authentication pages
2. Store the selected language in a query parameter or local storage
3. Pass the language preference to your authentication calls
4. Use this preference in your application's Supabase client setup

### Important Variables

These templates use the following Supabase template variables:

- `{{ .ConfirmationURL }}` - The URL that users need to click to complete the action (confirm signup or reset password)

## Design Guidelines

The templates follow the Infina Financial Hub brand guidelines:

- Brand colors: Blue gradient (#3b82f6 to #14b8a6)
- Clean, modern design with a mobile-responsive layout
- Clear calls-to-action

## Testing

Always test your templates after updating them by:

1. Using the "Test" button in the Supabase dashboard
2. Testing the actual signup and password reset flows in your application

## Troubleshooting

If emails are not being delivered:

1. Check spam folders
2. Verify the SMTP configuration in Supabase
3. Ensure your domain is properly configured for email deliverability
