'use client';

export function LoadingSpinner({ text = 'Loading...' }) {
    return (
        <div className="bg-white rounded-[16px] p-12 flex flex-col items-center justify-center">
            <div className="relative w-16 h-16 mb-6">
                <div className="absolute inset-0 rounded-full border-4 border-gray-100"></div>
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#2563EB] animate-spin"></div>
                <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-blue-300 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
            </div>
            <p className="text-[16px] font-semibold text-gray-900 mb-2">{text}</p>
            <p className="text-[13px] text-gray-500">This may take a moment...</p>
            <div className="flex gap-1.5 mt-4">
                <div className="w-2 h-2 rounded-full bg-[#2563EB] animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-[#2563EB] animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-[#2563EB] animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
        </div>
    );
}
