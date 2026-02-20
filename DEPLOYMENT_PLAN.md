# AWS Deployment Plan — Viramah

This document outlines the step-by-step procedure for deploying the **Viramah** Next.js application to **AWS Amplify**. This method is chosen for its native support of Next.js SSR/ISR, integrated SSL management, and automated CI/CD pipelines.

---

## 1. Pre-Deployment Checklist
Before starting the process in the AWS Console, ensure the following are ready:

- [ ] **GitHub Repository**: All changes pushed to the `main` branch.
- [ ] **Environment Variables**: Have the values for all keys in `.env.example` (Supabase URLs, Keys, etc.) ready to copy.
- [ ] **Domain Access**: Login credentials for your domain provider (e.g., GoDaddy, Namecheap, or AWS Route 53).

---

## 2. Deployment Steps (AWS Amplify)

### Step 1: Connect Repository
1. Log in to the [AWS Management Console](https://console.aws.amazon.com/).
2. Search for **AWS Amplify** and navigate to the service.
3. Click **"Create new app"** (or "Get Started" under Amplify Hosting).
4. Select **GitHub** as the source provider and authorize AWS to access your account.
5. Choose the `Viramah-main` repository and the `main` branch.

### Step 2: Configure Build Settings
1. **App Name**: Set to `Viramah-Production`.
2. **Build Settings**: Amplify will auto-detect Next.js. Ensure the build command is `npm run build` and the output directory is `.next`.
3. **Environment Variables**:
   * Expand the **Advanced Settings** or **Environment Variables** section.
   * Add the following essential keys:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `NEXT_PUBLIC_APP_URL` (Set this to your final domain, e.g., `https://viramah.com`)
4. **Service Role**: If prompted, allow Amplify to create or use a service role to access your resources.

### Step 3: Deployment & Build
1. Click **Save and Deploy**.
2. Monitor the progress through the four stages: **Provision**, **Build**, **Deploy**, and **Verify**.
3. Once complete, you will receive a temporary `amplifyapp.com` URL to test the site.

---

## 3. Custom Domain & DNS Setup

To replace the temporary URL with your own domain name:

1. In the Amplify sidebar, go to **App Settings > Domain Management**.
2. Click **Add Domain**.
3. Enter your domain name (e.g., `viramah.com`).
4. **Configure Subdomains**:
   * Set up a redirect from `www.viramah.com` to `viramah.com` (Root).
5. **DNS Propagation**:
   * If using **Route 53**: Click "Setup DNS" and AWS will handle the records.
   * If using **External DNS**: AWS will provide **CNAME** and **TXT** records. Copy these into your domain provider's DNS management panel.
6. **SSL Certificate**: AWS will automatically issue and renew a free managed SSL certificate.

---

## 4. Post-Deployment Verification

* [ ] **Functionality Check**: Verify that the "Join Now" and "Email" links in the footer work as expected.
* [ ] **Performance**: Check page load speeds on mobile and desktop.
* [ ] **CI/CD**: Make a small change, push to GitHub, and verify that AWS automatically triggers a new build.

---

## 5. Maintenance & Support
* **Logs**: If the build fails, check the "Build" tab in Amplify for detailed error logs.
* **Redeployment**: You can manually trigger a "Redeploy this version" from the Amplify console if needed.
