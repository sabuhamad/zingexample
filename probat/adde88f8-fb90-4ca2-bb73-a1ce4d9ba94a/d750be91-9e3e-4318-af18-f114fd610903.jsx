import React from 'react';
import ReviewCard from '../../src/components/ReviewCard';

const Hero = ({ probat }) => {
    return (
        <div className="relative bg-gray-900 pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden min-h-screen flex items-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
                <div className="flex flex-col items-center text-center">
                    <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white tracking-tight mb-6 leading-tight">
                        FUELING YOUR <br />
                        <span className="text-gray-400">BUSINESS GROWTH</span>
                    </h1>
                    <p className="mt-6 max-w-2xl text-xl text-gray-300 mb-10 leading-relaxed">
                        We drive growth with Marketing, Custom Software Development, and AI Solutions to boost your revenue.
                    </p>
                    <div className="flex justify-center mb-16">
                        <a 
                            href="#" 
                            data-probat-conversion="true"
                            className="bg-white text-gray-900 text-lg font-semibold px-8 py-4 rounded-md shadow-lg hover:bg-gray-100 transition duration-300 transform hover:-translate-y-1"
                        >
                            Fuel Your Business
                        </a>
                    </div>

                    <div className="relative">
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gray-700 rounded-full mix-blend-overlay filter blur-3xl opacity-50 animate-blob"></div>
                        <div className="relative z-10">
                            <ReviewCard />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Hero;