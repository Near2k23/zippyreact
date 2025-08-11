import React, { useState, useEffect } from 'react';
import TableShadcn from '../components/ui/TableShadcn';
import { useSelector, useDispatch } from "react-redux";
import CircularLoading from "../components/CircularLoading";
import { api } from 'common';
import { useTranslation } from "react-i18next";
import moment from 'moment/min/moment-with-locales';
import {colors} from '../components/Theme/WebTheme';
import {Switch} from '@mui/material';
import { SECONDORY_COLOR } from "../common/sharedFunctions";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import { useNavigate,useLocation } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import theme from "styles/tableStyle";
import IconButton from '../components/ui/icon-button';
import { getLangKey } from 'common/src/other/getLangKey';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogOverlay,
} from '../components/ui/dialog';

export default function Promos() {
  const { t,i18n } = useTranslation();
  const isRTL = i18n.dir();
  const {
    editPromo
  } = api;
  const settings = useSelector(state => state.settingsdata.settings);

  function formatAmount(value, decimal, country) {
    const number = parseFloat(value || 0);
    if (country === "Vietnam") {
      return number.toLocaleString("vi-VN", {
        minimumFractionDigits: decimal,
        maximumFractionDigits: decimal
      });
    } else {
      return number.toLocaleString("en-US", {
        minimumFractionDigits: decimal,
        maximumFractionDigits: decimal
      });
    }
  }

  const columns = React.useMemo(() => ([
    { accessorKey: 'promo_name', header: t('promo_name'), cell: ({ row }) => row.original.promo_name ? t(getLangKey(row.original.promo_name)) : null },
    { accessorKey: 'promo_code', header: t('promo_code_web') },
    { accessorKey: 'promo_description', header: t('description'), cell: ({ row }) => row.original.promo_description ? t(getLangKey(row.original.promo_description)) : null },
    { accessorKey: 'promo_discount_type', header: t('type'), cell: ({ row }) => row.original.promo_discount_type === 'flat' ? t('flat') : t('percentage') },
    { accessorKey: 'promo_discount_value', header: t('promo_discount_value'), cell: ({ row }) => row.original.promo_discount_value ? formatAmount(row.original.promo_discount_value, settings.decimal, settings.country) : 0 },
    { accessorKey: 'max_promo_discount_value', header: t('max_limit'), cell: ({ row }) => row.original.max_promo_discount_value ? formatAmount(row.original.max_promo_discount_value, settings.decimal, settings.country) : 0 },
    { accessorKey: 'min_order', header: t('min_limit'), cell: ({ row }) => row.original.min_order ? formatAmount(row.original.min_order, settings.decimal, settings.country) : 0 },
    { accessorKey: 'promo_validity', header: t('end_date'), cell: ({ row }) => row.original.promo_validity ? moment(row.original.promo_validity).format('lll') : null },
    { accessorKey: 'promo_usage_limit', header: t('promo_usage') },
    { accessorKey: 'promo_show', header: t('show_in_list'), cell: ({ row }) => (
    <Switch
        checked={row.original.promo_show}
        onChange={() => handelShowPromo(row.original)}
      disabled={!settings.AllowCriticalEditsAdmin}
    />
    )},
    { accessorKey: 'user_avail', header: t('promo_used_by') },
  ]), [t, settings]);

  const [data, setData] = useState([]);
  const promodata = useSelector(state => state.promodata);
  const dispatch = useDispatch();
  const [sortedData, SetSortedData] = useState([]);
  const navigate = useNavigate();
  const [role, setRole] = useState(null);
  const auth = useSelector(state => state.auth);
  const [selectedRow, setSelectedRow] = useState(null);
  const {state} = useLocation()
  const [currentPage,setCurrentPage] = useState(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState(null);
  const [editForm, setEditForm] = useState({
    promo_name: '',
    promo_code: '',
    promo_description: '',
    promo_discount_type: 'flat',
    promo_discount_value: '',
    max_promo_discount_value: '',
    min_order: '',
    promo_validity: '',
    promo_usage_limit: '',
    promo_show: true
  });
  const [editSaving, setEditSaving] = useState(false);

  useEffect(() => {
    if(auth.profile && auth.profile.usertype){
      setRole(auth.profile.usertype);
    }
  }, [auth.profile]);

  useEffect(()=>{
    setCurrentPage(state?.pageNo)
  },[state])

  const HandalePageChange = (page)=>{
    setCurrentPage(page)
  }

  useEffect(() => {
    if (promodata.promos) {
      setData(promodata.promos);
    } else {
      setData([]);
    }
  }, [promodata.promos]);

  useEffect(()=>{
    if(data){
      SetSortedData(data.sort((a,b)=>(moment(b.createdAt) - moment(a.createdAt))))
    }
  },[data])

  const handelShowPromo = (rowData) => {
    if (role === "admin") {
        dispatch(editPromo({...rowData, promo_show : !rowData.promo_show},"Update"))
    }
  };

  const handleDeleteClick = (row) => {
    setItemToDelete(row);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (itemToDelete) {
      dispatch(editPromo(itemToDelete, "Delete"));
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const initialEditForm = React.useMemo(() => ({
    promo_name: '',
    promo_code: '',
    promo_description: '',
    promo_discount_type: 'flat',
    promo_discount_value: '',
    max_promo_discount_value: '',
    min_order: '',
    promo_validity: '',
    promo_usage_limit: '',
    promo_show: true
  }), []);

  const closeEditDialog = React.useCallback(() => {
    setEditDialogOpen(false);
    setItemToEdit(null);
    setEditForm(initialEditForm);
    setEditSaving(false);
  }, [initialEditForm]);

  const handleEditClick = (row) => {
    setItemToEdit(row);
    setEditForm({
      promo_name: row.promo_name || '',
      promo_code: row.promo_code || '',
      promo_description: row.promo_description || '',
      promo_discount_type: row.promo_discount_type || 'flat',
      promo_discount_value: row.promo_discount_value || '',
      max_promo_discount_value: row.max_promo_discount_value || '',
      min_order: row.min_order || '',
      promo_validity: row.promo_validity ? moment(row.promo_validity).format('YYYY-MM-DDTHH:mm') : '',
      promo_usage_limit: row.promo_usage_limit || '',
      promo_show: row.promo_show || false
    });
    setEditDialogOpen(true);
  };

  const handleEditSave = () => {
    if (itemToEdit) {
      setEditSaving(true);
      const updated = {
        ...itemToEdit,
        ...editForm,
        promo_validity: editForm.promo_validity ? moment(editForm.promo_validity).toISOString() : null
      };
      dispatch(editPromo(updated, "Update"));
    } else {
      setEditSaving(true);
      const newItem = {
        ...editForm,
        promo_validity: editForm.promo_validity ? moment(editForm.promo_validity).toISOString() : null,
        createdAt: Date.now()
      };
      dispatch(editPromo(newItem, "Add"));
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
    promodata.loading ? <CircularLoading /> :
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
            initialFilterColumn={'promo_name'}
            onAdd={() => { setItemToEdit(null); setEditForm(initialEditForm); setEditDialogOpen(true); }}
            addButtonLabel={t('add_promo_title')}
            title={t('promo_offer_title')}
            columnsButtonLabel={t('columns')}
            columnLabels={{
              promo_name: t('promo_name'),
              promo_code: t('promo_code_web'),
              promo_description: t('description'),
              promo_discount_type: t('type'),
              promo_discount_value: t('promo_discount_value'),
              max_promo_discount_value: t('max_limit'),
              min_order: t('min_limit'),
              promo_validity: t('end_date'),
              promo_usage_limit: t('promo_usage'),
              promo_show: t('show_in_list'),
              user_avail: t('promo_used_by')
            }}
            renderActions={(row) => (
              <div style={{ display:'flex', gap: 6 }}>
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

        {/* Diálogo de confirmación para eliminación */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('confirm_delete')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('delete_promo_confirmation')} "{itemToDelete?.promo_name}"?
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

        {/* Modal de edición */}
        <Dialog open={editDialogOpen} onOpenChange={(open)=> { if(!open) closeEditDialog(); else setEditDialogOpen(true); }}>
          <DialogOverlay onClick={closeEditDialog} />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{ itemToEdit ? t('edit_promo') : t('add_promo_title') }</DialogTitle>
            </DialogHeader>
            <div className="space-y-4" style={{ position:'relative' }}>
              {editSaving ? (
                <div style={{ position:'absolute', inset:0, background:'rgba(255,255,255,0.6)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:10 }}>
                  <CircularLoading />
                </div>
              ) : null}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('promo_name')}
                </label>
                <input
                  type="text"
                  value={editForm.promo_name}
                  onChange={(e) => handleInputChange('promo_name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={editSaving}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('promo_code_web')}
                </label>
                <input
                  type="text"
                  value={editForm.promo_code}
                  onChange={(e) => handleInputChange('promo_code', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={editSaving}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('description')}
                </label>
                <textarea
                  value={editForm.promo_description}
                  onChange={(e) => handleInputChange('promo_description', e.target.value)}
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
                  value={editForm.promo_discount_type}
                  onChange={(e) => handleInputChange('promo_discount_type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={editSaving}
                >
                  <option value="flat">{t('flat')}</option>
                  <option value="percentage">{t('percentage')}</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('promo_discount_value')}
                </label>
                <input
                  type="number"
                  value={editForm.promo_discount_value}
                  onChange={(e) => handleInputChange('promo_discount_value', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={editSaving}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('max_limit')}
                </label>
                <input
                  type="number"
                  value={editForm.max_promo_discount_value}
                  onChange={(e) => handleInputChange('max_promo_discount_value', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={editSaving}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('min_limit')}
                </label>
                <input
                  type="number"
                  value={editForm.min_order}
                  onChange={(e) => handleInputChange('min_order', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={editSaving}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('end_date')}
                </label>
                <input
                  type="datetime-local"
                  value={editForm.promo_validity}
                  onChange={(e) => handleInputChange('promo_validity', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={editSaving}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('promo_usage')}
                </label>
                <input
                  type="number"
                  value={editForm.promo_usage_limit}
                  onChange={(e) => handleInputChange('promo_usage_limit', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={editSaving}
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={editForm.promo_show}
                  onChange={(e) => handleInputChange('promo_show', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={editSaving}
                />
                <label className="ml-2 block text-sm text-gray-900">
                  {t('show_in_list')}
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