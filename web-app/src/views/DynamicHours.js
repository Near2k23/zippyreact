import React, { useState, useEffect } from 'react';
import TableShadcn from '../components/ui/TableShadcn';
import { useSelector, useDispatch } from "react-redux";
import CircularLoading from "../components/CircularLoading";
import { api } from 'common';
import { useTranslation } from "react-i18next";
import moment from 'moment/min/moment-with-locales';
import { SECONDORY_COLOR } from "../common/sharedFunctions";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import Checkbox from '../components/ui/checkbox';
import IconButton from '../components/ui/icon-button';
import { useLocation } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import theme from "styles/tableStyle";
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

export default function DynamicHours() {
  const { t,i18n } = useTranslation();
  const isRTL = i18n.dir();
  const { editDynamicHour, fetchDynamicHours } = api;
  const settings = useSelector(state => state.settingsdata.settings);

  const columns = React.useMemo(() => ([
    { accessorKey: 'name', header: t('name') },
    { accessorKey: 'start_hour', header: t('start_time'), cell: ({ row }) => {
      const sh = row.original.start_hour;
      if (sh) return sh;
      const st = row.original.start_time;
      return st ? moment(st).format('HH:mm') : '';
    } },
    { accessorKey: 'end_hour', header: t('end_time'), cell: ({ row }) => {
      const eh = row.original.end_hour;
      if (eh) return eh;
      const et = row.original.end_time;
      return et ? moment(et).format('HH:mm') : '';
    } },
    { accessorKey: 'multiplier_type', header: t('type'), cell: ({ row }) => row.original.multiplier_type === 'flat' ? t('flat') : t('percentage') },
    { accessorKey: 'multiplier_value', header: t('value') },
    { accessorKey: 'active', header: t('active'), cell: ({ row }) => {
      return (
        <Checkbox
          checked={!!row.original.active}
          onCheckedChange={() => {
            handleToggleActive(row.original);
          }}
          disabled={!settings.AllowCriticalEditsAdmin}
        />
      );
    }},
  ]), [t, settings]);

  const [data, setData] = useState([]);
  const items = useSelector(state => state.dynamichourdata.items);
  const loading = useSelector(state => state.dynamichourdata.loading);
  const dispatch = useDispatch();
  const [sortedData, SetSortedData] = useState([]);
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
    name: '',
    start_hour: '',
    end_hour: '',
    multiplier_type: 'flat',
    multiplier_value: '',
    active: true
  });
  const [editSaving, setEditSaving] = useState(false);

  const initialEditForm = React.useMemo(() => ({
    name: '',
    start_hour: '',
    end_hour: '',
    multiplier_type: 'flat',
    multiplier_value: '',
    active: true
  }), []);

  const closeEditDialog = React.useCallback(() => {
    setEditDialogOpen(false);
    setItemToEdit(null);
    setEditForm(initialEditForm);
    setEditSaving(false);
  }, [initialEditForm]);

  useEffect(() => {
    dispatch(fetchDynamicHours());
    if(auth.profile && auth.profile.usertype){
      setRole(auth.profile.usertype);
    }
  }, [auth.profile, dispatch, fetchDynamicHours]);

  useEffect(() => {
    setCurrentPage(state?.pageNo)
  },[state])

  const HandalePageChange = (page)=>{
    setCurrentPage(page)
  }

  useEffect(() => {
    if (items) {
      setData(items);
    } else {
      setData([]);
    }
  }, [items]);

  useEffect(()=>{
    if(data){
      SetSortedData(data.sort((a,b)=>(b.createdAt - a.createdAt)))
    }
  },[data])

  const handleToggleActive = (row) => {
    const currentRole = role || auth.profile?.usertype;
    
    if (currentRole === "admin") {
      const updated = { ...row, active: !row.active };
      
      setData(prev => {
        const newData = (prev || []).map(it => it.id === row.id ? updated : it);
        return newData;
      });
      
      SetSortedData(prev => {
        const newSortedData = (prev || []).map(it => it.id === row.id ? updated : it);
        return newSortedData;
      });
      
      dispatch(editDynamicHour(updated, "Update"));
    }
  };

  const handleDeleteClick = (row) => {
    setItemToDelete(row);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (itemToDelete) {
      dispatch(editDynamicHour(itemToDelete, "Delete"));
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const handleEditClick = (row) => {
    setItemToEdit(row);
    setEditForm({
      name: row.name || '',
      start_hour: row.start_hour ? row.start_hour : (row.start_time ? moment(row.start_time).format('HH:mm') : ''),
      end_hour: row.end_hour ? row.end_hour : (row.end_time ? moment(row.end_time).format('HH:mm') : ''),
      multiplier_type: row.multiplier_type || 'flat',
      multiplier_value: row.multiplier_value || '',
      active: row.active || false
    });
    setEditDialogOpen(true);
  };

  const handleEditSave = () => {
    if (itemToEdit) {
      setEditSaving(true);
      const updated = {
        ...itemToEdit,
        ...editForm,
      };
      dispatch(editDynamicHour(updated, "Update"));
    } else {
      setEditSaving(true);
      const newItem = {
        ...editForm,
        createdAt: Date.now()
      };
      dispatch(editDynamicHour(newItem, "Add"));
    }
    closeEditDialog();
  };

  const handleEditCancel = () => {
    setEditDialogOpen(false);
    setItemToEdit(null);
    setEditForm({
      name: '',
      start_hour: '',
      end_hour: '',
      multiplier_type: 'flat',
      multiplier_value: '',
      active: true
    });
  };

  const handleInputChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    loading ? <CircularLoading /> :
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
            onAdd={() => { setItemToEdit(null); setEditForm({ name:'', start_hour:'', end_hour:'', multiplier_type:'flat', multiplier_value:'', active:true }); setEditDialogOpen(true); }}
            addButtonLabel={t('add')}
            title={t('dynamic_hours')}
            columnsButtonLabel={t('columns')}
            columnLabels={{
              name: t('name'),
              start_hour: t('start_time'),
              end_hour: t('end_time'),
              multiplier_type: t('type'),
              multiplier_value: t('value'),
              active: t('active')
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
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('confirm_delete')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('delete_dynamic_hour_confirmation')} "{itemToDelete?.name}"?
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

        <Dialog open={editDialogOpen} onOpenChange={(open)=> { if(!open) closeEditDialog(); else setEditDialogOpen(true); }}>
          <DialogOverlay onClick={closeEditDialog} />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{ itemToEdit ? t('edit_dynamic_hour') : t('add_dynamic_hour') }</DialogTitle>
            </DialogHeader>
            <div className="space-y-4" style={{ position:'relative' }}>
              {editSaving ? (
                <div style={{ position:'absolute', inset:0, background:'rgba(255,255,255,0.6)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:10 }}>
                  <CircularLoading />
                </div>
              ) : null}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('name')}
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
                  {t('start_time')}
                </label>
                <input
                  type="time"
                  value={editForm.start_hour}
                  onChange={(e) => handleInputChange('start_hour', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={editSaving}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('end_time')}
                </label>
                <input
                  type="time"
                  value={editForm.end_hour}
                  onChange={(e) => handleInputChange('end_hour', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={editSaving}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('type')}
                </label>
                <select
                  value={editForm.multiplier_type}
                  onChange={(e) => handleInputChange('multiplier_type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={editSaving}
                >
                  <option value="flat">{t('flat')}</option>
                  <option value="percentage">{t('percentage')}</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('value')}
                </label>
                <input
                  type="number"
                  value={editForm.multiplier_value}
                  onChange={(e) => handleInputChange('multiplier_value', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={editSaving}
                />
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


