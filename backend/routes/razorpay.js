const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const router = express.Router();

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || ''
});

// Create Razorpay order
router.post('/create-order', async (req, res) => {
  try {
    const { amount, customer_email, customer_name, currency = 'INR', program_type = 'co_creator' } = req.body;

    if (!amount || !customer_email || !customer_name) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Create order
    const options = {
      amount: Math.round(amount * 100), // Convert to paise/cents
      currency: currency,
      receipt: `co_creator_${Date.now()}`,
      notes: {
        customer_email,
        customer_name,
        program_type
      }
    };

    const order = await razorpay.orders.create(options);

    res.json({
      success: true,
      order_id: order.id,
      amount: amount,
      currency: currency,
      key_id: process.env.RAZORPAY_KEY_ID,
      message: 'Order created successfully'
    });

  } catch (error) {
    console.error('Razorpay order creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message
    });
  }
});

// Verify payment
router.post('/verify-payment', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Verify signature
    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest('hex');

    if (razorpay_signature === expectedSign) {
      // Payment is verified
      // TODO: Update database with payment details
      
      res.json({
        success: true,
        verified: true,
        payment_id: razorpay_payment_id,
        order_id: razorpay_order_id,
        message: 'Payment verified successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        verified: false,
        message: 'Invalid payment signature'
      });
    }

  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed',
      error: error.message
    });
  }
});

// Webhook handler
router.post('/webhook', async (req, res) => {
  try {
    const webhookSignature = req.headers['x-razorpay-signature'];
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (webhookSecret) {
      // Verify webhook signature
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(JSON.stringify(req.body))
        .digest('hex');

      if (webhookSignature !== expectedSignature) {
        return res.status(400).json({ success: false, message: 'Invalid signature' });
      }
    }

    const event = req.body.event;
    const paymentEntity = req.body.payload.payment.entity;

    console.log('Razorpay webhook event:', event);

    if (event === 'payment.captured') {
      // Payment was successful
      // TODO: Update database
      console.log('Payment captured:', paymentEntity.id);
    } else if (event === 'payment.failed') {
      // Payment failed
      console.log('Payment failed:', paymentEntity.id);
    }

    res.json({ success: true });

  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
