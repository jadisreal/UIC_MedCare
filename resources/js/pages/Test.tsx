import React from 'react';
import { Head } from '@inertiajs/react';

const Test: React.FC = () => {
    return (
        <>
            <Head title="Navigation Test" />
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="bg-white p-8 rounded-lg shadow-lg text-center">
                    <div className="text-6xl mb-4">🎉</div>
                    <h1 className="text-3xl font-bold text-green-600 mb-4">
                        Navigation Success!
                    </h1>
                    <p className="text-gray-600 mb-6">
                        If you can see this page, navigation is working correctly.
                    </p>
                    <div className="text-sm text-gray-500">
                        <p>Current URL: {window.location.href}</p>
                        <p>Timestamp: {new Date().toLocaleString()}</p>
                    </div>
                    <div className="mt-6">
                        <a 
                            href="/dashboard" 
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        >
                            ← Back to Dashboard
                        </a>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Test;