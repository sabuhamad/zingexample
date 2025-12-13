import React from 'react';
import ReviewCard from '../../src/components/ReviewCard';

const Hero = ({ probat }) => {
    return (
        <div className="relative bg-gray-100 min-h-screen flex items-center py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden p-8 lg:p-16 relative">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
                        <div className="text-left">
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight mb-6 leading-tight">
                                FUELING YOUR <br />
                                <span className="text-[#888888]">BUSINESS GROWTH</span>
                            </h1>
                            <p className="mt-6 max-w-lg text-lg text-gray-600 mb-8 leading-relaxed">
                                We drive growth with Marketing, Custom Software Development, and AI Solutions to boost your revenue.
                            </p>
                            <div className="flex justify-start">
                                <a 
                                    href="#" 
                                    data-probat-conversion="true"
                                    className="bg-[#888888] text-white text-lg font-semibold px-8 py-4 rounded-md shadow-lg hover:bg-gray-700 transition duration-300 transform hover:-translate-y-1"
                                >
                                    Fuel Your Business
                                </a>
                            </div>
                        </div>

                        <div className="flex justify-center lg:justify-end relative">
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gray-200 rounded-full mix-blend-multiply filter blur-3xl opacity-60"></div>
                            <div className="relative z-10 scale-90 lg:scale-100">
                                <ReviewCard />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Hero;