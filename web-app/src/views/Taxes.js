import React, { useState, useEffect } from 'react';
import TableShadcn from '../components/ui/TableShadcn';
import { useSelector, useDispatch } from "react-redux";
import CircularLoading from "../components/CircularLoading";
import { api } from 'common';
import { useTranslation } from "react-i18next";
import moment from 'moment/min/moment-with-locales';
import {Switch} from '@mui/material';
import { SECONDORY_COLOR } from "../common/sharedFunctions";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import { ThemeProvider } from '@mui/material/styles';
import theme from "styles/tableStyle";
import IconButton from '../components/ui/icon-button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogOverlay,
} from '../components/ui/dialog';

export default function Taxes() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir();
  const { editTax } = api;
  const settings = useSelector(state => state.settingsdata.settings);
  const taxdata = useSelector(state => state.taxdata);
  const auth = useSelector(state => state.auth);
  const dispatch = useDispatch();

  const [data, setData] = useState([]);
  const [sortedData, setSortedData] = useState([]);
  const [role, setRole] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState(null);
  const [editSaving, setEditSaving] = useState(false);

  const initialEditForm = React.useMemo(() => ({
    name: '',
    description: '',
    type: 'percentage',
    value: '',
    onlyPaymentOnline: false,
    isVisible: true,
    active: true
  }), []);

  const [editForm, setEditForm] = useState(initialEditForm);

  useEffect(() => {
    if (auth.profile && auth.profile.usertype) {
      setRole(auth.profile.usertype);
    }
  }, [auth.profile]);

  useEffect(() => {
    if (taxdata.taxes) {
      setData(taxdata.taxes);
    } else {
      setData([]);
    }
  }, [taxdata.taxes]);

  useEffect(() => {
    if (data) {
      setSortedData(data.sort((a, b) => (moment(b.createdAt) - moment(a.createdAt))));
    }
  }, [data]);

  const handleToggleField = (rowData, field) => {
    if (role === "admin") {
      dispatch(editTax({ ...rowData, [field]: !rowData[field] }, "Update"));
    }
  };

  const columns = React.useMemo(() => ([
    { accessorKey: 'name', header: t('tax_name') },
    { accessorKey: 'description', header: t('description') },
    {
      accessorKey: 'type',
      header: t('type'),
      cell: ({ row }) => row.original.type === 'flat' ? t('flat') : t('percentage')
    },
    {
      accessorKey: 'value',
      header: t('tax_value'),
      cell: ({ row }) => {
        if (row.original.type === 'percentage') {
          return row.original.value + '%';
        }
        return settings.symbol + ' ' + row.original.value;
      }
    },
    {
      accessorKey: 'onlyPaymentOnline',
      header: t('only_payment_online'),
      cell: ({ row }) => (
        <Switch
          checked={row.original.onlyPaymentOnline}
          onChange={() => handleToggleField(row.original, 'onlyPaymentOnline')}
          disabled={!settings.AllowCriticalEditsAdmin}
        />
      )
    },
    {
      accessorKey: 'isVisible',
      header: t('is_visible'),
      cell: ({ row }) => (
        <Switch
          checked={row.original.isVisible}
          onChange={() => handleToggleField(row.original, 'isVisible')}
          disabled={!settings.AllowCriticalEditsAdmin}
        />
      )
    },
    {
      accessorKey: 'active',
      header: t('active'),
      cell: ({ row }) => (
        <Switch
          checked={row.original.active}
          onChange={() => handleToggleField(row.original, 'active')}
          disabled={!settings.AllowCriticalEditsAdmin}
        />
      )
    },
  ]), [t, settings, role]);

  const handleDeleteClick = (row) => {
    setItemToDelete(row);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (itemToDelete) {
      dispatch(editTax(itemToDelete, "Delete"));
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const closeEditDialog = React.useCallback(() => {
    setEditDialogOpen(false);
    setItemToEdit(null);
    setEditForm(initialEditForm);
    setEditSaving(false);
  }, [initialEditForm]);

  const handleEditClick = (row) => {
    setItemToEdit(row);
    setEditForm({
      name: row.name || '',
      description: row.description || '',
      type: row.type || 'percentage',
      value: row.value || '',
      onlyPaymentOnline: row.onlyPaymentOnline || false,
      isVisible: row.isVisible !== undefined ? row.isVisible : true,
      active: row.active !== undefined ? row.active : true
    });
    setEditDialogOpen(true);
  };

  const handleEditSave = () => {
    if (itemToEdit) {
      setEditSaving(true);
      const updated = {
        ...itemToEdit,
        ...editForm,
        value: parseFloat(editForm.value)
      };
      dispatch(editTax(updated, "Update"));
    } else {
      setEditSaving(true);
      const newItem = {
        ...editForm,
        value: parseFloat(editForm.value),
        createdAt: Date.now()
      };
      dispatch(editTax(newItem, "Add"));
    }
    closeEditDialog();
  };

  const handleEditCancel = () => {
    closeEditDialog();
  };

  const handleInputChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    taxdata.loading ? <CircularLoading /> :
      <ThemeProvider theme={theme}>
        <div style={{
          direction: isRTL === "rtl" ? "rtl" : "ltr",
          borderRadius: "8px",
          boxShadow: `0px 2px 5px ${SECONDORY_COLOR}`,
          padding: "20px",
        }}>
          <TableShadcn
            columns={columns}
            data={sortedData || []}
            initialFilterColumn={'name'}
            onAdd={() => { setItemToEdit(null); setEditForm(initialEditForm); setEditDialogOpen(true); }}
            addButtonLabel={t('add_tax')}
            title={t('taxes')}
            columnsButtonLabel={t('columns')}
            columnLabels={{
              name: t('tax_name'),
              description: t('description'),
              type: t('type'),
              value: t('tax_value'),
              onlyPaymentOnline: t('only_payment_online'),
              isVisible: t('is_visible'),
              active: t('active'),
            }}
            renderActions={(row) => (
              <div style={{ display: 'flex', gap: 6 }}>
                <IconButton aria-label="edit" onClick={() => handleEditClick(row)}>
                  <EditIcon fontSize='small' />
                </IconButton>
                {settings.AllowCriticalEditsAdmin && (
                  <IconButton aria-label="delete" onClick={() => handleDeleteClick(row)}>
                    <DeleteIcon fontSize='small' />
                  </IconButton>
                )}
              </div>
            )}
          />
        </div>

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('confirm_delete')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('confirm_delete_tax')} "{itemToDelete?.name}"?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleDeleteCancel}>
                {t('cancel')}
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteConfirm}>
                {t('delete')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Dialog open={editDialogOpen} onOpenChange={(open) => { if (!open) closeEditDialog(); else setEditDialogOpen(true); }}>
          <DialogOverlay onClick={closeEditDialog} />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{itemToEdit ? t('edit_tax') : t('add_tax')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4" style={{ position: 'relative' }}>
              {editSaving ? (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
                  <CircularLoading />
                </div>
              ) : null}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('tax_name')}
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={editSaving}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('description')}
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  disabled={editSaving}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('type')}
                </label>
                <select
                  value={editForm.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={editSaving}
                >
                  <option value="percentage">{t('percentage')}</option>
                  <option value="flat">{t('flat')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('tax_value')}
                </label>
                <input
                  type="number"
                  value={editForm.value}
                  onChange={(e) => handleInputChange('value', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={editSaving}
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={editForm.onlyPaymentOnline}
                  onChange={(e) => handleInputChange('onlyPaymentOnline', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={editSaving}
                />
                <label className="ml-2 block text-sm text-gray-900">
                  {t('only_payment_online')}
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={editForm.isVisible}
                  onChange={(e) => handleInputChange('isVisible', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={editSaving}
                />
                <label className="ml-2 block text-sm text-gray-900">
                  {t('is_visible')}
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={editForm.active}
                  onChange={(e) => handleInputChange('active', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={editSaving}
                />
                <label className="ml-2 block text-sm text-gray-900">
                  {t('active')}
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={handleEditCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={editSaving}
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleEditSave}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={editSaving}
              >
                {t('save')}
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </ThemeProvider>
  );
}
