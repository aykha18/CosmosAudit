import React, { useState, useEffect } from 'react';
import { CreditCard, Smartphone, Building, ArrowLeft, Loader } from 'lucide-react';

interface RazorpayCheckoutProps {
  onSuccess: (paymentData: any) => void;
  onError: (error: string) => void;
  onCancel: () => void;
  customerEmail?: string;
  customerName?: string;
  amount?: number;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

const RazorpayCheckout: React.FC<RazorpayCheckoutProps> = ({
  onSuccess,
  onError,
  onCancel,
  customerEmail = '',
  customerName = '',
  amount = 57851
}) => {
  const [selectedCurrency, setSelectedCurrency] = useState<string>('INR');
  const [customerDetails, setCustomerDetails] = useState({
    name: customerName,
    email: customerEmail
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  // Update customer details when props change
  useEffect(() => {
    if (customerName || customerEmail) {
      setCustomerDetails({
        name: customerName,
        email: customerEmail
      });
    }
  }, [customerName, customerEmail]);

  const baseAmountINR = amount;
  const baseAmountUSD = 549; // Fixed USD amount

  const currencyInfo = {
    currency: selectedCurrency,
    amount: selectedCurrency === 'INR' ? baseAmountINR : baseAmountUSD,
    symbol: selectedCurrency === 'INR' ? '₹' : '$',
    displayAmount: selectedCurrency === 'INR' ? `₹${baseAmountINR.toLocaleString()}` : `$${baseAmountUSD}`
  };

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => {
      setRazorpayLoaded(true);
      console.log('✅ Razorpay script loaded successfully');
    };
    script.onerror = () => {
      console.error('❌ Failed to load Razorpay script');
      onError('Failed to load Razorpay. Please refresh and try again.');
    };
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [onError]);

  const createRazorpayOrder = async () => {
    try {
      const API_BASE = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:8080';
      const response = await fetch(`${API_BASE}/api/payments/razorpay/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: currencyInfo.amount,
          customer_email: customerDetails.email,
          customer_name: customerDetails.name,
          currency: selectedCurrency,
          program_type: 'co_creator'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create payment order');
      }

      const orderData = await response.json();
      
      if (!orderData.success) {
        throw new Error(orderData.message || 'Failed to create order');
      }

      return orderData;
    } catch (error) {
      console.error('Order creation error:', error);
      throw error;
    }
  };

  const handlePayment = async () => {
    console.log('Customer details:', customerDetails);
    console.log('Props - Name:', customerName, 'Email:', customerEmail);
    
    if (!customerDetails.name || !customerDetails.email) {
      onError('Please fill in all required fields');
      return;
    }

    if (!razorpayLoaded) {
      onError('Payment system is still loading. Please wait a moment and try again.');
      return;
    }

    setIsProcessing(true);

    try {
      const orderData = await createRazorpayOrder();

      const options = {
        key: orderData.key_id,
        amount: Math.round(currencyInfo.amount * 100),
        currency: selectedCurrency,
        name: 'CosmosAudit',
        description: 'Co-Creator Program Access',
        order_id: orderData.order_id,
        prefill: {
          name: customerDetails.name,
          email: customerDetails.email
        },
        theme: {
          color: '#3b82f6'
        },
        handler: function(response: any) {
          handlePaymentSuccess(response, orderData);
        },
        modal: {
          ondismiss: function() {
            setIsProcessing(false);
            onCancel();
          }
        }
      };

      const rzp = new window.Razorpay(options);
      
      rzp.on('payment.failed', function (response: any) {
        console.error('❌ Razorpay payment failed:', response.error);
        setIsProcessing(false);
        onError(`Payment failed: ${response.error.description || 'Unknown error'}`);
      });

      rzp.open();
    } catch (error) {
      setIsProcessing(false);
      onError(error instanceof Error ? error.message : 'Payment initialization failed');
    }
  };

  const handlePaymentSuccess = async (razorpayResponse: any, orderData: any) => {
    try {
      const API_BASE = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:8080';
      const verifyResponse = await fetch(`${API_BASE}/api/payments/razorpay/verify-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          razorpay_order_id: razorpayResponse.razorpay_order_id,
          razorpay_payment_id: razorpayResponse.razorpay_payment_id,
          razorpay_signature: razorpayResponse.razorpay_signature
        })
      });

      const verifyData = await verifyResponse.json();

      if (verifyData.success && verifyData.verified) {
        onSuccess({
          transactionId: razorpayResponse.razorpay_payment_id,
          orderId: razorpayResponse.razorpay_order_id,
          amount: currencyInfo.amount,
          currency: selectedCurrency,
          customerEmail: customerDetails.email,
          customerName: customerDetails.name,
          paymentMethod: 'razorpay'
        });
      } else {
        onError('Payment verification failed. Please contact support.');
      }
    } catch (error) {
      onError('Payment verification failed. Please contact support.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl mx-auto overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Join Co-Creator Program</h2>
            <p className="opacity-90">Secure payment powered by Razorpay</p>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Select Your Currency</h3>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setSelectedCurrency('INR')}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                selectedCurrency === 'INR'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-2">🇮🇳</span>
                <span className="font-semibold">Indian Rupees</span>
              </div>
              <div className="text-2xl font-bold text-green-600">₹{baseAmountINR.toLocaleString()}</div>
              <div className="text-sm text-gray-600 flex items-center mt-1">
                <Smartphone className="w-4 h-4 mr-1" />
                UPI, Cards, Net Banking
              </div>
            </button>

            <button
              onClick={() => setSelectedCurrency('USD')}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                selectedCurrency === 'USD'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-2">🌍</span>
                <span className="font-semibold">US Dollars</span>
              </div>
              <div className="text-2xl font-bold text-green-600">${baseAmountUSD}</div>
              <div className="text-sm text-gray-600 flex items-center mt-1">
                <CreditCard className="w-4 h-4 mr-1" />
                International Cards
              </div>
            </button>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Your Details</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                value={customerDetails.name}
                onChange={(e) => setCustomerDetails(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your full name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                value={customerDetails.email}
                onChange={(e) => setCustomerDetails(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your email address"
                required
              />
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">Co-Creator Program</span>
            <span className="font-semibold">{currencyInfo.displayAmount}</span>
          </div>
          <div className="flex justify-between items-center text-sm text-gray-500">
            <span>One-time payment</span>
            <span>Lifetime access</span>
          </div>
        </div>

        <button
          onClick={handlePayment}
          disabled={isProcessing || !razorpayLoaded}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 text-lg font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isProcessing ? (
            <>
              <Loader className="w-5 h-5 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              Pay {currencyInfo.displayAmount}
            </>
          )}
        </button>

        <div className="text-center mt-4">
          <p className="text-xs text-gray-500">
            🔒 Secure payment powered by Razorpay • 256-bit SSL encryption
          </p>
        </div>
      </div>
    </div>
  );
};

export default RazorpayCheckout;
