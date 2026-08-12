import React, { useState } from 'react';
import { 
  CreditCard, 
  ShieldCheck, 
  Leaf, 
  TrendingUp, 
  CheckCircle, 
  Loader2,
  Lock
} from 'lucide-react';
import { ITIssue } from '../types';

interface PaymentFormProps {
  issue: ITIssue;
  onPaymentSuccess: (paymentId: string) => void;
  onCancel: () => void;
}

export default function PaymentForm({ issue, onPaymentSuccess, onCancel }: PaymentFormProps) {
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasPaid, setHasPaid] = useState(false);

  // Formatting helper for card spacing
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 16) value = value.slice(0, 16);
    const matches = value.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length > 0) {
      setCardNumber(parts.join(' '));
    } else {
      setCardNumber(value);
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 4) value = value.slice(0, 4);
    if (value.length > 2) {
      setExpiry(`${value.slice(0, 2)}/${value.slice(2)}`);
    } else {
      setExpiry(value);
    }
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 4) setCvv(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardNumber || !cardName || !expiry || !cvv) return;
    
    setIsProcessing(true);
    
    // Simulate API authorization request
    setTimeout(() => {
      setIsProcessing(false);
      setHasPaid(true);
      // Give real receipt timestamp
      setTimeout(() => {
        onPaymentSuccess(`SB-PAY-${Math.floor(Math.random() * 900000 + 100000)}`);
      }, 2000);
    }, 2500);
  };

  return (
    <div id="payment-gateway-dialog" className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-2xl max-w-xl mx-auto text-slate-800 border-t-4 border-t-[#0f172a]">
      
      {!hasPaid ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Form Header */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-4 font-sans">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <CreditCard className="text-[#dc2626] w-5 h-5" /> Secure Payment Checkout
              </h3>
              <p className="text-xs text-slate-500">Your payment details are protected with 256-bit SSL encryption</p>
            </div>
            <span className="flex items-center gap-1 bg-slate-100 border border-slate-200 text-slate-700 px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> SECURE SSL
            </span>
          </div>

          {/* Pricing Summary */}
          <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-4 space-y-3">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Invoice Details</div>
            
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">IT Solution Task</span>
              <span className="font-semibold text-slate-900 line-clamp-1">{issue.title}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Technician Dispatch Fee</span>
              <span className="font-semibold text-slate-900">${((issue.price) * 0.85).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">SolBridks Platform & Green CO₂ Offset</span>
              <span className="font-semibold text-slate-900">${((issue.price) * 0.15).toFixed(2)}</span>
            </div>

            <div className="h-[1px] bg-slate-200 my-2" />

            <div className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-slate-200">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-semibold text-slate-800">Core Service Insurance Included</span>
              </div>
              <span className="text-[10px] text-slate-500 font-bold">SLA-backed guarantee</span>
            </div>

            <div className="flex justify-between items-center text-sm pt-2 font-bold text-slate-900 border-t border-slate-200 mt-2">
              <span>Total Amount</span>
              <span className="text-xl text-slate-900 font-extrabold">${Number(issue.price).toFixed(2)}</span>
            </div>
          </div>

          {/* Interactive Card Visualizer (Styled as premium Dark Slate card with red accent) */}
          <div className="relative bg-gradient-to-br from-[#0f172a] via-slate-900 to-slate-950 border border-slate-700 p-5 rounded-2xl h-44 flex flex-col justify-between overflow-hidden shadow-xl select-none text-white">
            {/* Ambient Background decoration */}
            <div className="absolute right-0 bottom-0 w-32 h-32 bg-[#dc2626]/20 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex justify-between items-start">
              <div>
                <div className="text-[10px] font-bold text-slate-300 tracking-widest uppercase">SolBridks Corporate Card</div>
                <div className="text-[9px] text-[#dc2626] font-extrabold">Verified secure digital payment</div>
              </div>
              <Lock className="w-4 h-4 text-slate-300" />
            </div>

            <div className="my-2">
              <div id="visual-card-number" className="font-mono text-lg tracking-widest text-white">
                {cardNumber || '•••• •••• •••• ••••'}
              </div>
            </div>

            <div className="flex justify-between items-end">
              <div>
                <label className="text-[8px] uppercase tracking-wider text-slate-400 block">Cardholder</label>
                <div id="visual-card-name" className="text-xs font-semibold uppercase text-white tracking-wider">
                  {cardName || 'YOUR FULL NAME'}
                </div>
              </div>
              <div className="flex gap-4">
                <div>
                  <label className="text-[8px] uppercase tracking-wider text-slate-400 block">Expiry</label>
                  <div className="text-xs font-semibold font-mono text-white">
                    {expiry || 'MM/YY'}
                  </div>
                </div>
                <div>
                  <label className="text-[8px] uppercase tracking-wider text-slate-400 block">CVV</label>
                  <div className="text-xs font-semibold font-mono text-white">
                    {cvv || '•••'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Inputs Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-800">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Card Number</label>
              <input
                id="payment-field-card-number"
                type="text"
                placeholder="4111 2222 3333 4444"
                value={cardNumber}
                onChange={handleCardNumberChange}
                required
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-sm focus:outline-[#0f172a] focus:ring-1 focus:ring-[#0f172a]"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Cardholder Name</label>
              <input
                id="payment-field-card-name"
                type="text"
                placeholder="Jane Doe"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-sm focus:outline-[#0f172a] focus:ring-1 focus:ring-[#0f172a]"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Expiry Date</label>
              <input
                id="payment-field-card-expiry"
                type="text"
                placeholder="MM/YY"
                value={expiry}
                onChange={handleExpiryChange}
                required
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-sm focus:outline-[#0f172a] focus:ring-1 focus:ring-[#0f172a] text-center"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">CVV Code</label>
              <input
                id="payment-field-card-cvv"
                type="password"
                placeholder="123"
                value={cvv}
                onChange={handleCvvChange}
                required
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-sm focus:outline-[#0f172a] focus:ring-1 focus:ring-[#0f172a] text-center"
              />
            </div>
          </div>

          {/* Checkout controls */}
          <div className="flex gap-3 pt-2">
            <button
              id="payment-btn-cancel"
              type="button"
              onClick={onCancel}
              disabled={isProcessing}
              className="flex-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-3 px-4 rounded-xl text-sm transition-all"
            >
              Cancel Payment
            </button>
            <button
              id="payment-btn-submit"
              type="submit"
              disabled={isProcessing}
              className="flex-1 bg-[#0f172a] hover:bg-slate-900 text-white font-extrabold py-3 px-4 rounded-xl text-sm shadow-md active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  Securing Funds...
                </>
              ) : (
                `Pay ${Number(issue.price).toFixed(2)} Securely`
              )}
            </button>
          </div>
        </form>
      ) : (
        /* Payment Complete Success Feedback state */
        <div className="text-center py-10 space-y-6">
          <div className="w-16 h-16 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle className="w-8 h-8 text-emerald-600 animate-pulse" />
          </div>
          <div>
            <h4 className="text-xl font-bold text-slate-900">Payment Successful!</h4>
            <p className="text-sm text-slate-500 mt-1">Your transaction was processed securely. Receipt generated.</p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 max-w-sm mx-auto text-left space-y-3 text-slate-800">
            <span className="text-[9px] bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full uppercase font-extrabold tracking-wider float-right">
              VERIFIED
            </span>
            <div className="text-xs font-bold text-slate-500">Receipt &amp; Service Summary</div>
            
            <div className="text-slate-800 text-xs flex justify-between">
              <span>Quality Check:</span>
              <span className="font-bold text-emerald-700">Passed 100%</span>
            </div>
            <div className="text-slate-800 text-xs flex justify-between">
              <span>Response Time:</span>
              <span className="font-bold text-slate-900">Under 15 mins</span>
            </div>
            <div className="text-slate-800 text-xs flex justify-between">
              <span>Service Guarantee:</span>
              <span className="font-bold text-[#dc2626]">90-Day Warranty</span>
            </div>

            <div className="h-[1px] bg-slate-200 my-2" />

            <div className="text-[10px] text-slate-700 flex items-center gap-1.5 bg-white border border-slate-200 p-2.5 rounded-xl">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Full service guarantee and 90-day warranty active.</span>
            </div>
          </div>

          <p className="text-xs text-slate-500">Generating receipt... Redirecting shortly...</p>
        </div>
      )}
    </div>
  );
}
