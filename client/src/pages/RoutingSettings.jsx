import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Slider, Button, Grid, Divider, Alert, CircularProgress 
} from '@mui/material';
import { Save, Settings2 } from 'lucide-react';
import api from '../api/axios';

const RoutingSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [weights, setWeights] = useState({
    distanceWeight: 35,
    inventoryWeight: 35,
    deliveryWeight: 20,
    costWeight: 10
  });
  
  const [metadata, setMetadata] = useState(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const res = await api.get('/config');
      if (res.data.success && res.data.data) {
        setWeights({
          distanceWeight: res.data.data.distanceWeight,
          inventoryWeight: res.data.data.inventoryWeight,
          deliveryWeight: res.data.data.deliveryWeight,
          costWeight: res.data.data.costWeight
        });
        if (res.data.data.updatedAt) {
          setMetadata({
            updatedAt: res.data.data.updatedAt,
            updatedBy: res.data.data.updatedBy?.username || 'System'
          });
        }
      }
    } catch (err) {
      setError('Failed to load configuration');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSliderChange = (name) => (event, newValue) => {
    setWeights(prev => ({
      ...prev,
      [name]: newValue
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      
      const res = await api.put('/config', weights);
      
      if (res.data.success) {
        setSuccess('Routing configuration updated successfully!');
        setMetadata({
          updatedAt: res.data.data.updatedAt,
          updatedBy: res.data.data.updatedBy?.username || 'System'
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update configuration');
    } finally {
      setSaving(false);
    }
  };

  const total = weights.distanceWeight + weights.inventoryWeight + weights.deliveryWeight + weights.costWeight;
  const isTotalValid = Math.abs(total - 100) < 0.01;

  if (loading) return <CircularProgress />;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, gap: 2 }}>
        <Settings2 size={32} color="#7c3aed" />
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Routing Engine Configuration
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">Scoring Weights</Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: isTotalValid ? '#10b981' : '#ef4444', 
                  fontWeight: 'bold',
                  backgroundColor: isTotalValid ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  padding: '4px 12px',
                  borderRadius: 2
                }}
              >
                Total: {total}%
              </Typography>
            </Box>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              Adjust the percentages below to configure how the AI selects the optimal warehouse. 
              The values must sum exactly to 100%.
            </Typography>

            <Box sx={{ mb: 4 }}>
              <Typography gutterBottom sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Distance Factor</span>
                <span style={{ color: '#7c3aed', fontWeight: 'bold' }}>{weights.distanceWeight}%</span>
              </Typography>
              <Slider
                value={weights.distanceWeight}
                onChange={handleSliderChange('distanceWeight')}
                color="primary"
                step={1}
                min={0}
                max={100}
              />
              <Typography variant="caption" color="text.secondary">
                Prioritizes warehouses physically closer to the customer.
              </Typography>
            </Box>

            <Box sx={{ mb: 4 }}>
              <Typography gutterBottom sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Inventory Health</span>
                <span style={{ color: '#7c3aed', fontWeight: 'bold' }}>{weights.inventoryWeight}%</span>
              </Typography>
              <Slider
                value={weights.inventoryWeight}
                onChange={handleSliderChange('inventoryWeight')}
                color="primary"
                step={1}
                min={0}
                max={100}
              />
              <Typography variant="caption" color="text.secondary">
                Prioritizes warehouses with abundant, unreserved stock.
              </Typography>
            </Box>

            <Box sx={{ mb: 4 }}>
              <Typography gutterBottom sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Delivery Speed</span>
                <span style={{ color: '#7c3aed', fontWeight: 'bold' }}>{weights.deliveryWeight}%</span>
              </Typography>
              <Slider
                value={weights.deliveryWeight}
                onChange={handleSliderChange('deliveryWeight')}
                color="primary"
                step={1}
                min={0}
                max={100}
              />
              <Typography variant="caption" color="text.secondary">
                Prioritizes routes that minimize estimated transit days.
              </Typography>
            </Box>

            <Box sx={{ mb: 4 }}>
              <Typography gutterBottom sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Shipping Cost</span>
                <span style={{ color: '#7c3aed', fontWeight: 'bold' }}>{weights.costWeight}%</span>
              </Typography>
              <Slider
                value={weights.costWeight}
                onChange={handleSliderChange('costWeight')}
                color="primary"
                step={1}
                min={0}
                max={100}
              />
              <Typography variant="caption" color="text.secondary">
                Prioritizes cost-efficiency based on logistics rates.
              </Typography>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" color="text.secondary">
                {metadata ? `Last updated by ${metadata.updatedBy} on ${new Date(metadata.updatedAt).toLocaleString()}` : 'Default System Configuration'}
              </Typography>
              
              <Button
                variant="contained"
                color="primary"
                startIcon={<Save />}
                onClick={handleSave}
                disabled={!isTotalValid || saving}
                sx={{ px: 4 }}
              >
                {saving ? 'Saving...' : 'Save Configuration'}
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RoutingSettings;
