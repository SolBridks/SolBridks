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
    <div id="payment-gateway-dialog" className="bg-white border border-[#e9e7df] rounded-2xl p-6 shadow-2xl max-w-xl mx-auto text-[#3d4234]">
      
      {!hasPaid ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Form Header */}
          <div className="flex items-center justify-between border-b border-[#e9e7df] pb-4 font-sans">
            <div>
              <h3 className="text-lg font-bold text-[#2c3124] flex items-center gap-2">
                <CreditCard className="text-[#5a5a40] w-5 h-5" /> Secure SolBridks Payment Gateway
              </h3>
              <p className="text-xs text-[#8a8d81]">Your connection is 256-bit AES encrypted</p>
            </div>
            <span className="flex items-center gap-1 bg-[#f0f2ea] border border-[#dce0d1] text-[#5a5a40] px-2 py-1 rounded text-[10px] font-bold uppercase">
              <ShieldCheck className="w-3.5 h-3.5" /> SECURE SSL
            </span>
          </div>

          {/* Pricing Summary */}
          <div className="bg-[#f9f9f5] border border-[#e9e7df] rounded-xl p-4 space-y-3">
            <div className="text-xs font-bold text-[#8a8d81] uppercase tracking-wider">Invoice Details</div>
            
            <div className="flex justify-between text-xs">
              <span className="text-[#8a8d81]">IT Solution Task</span>
              <span className="font-semibold text-[#3d4234] line-clamp-1">{issue.title}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[#8a8d81]">Technician Dispatch Fee</span>
              <span className="font-semibold text-[#3d4234]">${((issue.price) * 0.85).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[#8a8d81]">SolBridks Platform & Green CO₂ Offset</span>
              <span className="font-semibold text-[#3d4234]">${((issue.price) * 0.15).toFixed(2)}</span>
            </div>

            <div className="h-[1px] bg-[#e9e7df] my-2" />

            <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-[#e9e7df]">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#5a5a40]" />
                <span className="text-xs font-semibold text-[#5a5a40]">Core Service Insurance Included</span>
              </div>
              <span className="text-[10px] text-[#8a8d81]">SLA-backed guarantee</span>
            </div>

            <div className="flex justify-between items-center text-sm pt-2 font-bold text-[#2c3124] border-t border-[#e9e7df] mt-2">
              <span>Total Amount</span>
              <span className="text-xl text-[#5a5a40] font-extrabold">${Number(issue.price).toFixed(2)}</span>
            </div>
          </div>

          {/* Interactive Card Visualizer (Styled as premium Dark Moss linen card) */}
          <div className="relative bg-gradient-to-br from-[#5a5a40] to-[#3d4234] border border-[#5a5a40]/30 p-5 rounded-xl h-44 flex flex-col justify-between overflow-hidden shadow-lg select-none text-[#faf9f6]">
            {/* Ambient Background decoration */}
            <div className="absolute right-0 bottom-0 w-32 h-32 bg-[#d4a373]/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex justify-between items-start">
              <div>
                <div className="text-[10px] font-bold text-[#e1e2da] tracking-widest uppercase">SolBridks Corporate Card</div>
                <div className="text-[9px] text-[#d4a373] font-medium">Verified secure digital payment</div>
              </div>
              <Lock className="w-4 h-4 text-[#e1e2da]" />
            </div>

            <div className="my-2">
              <div id="visual-card-number" className="font-mono text-lg tracking-widest text-[#faf9f6]">
                {cardNumber || '•••• •••• •••• ••••'}
              </div>
            </div>

            <div className="flex justify-between items-end ">
              <div>
                <label className="text-[8px] uppercase tracking-wider text-[#e1e2da] block">Cardholder</label>
                <div id="visual-card-name" className="text-xs font-semibold uppercase text-[#faf9f6] tracking-wider">
                  {cardName || 'YOUR FULL NAME'}
                </div>
              </div>
              <div className="flex gap-4">
                <div>
                  <label className="text-[8px] uppercase tracking-wider text-[#e1e2da] block">Expiry</label>
                  <div className="text-xs font-semibold font-mono text-[#faf9f6]">
                    {expiry || 'MM/YY'}
                  </div>
                </div>
                <div>
                  <label className="text-[8px] uppercase tracking-wider text-[#e1e2da] block">CVV</label>
                  <div className="text-xs font-semibold font-mono text-[#faf9f6]">
                    {cvv || '•••'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Inputs Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[#3d4234]">
            <div>
              <label className="text-xs font-medium text-[#3d4234] block mb-1">Card Number</label>
              <input
                id="payment-field-card-number"
                type="text"
                placeholder="4111 2222 3333 4444"
                value={cardNumber}
                onChange={handleCardNumberChange}
                required
                className="w-full bg-white border border-[#e9e7df] text-[#3d4234] rounded-lg px-3 py-2 text-sm focus:outline-[#5a5a40] focus:ring-1 focus:ring-[#5a5a40]"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-[#3d4234] block mb-1">Cardholder Name</label>
              <input
                id="payment-field-card-name"
                type="text"
                placeholder="Jane Doe"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                required
                className="w-full bg-white border border-[#e9e7df] text-[#3d4234] rounded-lg px-3 py-2 text-sm focus:outline-[#5a5a40] focus:ring-1 focus:ring-[#5a5a40]"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-[#3d4234] block mb-1">Expiry Date</label>
              <input
                id="payment-field-card-expiry"
                type="text"
                placeholder="MM/YY"
                value={expiry}
                onChange={handleExpiryChange}
                required
                className="w-full bg-white border border-[#e9e7df] text-[#3d4234] rounded-lg px-3 py-2 text-sm focus:outline-[#5a5a40] focus:ring-1 focus:ring-[#5a5a40] text-center"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-[#3d4234] block mb-1">CVV Code</label>
              <input
                id="payment-field-card-cvv"
                type="password"
                placeholder="123"
                value={cvv}
                onChange={handleCvvChange}
                required
                className="w-full bg-white border border-[#e9e7df] text-[#3d4234] rounded-lg px-3 py-2 text-sm focus:outline-[#5a5a40] focus:ring-1 focus:ring-[#5a5a40] text-center"
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
              className="flex-1 bg-white border border-[#e9e7df] hover:bg-gray-50 text-[#3d4234] font-semibold py-2 px-4 rounded-lg text-sm transition-all"
            >
              Cancel Payment
            </button>
            <button
              id="payment-btn-submit"
              type="submit"
              disabled={isProcessing}
              className="flex-1 bg-[#5a5a40] hover:bg-[#4a4a34] text-white font-bold py-2 px-4 rounded-lg text-sm shadow-sm active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  Securing Funds...
                </>
              ) : (
                `Pay $${Number(issue.price).toFixed(2)} Securely`
              )}
            </button>
          </div>
        </form>
      ) : (
        /* Payment Complete Success Feedback state */
        <div className="text-center py-10 space-y-6">
          <div className="w-16 h-16 bg-[#f0f2ea] border border-[#5a5a40] rounded-full flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle className="w-8 h-8 text-[#5a5a40] animate-pulse" />
          </div>
          <div>
            <h4 className="text-xl font-bold text-[#2c3124]">Secure Authorization Succeeded</h4>
            <p className="text-sm text-[#8a8d81] mt-1">Transaction approved and signed cryptographically.</p>
          </div>

          <div className="bg-[#f9f9f5] border border-[#e9e7df] rounded-2xl p-5 max-w-sm mx-auto text-left space-y-3 text-[#3d4234]">
            <span className="text-[9px] bg-slate-100 text-slate-700 border border-slate-300 px-2 py-0.5 rounded-full uppercase font-bold tracking-wider float-right">
              SLA VERIFIED
            </span>
            <div className="text-xs font-semibold text-[#8a8d81]">Transaction &amp; Service Compliance Audit</div>
            
            <div className="text-[#3d4234] text-xs flex justify-between">
              <span>Resolution Quality Audit:</span>
              <span className="font-bold text-[#2c3124]">Passed 100%</span>
            </div>
            <div className="text-[#3d4234] text-xs flex justify-between">
              <span>SLA Response Window:</span>
              <span className="font-bold text-[#5a5a40]">Met Under 15m</span>
            </div>
            <div className="text-[#3d4234] text-xs flex justify-between">
              <span>Coverage Support Plan:</span>
              <span className="font-bold text-[#d4a373]">Corporate Premium</span>
            </div>

            <div className="h-[1px] bg-[#e9e7df] my-2" />

            <div className="text-[10px] text-[#3d4234] flex items-center gap-1.5 bg-white border border-[#e9e7df] p-2 rounded-lg">
              <ShieldCheck className="w-3.5 h-3.5 text-[#5a5a40] shrink-0" />
              <span>Full SLA coverage and corporate service warranty active.</span>
            </div>
          </div>

          <p className="text-xs text-[#8a8d81]">Generating digital contract proof. One-way redirecting shortly...</p>
        </div>
      )}
    </div>
  );
}
