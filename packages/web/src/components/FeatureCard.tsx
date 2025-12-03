import React from 'react';

interface FeatureCardProps {
  title: string;
  text: string;
  tag?: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, text, tag }) => {
  return (
    <div className="bg-white rounded-2xl p-6 border shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-slate-400 uppercase mb-2">{tag}</div>
          <h4 className="text-xl font-semibold mb-2">{title}</h4>
          <p className="text-slate-600 text-sm">{text}</p>
        </div>
        <div className="ml-4 flex items-center">
          <div className="w-12 h-12 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 font-semibold">⌘</div>
        </div>
      </div>
    </div>
  );
};

export default FeatureCard;
