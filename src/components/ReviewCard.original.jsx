import React from 'react';

const ReviewCard = () => {
    return (
        <div className="bg-white p-6 rounded-xl shadow-xl max-w-sm border border-gray-100 animate-fade-in-up">
            <div className="flex items-center space-x-1 mb-2">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                    ★
                </div>
                <span className="font-bold text-gray-900 text-lg">Trustpilot</span>
            </div>
            <div className="flex items-center space-x-1 mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className="text-white bg-green-500 p-1 rounded-sm text-xs">★</span>
                ))}
            </div>
            <p className="text-gray-900 font-bold text-xl">Excellent</p>
            <p className="text-gray-500 text-sm mt-1">4.9 out of 5</p>
        </div>
    );
};

export default ReviewCard;
