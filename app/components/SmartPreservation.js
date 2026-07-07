"use client";

import { CheckSquare, Square, Info } from "lucide-react";

export default function SmartPreservation({ widgets, selectedWidgets, setSelectedWidgets }) {
  if (!widgets || widgets.length === 0) return null;

  const toggleWidget = (id) => {
    setSelectedWidgets(prev => 
      prev.includes(id) ? prev.filter(w => w !== id) : [...prev, id]
    );
  };

  return (
    <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700/50 mb-6">
      <div className="flex items-center gap-2 text-blue-400 mb-3">
        <Info size={18} />
        <h4 className="font-semibold text-sm">We found custom sections in your current profile</h4>
      </div>
      <p className="text-sm text-gray-400 mb-4">
        Select which sections you&apos;d like to keep. We&apos;ll automatically merge them with your new design.
      </p>
      <div className="grid gap-2">
        {widgets.map(widget => (
          <div 
            key={widget.id} 
            className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-lg cursor-pointer hover:bg-gray-700/50 transition-colors"
            onClick={() => toggleWidget(widget.id)}
          >
            {selectedWidgets.includes(widget.id) ? (
              <CheckSquare className="text-blue-500" size={20} />
            ) : (
              <Square className="text-gray-500" size={20} />
            )}
            <span className="text-sm font-medium text-gray-200">{widget.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
