# Supabase email confirmation and OTP

## Hosted project (Dashboard)

1. **Authentication → Providers → Email**  
   Enable **Confirm email** so new accounts stay unverified until the user enters the code.

2. **Authentication → Email templates → Confirm signup**  
   Replace the default “follow this link” body with a template that shows the **6-digit OTP** using `{{ .Token }}` (same syntax as [Supabase email templates](https://supabase.com/docs/guides/auth/auth-email-templates)). You can copy the HTML from [`supabase/templates/confirmation.html`](https://github.com/your-org/campuslance/blob/main/supabase/templates/confirmation.html) in this repo, or paste a minimal version:

   ```html
   <h2>Verify your email</h2>
   <p>Your one-time code:</p>
   <p style="font-size:1.75rem;font-weight:700;letter-spacing:0.35em">{{ .Token }}</p>
   <p>Enter this code in the app. It expires shortly.</p>
   <p>Account: {{ .Email }}</p>
   ```

   Avoid relying only on `{{ .ConfirmationURL }}` if you want users to verify inside the app’s OTP screen.

3. **Authentication → URL configuration**  
   Set **Site URL** to your deployed origin (or `http://localhost:5173` for local Vite). Under **Redirect URLs**, allow the same origins you use in `emailRedirectTo` (the app uses `${window.location.origin}/dashboard` on signup and resend).

After changes, run through signup in staging and confirm the email shows the token and that `/verify-otp` accepts it.

## Local Supabase CLI

This repo wires the confirmation email in [`supabase/config.toml`](c:\Users\omswe\Downloads\work\campuslance\supabase\config.toml) to [`supabase/templates/confirmation.html`](c:\Users\omswe\Downloads\work\campuslance\supabase\templates\confirmation.html). Restart local services so Auth reloads templates: `supabase stop && supabase start`.
