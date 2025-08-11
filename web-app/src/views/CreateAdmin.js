import React,{ useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from "react-redux";
import CircularLoading from "../components/CircularLoading";
import { api } from 'common';
import { useTranslation } from "react-i18next";
import {colors} from '../components/Theme/WebTheme';
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { useNavigate,useLocation } from 'react-router-dom';
import moment from 'moment/min/moment-with-locales';
import {SECONDORY_COLOR } from "../common/sharedFunctions";
import { ThemeProvider } from '@mui/material/styles';
import theme from "styles/tableStyle";
import TableShadcn from '../components/ui/TableShadcn';
import IconButton from '../components/ui/icon-button';
import EditIcon from '@mui/icons-material/Edit';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogOverlay,
} from '../components/ui/dialog';
import { useToast } from '../components/Toast';

export default function Users() {
  const { t,i18n } = useTranslation();
  const isRTL = i18n.dir();
  const settings = useSelector(state => state.settingsdata.settings);
  const navigate = useNavigate();
  const {
    addUser,
    editUser,
    deleteUser,
    fetchUsersOnce
  } = api;
  const [data, setData] = useState([]);
  const [sortedData, SetSortedData] = useState([]);
  const staticusers = useSelector(state => state.usersdata.staticusers);
  const dispatch = useDispatch();
  const loaded = useRef(false);
  const {state} = useLocation()
  const [currentPage,setCurrentPage] = useState(null)
  const { showToast, ToastContainer } = useToast();

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState(null);
  const initialEditForm = React.useMemo(()=>({
    firstName: '',
    lastName: '',
    email: '',
    approved: true,
    countryCode: '+1',
    localMobile: ''
  }),[]);
  const [editForm, setEditForm] = useState(initialEditForm);
  const [editSaving, setEditSaving] = useState(false);
  
  const splitMobile = (mobile) => {
    if (!mobile) return { countryCode: '+1', localMobile: '' };
    if (mobile.startsWith('+57')) return { countryCode: '+57', localMobile: mobile.replace('+57','') };
    if (mobile.startsWith('+1')) return { countryCode: '+1', localMobile: mobile.replace('+1','') };
    return { countryCode: '+1', localMobile: mobile.replace(/^\+/, '') };
  };
  
  useEffect(()=>{
    setCurrentPage(state?.pageNo)
  },[state])
  
  const HandalePageChange = (page)=>{
    setCurrentPage(page)
  }

  useEffect(()=>{
    dispatch(fetchUsersOnce());
},[dispatch,fetchUsersOnce]);

  useEffect(()=>{
    if(staticusers){
      setData(staticusers.filter(user => user.usertype ==='admin'));
    }else{
      setData([]);
    }
    loaded.current = true;
  },[staticusers]);

  useEffect(()=>{
    if(sortedData){
      SetSortedData(data.sort((a,b)=>(moment(b.createdAt) - moment(a.createdAt))))
    }
  },[data,sortedData])

  const columns = React.useMemo(()=> ([
    { accessorKey: 'firstName', header: t('first_name') },
    { accessorKey: 'lastName', header: t('last_name') },
    { accessorKey: 'mobile', header: t('mobile'), cell: ({row}) => settings.AllowCriticalEditsAdmin ? row.original.mobile : t('hidden_demo') },
    { accessorKey: 'email', header: t('email'), cell: ({row}) => settings.AllowCriticalEditsAdmin ? row.original.email : t('hidden_demo') },
    { accessorKey: 'profile_image', header: t('profile_image'), cell: ({row}) => row.original.profile_image ? (
        <img alt="Profile" src={row.original.profile_image} style={{ width: 40, height: 40, borderRadius: '50%' }} />
      ) : (<AccountCircleIcon sx={{ fontSize: 40 }} />)
    },
  ]), [t, settings]);

  const [selectedRow, setSelectedRow] = useState(null);

  const closeEditDialog = React.useCallback(() => {
    setEditDialogOpen(false);
    setItemToEdit(null);
    setEditForm(initialEditForm);
    setEditSaving(false);
  }, [initialEditForm]);

  const handleEditClick = (row) => {
    setItemToEdit(row);
    const { countryCode, localMobile } = splitMobile(row.mobile || '');
    setEditForm({
      firstName: row.firstName || '',
      lastName: row.lastName || '',
      email: row.email || '',
      approved: !!row.approved,
      countryCode,
      localMobile
    });
    setEditDialogOpen(true);
  };

  const handleEditSave = () => {
    if (itemToEdit) {
      setEditSaving(true);
      const isEmpty = (v) => !v || String(v).trim() === '';
      const emailOk = editForm.email ? /[^\s@]+@[^\s@]+\.[^\s@]+/.test(editForm.email) : true;
      const phoneOk = /^\d{7,15}$/.test(editForm.localMobile || '');
      if (isEmpty(editForm.firstName) || isEmpty(editForm.lastName) || isEmpty(editForm.email) || isEmpty(editForm.localMobile)) { showToast(t('please_enter_required') || 'Por favor completa los campos obligatorios', 'error'); setEditSaving(false); return; }
      if (!phoneOk) { showToast(t('valid_mobile') || 'Número de teléfono inválido', 'error'); setEditSaving(false); return; }
      if (!emailOk) { showToast(t('valid_email') || 'Correo electrónico inválido', 'error'); setEditSaving(false); return; }
      const composedMobile = `${editForm.countryCode}${editForm.localMobile}`;
      const updated = { ...itemToEdit, firstName: editForm.firstName, lastName: editForm.lastName, email: editForm.email, approved: editForm.approved, mobile: composedMobile };
      if(updated.id === 'admin0001'){
        alert(t('first_admin_deleted'));
      }else{
        dispatch(editUser(updated.id, updated));
        dispatch(fetchUsersOnce());
        showToast(t('updated'), 'success');
      }
    } else {
      setEditSaving(true);
      const isEmpty = (v) => !v || String(v).trim() === '';
      const emailOk = editForm.email ? /[^\s@]+@[^\s@]+\.[^\s@]+/.test(editForm.email) : true;
      const phoneOk = /^\d{7,15}$/.test(editForm.localMobile || '');
      if (isEmpty(editForm.firstName) || isEmpty(editForm.lastName) || isEmpty(editForm.email) || isEmpty(editForm.localMobile)) { showToast(t('please_enter_required') || 'Por favor completa los campos obligatorios', 'error'); setEditSaving(false); return; }
      if (!phoneOk) { showToast(t('valid_mobile') || 'Número de teléfono inválido', 'error'); setEditSaving(false); return; }
      if (!emailOk) { showToast(t('valid_email') || 'Correo electrónico inválido', 'error'); setEditSaving(false); return; }
      const composedMobile = `${editForm.countryCode}${editForm.localMobile}`;
      const newItem = { firstName: editForm.firstName, lastName: editForm.lastName, email: editForm.email, approved: editForm.approved, mobile: composedMobile, usertype: 'admin', createdAt: Date.now() };
      dispatch(addUser(newItem));
      dispatch(fetchUsersOnce());
      showToast(t('success'), 'success');
    }
    closeEditDialog();
  };

  const handleEditCancel = () => closeEditDialog();
  const handleInputChange = (field, value) => setEditForm(prev => ({...prev, [field]: value}));

  return (
    !loaded.current? <CircularLoading/>:
    <>
    <ThemeProvider theme={theme}>
        <div className="w-full rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
          <TableShadcn
            columns={columns}
            data={data || []}
            initialFilterColumn={'firstName'}
            onAdd={() => { setItemToEdit(null); setEditForm(initialEditForm); setEditDialogOpen(true); }}
            addButtonLabel={t('add_admin')}
            title={t('alladmins_title')}
            columnsButtonLabel={t('columns')}
            columnLabels={{
              firstName: t('first_name'),
              lastName: t('last_name'),
              mobile: t('mobile'),
              email: t('email'),
              profile_image: t('profile_image')
            }}
            renderActions={(row) => (
              <div className="flex gap-2 md:gap-3">
                <IconButton aria-label="edit" onClick={() => handleEditClick(row)}>
                  <EditIcon fontSize='small' />
                </IconButton>
              </div>
            )}
          />
        </div>

        <Dialog open={editDialogOpen} onOpenChange={(open)=> { if(!open) closeEditDialog(); else setEditDialogOpen(true); }}>
          <DialogOverlay onClick={closeEditDialog} />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{ itemToEdit ? t('edit') : t('add_admin') }</DialogTitle>
            </DialogHeader>
            <div className="space-y-4" style={{ position:'relative' }}>
              {editSaving ? (
                <div style={{ position:'absolute', inset:0, background:'rgba(255,255,255,0.6)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:10 }}>
                  <CircularLoading />
                </div>
              ) : null}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('first_name')}</label>
                <input type="text" value={editForm.firstName} onChange={(e)=>handleInputChange('firstName', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" disabled={editSaving} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('last_name')}</label>
                <input type="text" value={editForm.lastName} onChange={(e)=>handleInputChange('lastName', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" disabled={editSaving} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('email')}</label>
                <input type="email" value={editForm.email} onChange={(e)=>handleInputChange('email', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" disabled={editSaving} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('mobile')}</label>
                <div className="flex gap-2">
                  <select value={editForm.countryCode} onChange={(e)=>handleInputChange('countryCode', e.target.value)} className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none">
                    <option value="+1">+1</option>
                    <option value="+57">+57</option>
                  </select>
                  <input type="tel" value={editForm.localMobile} onChange={(e)=>handleInputChange('localMobile', e.target.value.replace(/\D/g,''))} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" disabled={editSaving} placeholder={t('mobile')} />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <button onClick={handleEditCancel} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500" disabled={editSaving}>
                {t('cancel')}
              </button>
              <button onClick={handleEditSave} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500" disabled={editSaving}>
                {t('save')}
              </button>
            </div>
          </DialogContent>
        </Dialog>
     </ThemeProvider>
      <ToastContainer />
    </>
  );
}
