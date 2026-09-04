import React from 'react';
import { ArrowRight } from 'lucide-react';

export function HowItWorks() {
  const steps = [
    { num: '1', title: 'Add stocks', text: 'Pick your favourite Indian NSE stocks' },
    { num: '2', title: 'Mark as checked', text: 'Set your initial personal price checkpoint' },
    { num: '3', title: 'Come back later', text: 'Return after hours or days' },
    { num: '4', title: 'See what changed', text: 'Review exact deltas and attention triggers' },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 mb-8 shadow-2xs">
      <div className="text-3xs font-bold uppercase tracking-wider text-slate-400 mb-3 text-center sm:text-left">
        How Smart Watchlist Works
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
        {steps.map((step, idx) => (
          <React.Fragment key={step.num}>
            <div className="flex items-center gap-3 bg-slate-50 border border-slate-200/80 p-3 rounded-lg">
              <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                {step.num}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">{step.title}</p>
                <p className="text-3xs text-slate-500 font-medium">{step.text}</p>
              </div>
            </div>
            {idx < steps.length - 1 && (
              <div className="hidden lg:flex items-center justify-center text-slate-300 -mx-2">
                <ArrowRight className="w-4 h-4" />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
