# Prodexa Notification Service - Production Setup Guide

## Overview
The Notification service handles all email communications for Prodexa using the Resend email service.

## Current Status
✅ Service architecture is production-ready  
✅ Robust error handling implemented  
✅ Proper logging for debugging  
✅ Queue-based message processing  

## Production Configuration Steps

### 1. Verify Your Domain on Resend
Currently, the service is in **sandbox mode** which restricts emails to your verified account only.

**To go live:**

1. Go to [resend.com/domains](https://resend.com/domains)
2. Click "Add Domain"
3. Enter your domain (e.g., `prodexa.com`)
4. Follow DNS verification instructions from Resend
5. Once verified, update your `.env` file:

```env
EMAIL_FROM=noreply@prodexa.com
```

### 2. Environment Variables Required

```env
# Resend API Configuration
RESEND_API_KEY=your_resend_api_key_here
EMAIL_FROM=noreply@yourdomain.com  # Your verified domain

# RabbitMQ Configuration
RABBIT_URL=amqps://user:pass@host/vhost

# Optional: Legacy email service (if you want to keep as fallback)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

### 3. Email Templates

The service sends 4 types of emails:

#### a) Welcome Email (User Registration)
- **Queue**: `NOTIF_AUTH.USER_CREATED`
- **Template**: Welcome message with instructions
- **Data required**: `email`, `username`

#### b) Payment Success Notification
- **Queue**: `PAYMENT.NOTIFICATION_COMPLETED`
- **Template**: Order confirmation with payment details
- **Data required**: `email`, `username`, `orderId`, `amount`, `currency`

#### c) Payment Failure Notification
- **Queue**: `PAYMENT.NOTIFICATION_FAILED`
- **Template**: Payment error with retry instructions
- **Data required**: `email`, `username`, `orderId`, `reason` (optional)

#### d) Product Creation Notification
- **Queue**: `PRODUCT_NOTIFICATION.PRODUCT_CREATED`
- **Template**: Product live announcement
- **Data required**: `email`, `username`, `productId`, `productName` (optional)

### 4. Error Handling

The service includes:
- ✅ Validation for required fields
- ✅ Graceful error logging
- ✅ Message queue acknowledgment (prevents message loss)
- ✅ Automatic retry on RabbitMQ reconnection
- ✅ Detailed error reporting with timestamps

### 5. Monitoring & Debugging

Check logs for:
- Email delivery status
- Message processing errors
- RabbitMQ connection issues

Log format includes:
```
✅ Email delivered successfully
❌ Email sending failed
📧 Processing notification for: [user]
```

### 6. Rate Limiting

Resend has rate limits:
- **Free plan**: 100 emails/day
- **Paid plan**: Higher limits available

Check your Resend dashboard for usage statistics.

### 7. Testing in Production

1. **Test with your verified email:**
   ```javascript
   // Will work in sandbox mode
   await sendEmail({
     email: "arshanw94@gmail.com",
     subject: "Test",
     html: "<p>Test email</p>"
   })
   ```

2. **Once domain is verified:**
   ```javascript
   // Will work for any email
   await sendEmail({
     email: "any-user@example.com",
     subject: "Welcome",
     html: "<p>Welcome email</p>"
   })
   ```

## Deployment Checklist

- [ ] Resend account created and API key added
- [ ] Domain verified on Resend
- [ ] `EMAIL_FROM` environment variable set to verified domain
- [ ] `RESEND_API_KEY` added to production environment
- [ ] RabbitMQ credentials verified
- [ ] Email templates reviewed and tested
- [ ] Logs configured for monitoring
- [ ] Rate limits understood
- [ ] Backup email service (if needed) configured

## Troubleshooting

### Issue: "You can only send testing emails to your own email address"
**Solution**: Verify your domain on Resend (see step 1 above)

### Issue: "RESEND_API_KEY is not configured"
**Solution**: Check that `RESEND_API_KEY` is set in your environment

### Issue: Messages not being processed
**Solution**: 
1. Check RabbitMQ connection
2. Verify queue names match between services
3. Check application logs

### Issue: High bounce rate
**Solution**:
1. Verify email addresses in database
2. Check email templates for spam triggers
3. Monitor sender reputation on Resend dashboard

## Production Best Practices

1. **Email Validation**: Validate email format before sending
2. **Retry Logic**: Implement exponential backoff for failed sends
3. **Monitoring**: Set up alerts for failed emails
4. **Logging**: Keep detailed logs for audit trails
5. **Templates**: Test email templates across clients
6. **Sender Reputation**: Monitor bounce/spam rates
7. **Unsubscribe**: Include unsubscribe links in marketing emails
8. **GDPR**: Handle user data according to regulations

## Contact & Support

- Resend Documentation: https://resend.com/docs
- Email Support: support@resend.com
- Status Page: https://status.resend.com
