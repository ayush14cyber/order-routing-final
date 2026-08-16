import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Modal, TextField, Alert } from '@mui/material';
import { Edit } from 'lucide-react';
import api from '../api/axios';

const InventoryManagement = () => {
  const [inventory, setInventory] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [editInv, setEditInv] = useState(null);
  const [newQty, setNewQty] = useState('');

  const fetchInventory = async () => {
    try {
      const res = await api.get('/inventory');
      setInventory(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleOpen = (inv) => {
    setEditInv(inv);
    setNewQty(inv.availableQuantity);
    setOpenModal(true);
  };

  const handleClose = () => setOpenModal(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/inventory/${editInv._id}`, { availableQuantity: parseInt(newQty) });
      fetchInventory();
      handleClose();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Box>
      <Typography variant="h4" color="text.primary" fontWeight="bold" gutterBottom>
        Inventory Management
      </Typography>

      <TableContainer component={Paper} sx={{ backgroundColor: 'rgba(255,255,255,0.03)', mt: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Warehouse</TableCell>
              <TableCell>Product</TableCell>
              <TableCell>Available Qty</TableCell>
              <TableCell>Reserved Qty</TableCell>
              <TableCell>Last Updated</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {inventory.map((inv) => (
              <TableRow key={inv._id}>
                <TableCell>{inv.warehouseId?.warehouseName || 'Unknown'}</TableCell>
                <TableCell>{inv.productId?.productName || 'Unknown'}</TableCell>
                <TableCell>
                  {inv.availableQuantity < 10 ? (
                    <Chip label={`${inv.availableQuantity} (Low Stock)`} color="error" size="small" />
                  ) : (
                    inv.availableQuantity
                  )}
                </TableCell>
                <TableCell>{inv.reservedQuantity}</TableCell>
                <TableCell>{new Date(inv.updatedAt).toLocaleString()}</TableCell>
                <TableCell align="right">
                  <Button size="small" startIcon={<Edit size={16} />} onClick={() => handleOpen(inv)}>
                    Edit Stock
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Modal open={openModal} onClose={handleClose}>
        <Box sx={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: 400, bgcolor: 'background.paper', border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: 24, p: 4, borderRadius: 2
        }}>
          <Typography variant="h6" mb={2}>Update Inventory</Typography>
          {editInv && (
            <Alert severity="info" sx={{ mb: 2 }}>
              {editInv.warehouseId?.warehouseName} - {editInv.productId?.productName}
            </Alert>
          )}
          <form onSubmit={handleSubmit}>
            <TextField 
              fullWidth 
              label="Available Quantity" 
              type="number" 
              required 
              value={newQty} 
              onChange={e => setNewQty(e.target.value)} 
            />
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button onClick={handleClose}>Cancel</Button>
              <Button type="submit" variant="contained" color="primary">Save</Button>
            </Box>
          </form>
        </Box>
      </Modal>
    </Box>
  );
};

export default InventoryManagement;
