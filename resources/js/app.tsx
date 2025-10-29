// resources/js/app.tsx

import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/use-appearance';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';
// Correctly load the Client ID from the .env file
const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// Add global Inertia event listeners for debugging
router.on('start', (event) => {
    console.log('🟡 Inertia navigation started:', event);
});

router.on('progress', (event) => {
    console.log('🔄 Inertia navigation progress:', event);
});

router.on('finish', (event) => {
    console.log('🏁 Inertia navigation finished:', event);
});

router.on('success', (event) => {
    console.log('✅ Inertia navigation success:', event);
});

router.on('error', (errors) => {
    console.error('🚨 Inertia navigation error:', errors);
    alert('Navigation Error: ' + JSON.stringify(errors));
});

router.on('exception', (exception) => {
    console.error('💥 Inertia exception:', exception);
    alert('Navigation Exception: ' + exception);
});

createInertiaApp({
    title: (title) => title ? `${title} - ${appName}` : appName,
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <GoogleOAuthProvider clientId={clientId}>
                <App {...props} />
            </GoogleOAuthProvider>
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();