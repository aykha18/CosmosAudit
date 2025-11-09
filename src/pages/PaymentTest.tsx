import React, { useState } from 'react';
import RazorpayCheckout from '../components/payment/RazorpayCheckout';

const PaymentTest: React.FC = () => {
  const [showPayment, setShowPayment] = useState(false);
  const [paymentResult, setPaymentResult] = useState<any>(null);

  const handlePaymentSuccess = (data: any) => {
    console.log('Payment successful:', data);
    setPaymentResult({ success: true, data });
    setShowPayment(false);
    alert('Payment successful! Check console for details.');
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error);
    setPaymentResult({ success: false, error });
    alert(`Payment failed: ${error}`);
  };

  const handlePaymentCancel = () => {
    console.log('Payment cancelled');
    setShowPayment(false);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Razorpay Payment Test</h1>

        {!showPayment ? (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-4">Test Payment Integration</h2>
              <p className="text-gray-400 mb-6">
                Click the button below to test the Razorpay payment flow.
              </p>
              
              <button
                onClick={() => setShowPayment(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-lg text-lg font-semibold"
              >
                Test Payment (₹57,851)
              </button>
            </div>

            {paymentResult && (
              <div className={`bg-gray-900 border rounded-xl p-6 ${
                paymentResult.success ? 'border-green-500' : 'border-red-500'
              }`}>
                <h3 className="text-xl font-bold mb-4">
                  {paymentResult.success ? '✅ Payment Result' : '❌ Payment Error'}
                </h3>
                <pre className="bg-gray-950 p-4 rounded overflow-auto text-sm">
                  {JSON.stringify(paymentResult, null, 2)}
                </pre>
              </div>
            )}

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4">Setup Instructions</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-400">
                <li>Add your Razorpay keys to <code className="bg-gray-950 px-2 py-1 rounded">backend/.env</code></li>
                <li>Restart the backend server</li>
                <li>Click "Test Payment" button above</li>
                <li>Use Razorpay test cards for testing</li>
              </ol>
              
              <div className="mt-4 p-4 bg-gray-950 rounded">
                <p className="font-semibold mb-2">Test Card Details:</p>
                <p className="text-sm text-gray-400">Card Number: 4111 1111 1111 1111</p>
                <p className="text-sm text-gray-400">CVV: Any 3 digits</p>
                <p className="text-sm text-gray-400">Expiry: Any future date</p>
              </div>
            </div>
          </div>
        ) : (
          <RazorpayCheckout
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
            onCancel={handlePaymentCancel}
            amount={57851}
          />
        )}
      </div>
    </div>
  );
};

export default PaymentTest;
