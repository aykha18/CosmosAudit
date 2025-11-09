# Razorpay Integration Setup

## 1. Get Razorpay API Keys

1. Sign up at https://razorpay.com/
2. Go to Settings → API Keys
3. Generate Test Keys (for development)
4. Copy the Key ID and Key Secret

## 2. Configure Backend

Add these to `backend/.env`:

```env
RAZORPAY_KEY_ID=rzp_test_your_key_id_here
RAZORPAY_KEY_SECRET=your_key_secret_here
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here
```

## 3. Test Locally

1. **Start Backend:**
   ```bash
   cd backend
   npm start
   ```

2. **Start Frontend:**
   ```bash
   npm run dev
   ```

3. **Open Test Page:**
   Navigate to: http://localhost:3000/#payment-test

4. **Use Test Cards:**
   - Card Number: `4111 1111 1111 1111`
   - CVV: Any 3 digits
   - Expiry: Any future date
   - Name: Any name

## 4. Test Payment Flow

1. Click "Test Payment" button
2. Fill in customer details
3. Select currency (INR or USD)
4. Click "Pay" button
5. Complete payment in Razorpay checkout
6. Check console for payment success data

## 5. Deploy to Railway

Add environment variables in Railway dashboard:

```
RAZORPAY_KEY_ID=rzp_live_your_key_id_here
RAZORPAY_KEY_SECRET=your_live_key_secret_here
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here
```

**Important:** Use LIVE keys for production!

## 6. Webhook Setup (Optional)

1. Go to Razorpay Dashboard → Webhooks
2. Add webhook URL: `https://cosmosaudit.in/api/payments/razorpay/webhook`
3. Select events: `payment.captured`, `payment.failed`
4. Copy the webhook secret and add to environment variables

## Test Cards

### Success Cards
- `4111 1111 1111 1111` - Visa
- `5555 5555 5555 4444` - Mastercard

### Failure Cards
- `4000 0000 0000 0002` - Card declined
- `4000 0000 0000 0069` - Expired card

## Troubleshooting

### Payment fails with "Order creation failed"
- Check if Razorpay keys are set correctly
- Verify backend is running
- Check backend logs for errors

### "Failed to load Razorpay"
- Check internet connection
- Verify Razorpay script is loading (check browser console)

### Signature verification fails
- Ensure RAZORPAY_KEY_SECRET matches the key used to create order
- Check for typos in environment variables

## Integration Points

1. **Payment Test Page:** `http://localhost:3000/#payment-test`
2. **Admin Dashboard:** `http://localhost:3000/#admin`
3. **Main Site:** `http://localhost:3000/`

## Next Steps

- Integrate payment button in CoCreatorSection
- Add payment success page
- Store payment records in database
- Send confirmation emails
- Add payment history in admin dashboard
