# Email Notifications for InvexShop

This document provides instructions for setting up and using the email notification system in InvexShop.

## Overview

InvexShop now includes email notifications for:
- Order confirmations (sent when a customer completes checkout)
- Shipping confirmations (sent when an order status is changed to 'shipped')

The email system uses [Resend](https://resend.com) as the email delivery service.

## Setup Instructions

### 1. Create a Resend Account

1. Sign up for a Resend account at [resend.com](https://resend.com)
2. Create an API key in your Resend dashboard
3. Verify your domain in Resend (recommended for production)

### 2. Configure Environment Variables

Add the following variables to your `.env` file:

```
# Email Configuration
RESEND_API_KEY=re_your_resend_api_key
FROM_EMAIL=orders@yourdomain.com
STORE_NAME=InvexShop
SUPPORT_EMAIL=support@yourdomain.com
SUPPORT_HOURS=Monday-Friday, 9am-5pm EST

# Social Media URLs
DISCORD_URL=https://discord.gg/yourserver
YOUTUBE_URL=https://www.youtube.com/@yourchannel
TIKTOK_URL=https://www.tiktok.com/@youraccount
```

- `RESEND_API_KEY`: Your API key from Resend
- `FROM_EMAIL`: The email address that will appear as the sender (should be from your verified domain)
- `STORE_NAME`: The name of your store that will appear in emails
- `SUPPORT_EMAIL`: The email address for customer support
- `SUPPORT_HOURS`: The business hours for customer support
- Social media URLs: Links to your Discord server, YouTube channel, and TikTok account

### 3. Testing the Email System

There are two ways to test the email functionality:

#### Using the Test Page

1. Navigate to `/test-email` in your browser
2. Enter an order reference and optionally a test email address
3. Click "Send Test Email" to send an order confirmation email
4. Or use the "Shipping Confirmation" tab to test shipping emails

#### Through Normal Workflow

1. Create a test order through the checkout process
2. The system will automatically send an order confirmation email when the checkout success page loads
3. In the admin panel, update an order status to 'shipped' and add tracking information
4. The system will automatically send a shipping confirmation email

## Email Templates

The email templates are defined in `lib/email.ts`. They include:

- Order confirmation email with order details and a link to track the order
- Shipping confirmation email with tracking information and carrier details

## Architecture

The email system follows a server-side architecture to ensure security and reliability:

1. **Server-Side Email Service** (`lib/email.ts`)
   - Marked with 'use server' directive to ensure it only runs on the server
   - Client-side detection to prevent browser execution
   - Modular template generation with shared components
   - Standardized error handling with typed error responses

2. **Server Actions** (`app/actions/email-actions.ts`)
   - Provides type-safe server functions for sending emails
   - Handles validation and error handling
   - Can be called directly from client components
   - Returns consistent response format with error codes

3. **Integration Points**
   - Stripe webhook handler for automatic order confirmation emails
   - Order status updates for shipping confirmation emails
   - Checkout success page for client-side triggered emails

## How It Works

### Order Confirmation Emails

Order confirmation emails are sent when:

1. **Checkout Success Page**: When a customer completes checkout and lands on the success page, the client component calls the server action to send an order confirmation email.

2. **Stripe Webhook**: When a checkout session is completed, the webhook handler automatically sends an order confirmation email.

3. **Test Page**: You can manually trigger order confirmation emails for existing orders using the test page at `/test-email`.

### Shipping Confirmation Emails

Shipping confirmation emails are sent when:

1. **Admin Panel**: An admin updates an order status to 'shipped' and adds tracking information.

2. **Order Status API**: The `/api/stripe/order/status` endpoint is called with a status of 'shipped' and tracking information.

3. **Test Page**: You can manually trigger shipping confirmation emails using the test page at `/test-email`.

## Error Handling

The email system includes comprehensive error handling:

1. **Typed Errors**: The email service returns typed error responses with specific error codes.

2. **Detailed Logging**: All email operations are logged with appropriate severity levels.

3. **Client-Side Protection**: The email service includes checks to prevent client-side execution.

4. **Validation**: Input validation is performed at multiple levels to ensure data integrity.

## Customization

To customize the email templates:

1. **Basic Customization**: Update the environment variables to change store name, support information, etc.

2. **Template Customization**: Edit the template functions in `lib/email.ts`:
   - `createBaseEmailTemplate`: For the overall email structure
   - `createHelpSection`: For the help/support section
   - `generateOrderConfirmationEmail`: For order confirmation emails
   - `generateShippingConfirmationEmail`: For shipping confirmation emails

3. **Advanced Customization**: The templates use HTML with inline CSS for maximum compatibility with email clients. You can modify the HTML/CSS to match your brand.

## Troubleshooting

If emails are not being sent:

1. Check that your Resend API key is correct
2. Verify that the `FROM_EMAIL` is from a domain you've verified in Resend
3. Check the application logs for any error messages related to email sending
4. Ensure the order has a valid customer email address
5. Use the test page at `/test-email` to verify the email functionality

## Support

For issues with the email system:

- Check the Resend documentation at [resend.com/docs](https://resend.com/docs)
- Review the implementation in `lib/email.ts`
- Examine the checkout success page in `app/checkout/success/page.tsx` for order confirmation emails
- Check the order status update API in `app/api/stripe/order/status/route.ts` for shipping confirmation emails 