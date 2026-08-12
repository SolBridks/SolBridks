import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, Smartphone, Mail, ArrowRight, RotateCw, CheckCircle2, AlertCircle, X, KeyRound } from 'lucide-react';

interface OTPVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipient: string; // Phone number or Email
  channel: 'sms' | 'email';
  onVerifySuccess: () => void;
  title?: string;
  subtitle?: string;
}

export default function OTPVerificationModal({
  isOpen,
  onClose,
  recipient,
  channel,
  onVerifySuccess,
  title = "Verify Identity via OTP",
  subtitle = "Enter the 6-digit verification code sent to your contact details to activate your account."
}: OTPVerificationModalProps) {
  // Generated 6-digit OTP code for simulation
  const [generatedOtp, setGeneratedOtp] = useState('742918');
  const [otpValues, setOtpValues] = useState<string[]>(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [dispatchStatus, setDispatchStatus] = useState<{ mode?: string; message?: string } | null>(null);

  // Send OTP to backend API when code changes/modal opens
  const dispatchOtpApi = async (code: string) => {
    try {
      const response = await fetch('/api/send-email-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: recipient,
          otp: code,
          portalType: title.toLowerCase().includes('specialist') ? 'specialist' : 'client'
        })
      });
      const data = await response.json();
      if (data.success) {
        setDispatchStatus({ mode: data.mode, message: data.message });
      }
    } catch (err) {
      console.warn("Backend API dispatch notice:", err);
    }
  };

  // Generate a random 6-digit code on open
  useEffect(() => {
    if (isOpen) {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(code);
      setOtpValues(['', '', '', '', '', '']);
      setError('');
      setTimer(60);
      setResendSuccess(false);
      dispatchOtpApi(code);
    }
  }, [isOpen]);

  // Countdown timer effect
  useEffect(() => {
    let interval: any = null;
    if (isOpen && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isOpen, timer]);

  if (!isOpen) return null;

  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste of full 6 digit string
      const pasted = value.replace(/\D/g, '').slice(0, 6).split('');
      const newValues = [...otpValues];
      pasted.forEach((char, i) => {
        if (i < 6) newValues[i] = char;
      });
      setOtpValues(newValues);
      setError('');
      if (pasted.length === 6) {
        inputRefs.current[5]?.focus();
      }
      return;
    }

    const digit = value.replace(/\D/g, '');
    const newValues = [...otpValues];
    newValues[index] = digit;
    setOtpValues(newValues);
    setError('');

    // Auto focus next input
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleAutoFill = () => {
    setOtpValues(generatedOtp.split(''));
    setError('');
  };

  const handleResend = () => {
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newCode);
    setOtpValues(['', '', '', '', '', '']);
    setTimer(60);
    setError('');
    setResendSuccess(true);
    dispatchOtpApi(newCode);
    setTimeout(() => setResendSuccess(false), 3000);
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const entered = otpValues.join('');
    if (entered.length < 6) {
      setError('Please enter all 6 digits of the OTP code.');
      return;
    }

    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      if (entered === generatedOtp) {
        setError('');
        onVerifySuccess();
      } else {
        setError(`Invalid OTP code entered. Please check the code (${generatedOtp}) and try again.`);
      }
    }, 600);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-[28px] max-w-md w-full p-6 sm:p-8 shadow-2xl relative text-slate-800 space-y-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1 rounded-full transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-center mx-auto text-emerald-600 shadow-xs">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">{title}</h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed font-sans">{subtitle}</p>
        </div>

        {/* Target Contact Display */}
        <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            {channel === 'sms' ? (
              <Smartphone className="w-4 h-4 text-slate-700 shrink-0" />
            ) : (
              <Mail className="w-4 h-4 text-slate-700 shrink-0" />
            )}
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Sent to {channel.toUpperCase()}</span>
              <span className="font-extrabold text-slate-900 font-mono">{recipient || 'User Contact'}</span>
            </div>
          </div>
          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
            OTP Sent
          </span>
        </div>

        {/* OTP Dispatch Banner & Live API Status */}
        <div className="bg-emerald-50/90 border border-emerald-200/90 p-3.5 rounded-2xl text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
              {dispatchStatus?.mode === 'live_email' ? 'Live Email Dispatched via Resend API' : `OTP Dispatch (${channel.toUpperCase()})`}
            </span>
            <button
              type="button"
              onClick={handleAutoFill}
              className="text-[10px] font-extrabold text-emerald-700 hover:text-emerald-900 underline cursor-pointer"
            >
              One-Click Auto-Fill
            </button>
          </div>
          <div className="flex items-center justify-between font-mono">
            <span className="text-slate-600 text-[11px]">Your OTP Code:</span>
            <span className="text-base font-black text-emerald-900 tracking-widest bg-white border border-emerald-200 px-3 py-1 rounded-xl shadow-2xs">
              {generatedOtp}
            </span>
          </div>
          {dispatchStatus?.message && (
            <div className="text-[10px] text-emerald-800 font-medium pt-1 border-t border-emerald-200/60 leading-tight">
              {dispatchStatus.message}
            </div>
          )}
        </div>

        {/* OTP Input Form */}
        <form onSubmit={handleVerify} className="space-y-5">
          <div className="flex justify-between gap-2 max-w-xs mx-auto">
            {otpValues.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => (inputRefs.current[idx] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleInputChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className="w-11 h-13 text-center text-xl font-black font-mono bg-slate-50 border-2 border-slate-200 focus:border-emerald-600 focus:bg-white focus:outline-none rounded-2xl transition shadow-2xs text-slate-900"
              />
            ))}
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {resendSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              New verification code sent successfully!
            </div>
          )}

          <button
            type="submit"
            disabled={isVerifying}
            className="w-full bg-[#0f172a] hover:bg-slate-900 text-white font-extrabold py-3.5 px-4 rounded-xl text-xs transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isVerifying ? (
              <>Verifying OTP Code...</>
            ) : (
              <>
                Verify OTP &amp; Complete Registration <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Resend Footer */}
        <div className="text-center pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Didn't receive the code?</span>
          <button
            type="button"
            onClick={handleResend}
            disabled={timer > 0}
            className={`font-bold flex items-center gap-1 cursor-pointer transition ${
              timer > 0 ? 'text-slate-400 cursor-not-allowed' : 'text-slate-800 hover:text-slate-900 underline'
            }`}
          >
            <RotateCw className={`w-3.5 h-3.5 ${timer > 0 ? '' : 'animate-spin'}`} />
            {timer > 0 ? `Resend in ${timer}s` : 'Resend OTP Code'}
          </button>
        </div>

      </div>
    </div>
  );
}
