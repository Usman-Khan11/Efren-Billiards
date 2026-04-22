import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { AppRoutes } from './components/AppRoutes';

const App: React.FC = () => {
    return (
        <AuthProvider>
            <AppRoutes />
        </AuthProvider>
    );
};

export default App;