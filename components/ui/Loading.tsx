import React from 'react';
import LoadingLines from './loading-lines';

const Loading: React.FC = () => {
    return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-dark-900/80 backdrop-blur-sm">
            <div className="scale-75 md:scale-100">
                <LoadingLines />
            </div>
            <p className="mt-12 text-gray-400 font-medium tracking-widest animate-pulse">
                INITIALIZING EFREN BILLIARDS...
            </p>
        </div>
    );
};

export default Loading; 
