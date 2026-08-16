import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { theme } from './theme';
import { AuthProvider } from './context/AuthContext';

import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import WarehouseManagement from './pages/WarehouseManagement';
import InventoryManagement from './pages/InventoryManagement';
import OrderManagement from './pages/OrderManagement';
import RoutingDecision from './pages/RoutingDecision';
import RoutingHistory from './pages/RoutingHistory';
import WarehouseMap from './pages/WarehouseMap';
import RoutingSettings from './pages/RoutingSettings';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route index element={<ProtectedRoute allowedRoles={['admin']}><Dashboard /></ProtectedRoute>} />
              <Route path="warehouses" element={<ProtectedRoute allowedRoles={['admin']}><WarehouseManagement /></ProtectedRoute>} />
              <Route path="inventory" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><InventoryManagement /></ProtectedRoute>} />
              <Route path="orders" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><OrderManagement /></ProtectedRoute>} />
              <Route path="routing-decision" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><RoutingDecision /></ProtectedRoute>} />
              <Route path="routing-decision/:orderId" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><RoutingDecision /></ProtectedRoute>} />
              <Route path="routing-history" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><RoutingHistory /></ProtectedRoute>} />
              <Route path="map" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><WarehouseMap /></ProtectedRoute>} />
              <Route path="routing-settings" element={<ProtectedRoute allowedRoles={['admin']}><RoutingSettings /></ProtectedRoute>} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
