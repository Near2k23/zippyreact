import React, { useState, useEffect, useRef } from "react";
import { downloadCsv } from "../common/sharedFunctions";
import { useSelector, useDispatch } from "react-redux";
import CircularLoading from "../components/CircularLoading";
import { api } from "common";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams,useLocation } from "react-router-dom";
import moment from 'moment/min/moment-with-locales';
import { colors } from "../components/Theme/WebTheme";
import AlertDialog from "../components/AlertDialog";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import Switch from "@mui/material/Switch";
import { Typography, Chip } from "@mui/material";
import {MAIN_COLOR,SECONDORY_COLOR} from "../common/sharedFunctions"
import EditIcon from '@mui/icons-material/Edit';
import InfoIcon from '@mui/icons-material/InfoOutlined';
import DescriptionIcon from '@mui/icons-material/DescriptionOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import { ThemeProvider } from '@mui/material/styles';
import theme from "styles/tableStyle";
import TableShadcn from '../components/ui/TableShadcn';
import IconButton from '../components/ui/icon-button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogOverlay,
} from '../components/ui/dialog';
import {
  AlertDialog as ShadAlertDialog,
  AlertDialogAction as ShadAlertDialogAction,
  AlertDialogCancel as ShadAlertDialogCancel,
  AlertDialogContent as ShadAlertDialogContent,
  AlertDialogDescription as ShadAlertDialogDescription,
  AlertDialogFooter as ShadAlertDialogFooter,
  AlertDialogHeader as ShadAlertDialogHeader,
  AlertDialogTitle as ShadAlertDialogTitle,
} from '../components/ui/alert-dialog';
import { useToast } from '../components/Toast';

export default function Users() {
  const navigate = useNavigate();
  const {id} = useParams();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir();
  const {
    addUser,
    editUser,
    deleteUser,
    fetchUsersOnce,
  } = api;
  const [data, setData] = useState([]);
  const staticusers = useSelector((state) => state.usersdata.staticusers);
  const auth = useSelector((state) => state.auth);
  const settings = useSelector((state) => state.settingsdata.settings);
  const dispatch = useDispatch();
  const loaded = useRef(false);
  const [role, setRole] = useState(null);
  const [fleetAdminsObj, setFleetAdminsObj] = useState();
  const [sortedData, SetSortedData] = useState([]);
  const {state} = useLocation()
  const [currentPage,setCurrentPage] = useState(null)
  const { showToast, ToastContainer } = useToast();

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const initialEditForm = React.useMemo(() => ({
    firstName: '',
    lastName: '',
    email: '',
    approved: true,
    driverActiveStatus: false,
    queue: false,
    countryCode: '+1',
    localMobile: ''
  }), []);
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

  useEffect(() => {
    dispatch(fetchUsersOnce());
  }, [dispatch, fetchUsersOnce]);

  useEffect(() => {
    if (staticusers) {
      if (role === "admin") {
        let arr = staticusers.filter((user) => user.usertype === "fleetadmin");
        let obj = {};
        let arr2 = [];
        for (let i = 0; i < arr.length; i++) {
          let user = arr[i];
          arr2.push({
            id: user.id,
            desc:
              user.firstName +
              " " +
              user.lastName +
              " (" +
              (settings.AllowCriticalEditsAdmin
                ? user.mobile
                : t("hidden_demo")) +
              ") " +
              (settings.AllowCriticalEditsAdmin
                ? user.email
                : t("hidden_demo")),
          });
          obj[user.id] =
            user.firstName +
            " " +
            user.lastName +
            " (" +
            (settings.AllowCriticalEditsAdmin
              ? user.mobile
              : t("hidden_demo")) +
            ") " +
            (settings.AllowCriticalEditsAdmin ? user.email : t("hidden_demo"));
        }
        setFleetAdminsObj(obj);
      }
      setTimeout(() => {
        setData(
          staticusers.filter(
            (user) =>
              user.usertype === "driver" &&
              ((user.fleetadmin === auth.profile.uid &&
                auth.profile.usertype === "fleetadmin") ||
                auth.profile.usertype === "admin")
          )
        );
      }, 1000);
    } else {
      setData([]);
    }
    loaded.current = true;
  }, [
    staticusers,
    auth.profile.usertype,
    auth.profile.uid,
    settings.AllowCriticalEditsAdmin,
    role,t
  ]);

  useEffect(()=>{
    if(data){
      SetSortedData(data.sort((a,b)=>(moment(b.createdAt) - moment(a.createdAt))))
    }
  },[data])

  useEffect(() => {
    if (auth.profile && auth.profile.usertype) {
      setRole(auth.profile.usertype);
    }
  }, [auth.profile]);
 
  const handelApproved = (rowData) => {
    const updatedUser = { ...rowData, approved: !rowData.approved, adminApprovedTrue:true };
    dispatch(editUser(updatedUser.id, updatedUser));
    dispatch(fetchUsersOnce());
    return updatedUser;
  };
  const handelDriverActiveStatus = (rowData) => {
    const updatedUser = {
      ...rowData,
      driverActiveStatus: !rowData.driverActiveStatus,
    };
    dispatch(editUser(updatedUser.id, updatedUser));
    dispatch(fetchUsersOnce());
    return updatedUser;
  };

  const columns = React.useMemo(()=> {
    const baseColumns = [
      { accessorKey: 'createdAt', header: t('createdAt'), cell: ({row}) => row.original.createdAt ? moment(row.original.createdAt).format('lll') : null },
      { accessorKey: 'firstName', header: t('first_name') },
      { accessorKey: 'lastName', header: t('last_name') },
      { accessorKey: 'mobile', header: t('mobile'), cell: ({row}) => settings.AllowCriticalEditsAdmin ? row.original.mobile : t('hidden_demo') },
      { accessorKey: 'email', header: t('email'), cell: ({row}) => settings.AllowCriticalEditsAdmin ? row.original.email : t('hidden_demo') },
    ];
    
    if (settings.showSocialSecurityDrivers) {
      baseColumns.push({ accessorKey: 'socialSecurity', header: 'Social Security', cell: ({row}) => row.original.socialSecurity || '--' });
    }
    
    baseColumns.push(
      { accessorKey: 'profile_image', header: t('profile_image'), cell: ({row}) => row.original.profile_image ? (
        <img alt="Profile" src={row.original.profile_image} style={{ width: 40, height: 40, borderRadius: '50%' }} />
      ) : (<AccountCircleIcon sx={{ fontSize: 40 }} />)
    },
    { accessorKey: 'approved', header: t('account_approve'), cell: ({row}) => (
        <Switch
          disabled={!settings.AllowCriticalEditsAdmin}
        checked={!!row.original.approved}
        onChange={() => handelApproved(row.original)}
      />
    )},
    { accessorKey: 'driverActiveStatus', header: t('driver_active'), cell: ({row}) => (
      <Switch disabled checked={!!row.original.driverActiveStatus} onChange={() => handelDriverActiveStatus(row.original)} />
    )},
    { accessorKey: 'queue', header: t('queue'), cell: ({row}) => (
      <Switch disabled checked={!!row.original.queue} />
    )},
    {
      accessorKey: 'documentsStatus',
      header: t('documents_status'),
      cell: ({row}) => {
        const docStatus = row.original.documentStatus;
        if (!docStatus) return <Chip label="Sin documentos" color="default" size="small" />;
        
        const statuses = Object.values(docStatus).map(d => d.status);
        const hasRejected = statuses.includes('rejected');
        const hasPending = statuses.includes('pending');
        const allApproved = statuses.every(s => s === 'approved');
        
        if (hasRejected) {
          return <Chip label={t('rejected')} color="error" size="small" />;
        } else if (hasPending || statuses.length === 0) {
          return <Chip label={t('pending')} color="warning" size="small" />;
        } else if (allApproved) {
          return <Chip label={t('all_approved')} color="success" size="small" />;
        }
      }
    },
    {
      accessorKey: 'driver_notes',
      header: t('driver_notes') || 'Notas Conductor',
      cell: ({row}) => (
        <Typography variant="body2" sx={{ 
          maxWidth: 200, 
          overflow: 'hidden', 
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          lineHeight: 1.2,
          fontSize: '0.875rem',
          fontFamily: 'inherit'
        }}>
          {row.original.driver_notes || '--'}
        </Typography>
      )
    },
    {
      accessorKey: 'admin_notes',
      header: t('admin_notes') || 'Notas Admin',
      cell: ({row}) => (
        <Typography variant="body2" sx={{ 
          maxWidth: 200, 
          overflow: 'hidden', 
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          lineHeight: 1.2,
          fontSize: '0.875rem',
          fontFamily: 'inherit'
        }}>
          {row.original.admin_notes || '--'}
        </Typography>
      )
    }
    );
    
    return baseColumns;
  }, [t, settings]);

  const [commonAlert, setCommonAlert] = useState({ open: false, msg: "" });
  const handleCommonAlertClose = (e) => {
    e.preventDefault();
    setCommonAlert({ open: false, msg: "" });
  };

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
      driverActiveStatus: !!row.driverActiveStatus,
      queue: !!row.queue,
      countryCode,
      localMobile
    });
    setEditDialogOpen(true);
  };

  const handleEditSave = () => {
    const isEmpty = (v) => !v || String(v).trim() === '';
    if (isEmpty(editForm.firstName) || isEmpty(editForm.lastName) || isEmpty(editForm.email) || isEmpty(editForm.localMobile)) {
      showToast(t('please_enter_required') || 'Por favor completa los campos obligatorios', 'error');
      return;
    }
    const emailOk = editForm.email ? /[^\s@]+@[^\s@]+\.[^\s@]+/.test(editForm.email) : true;
    const phoneOk = /^\d{7,15}$/.test(editForm.localMobile || '');
    if (!phoneOk) { showToast(t('valid_mobile') || 'Número de teléfono inválido', 'error'); return; }
    if (!emailOk) { showToast(t('valid_email') || 'Correo electrónico inválido', 'error'); return; }
    const composedMobile = `${editForm.countryCode}${editForm.localMobile}`;
    if (itemToEdit) {
      setEditSaving(true);
      const updated = { ...itemToEdit, firstName: editForm.firstName, lastName: editForm.lastName, email: editForm.email, approved: editForm.approved, driverActiveStatus: editForm.driverActiveStatus, queue: editForm.queue, mobile: composedMobile };
      dispatch(editUser(updated.id, updated));
      dispatch(fetchUsersOnce());
      showToast(t('updated'), 'success');
    } else {
      setEditSaving(true);
      const newItem = { firstName: editForm.firstName, lastName: editForm.lastName, email: editForm.email, approved: editForm.approved, driverActiveStatus: editForm.driverActiveStatus, queue: editForm.queue, mobile: composedMobile, usertype: 'driver', createdAt: Date.now() };
      dispatch(addUser(newItem));
      dispatch(fetchUsersOnce());
      showToast(t('success'), 'success');
    }
    closeEditDialog();
  };

  const handleDeleteClick = (row) => {
    setItemToDelete(row);
    setConfirmDeleteOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (itemToDelete) {
      dispatch(deleteUser(itemToDelete.id));
      dispatch(fetchUsersOnce());
      showToast(t('user_deleted'), 'success');
      setConfirmDeleteOpen(false);
      setItemToDelete(null);
    }
  };

  const handleEditCancel = () => closeEditDialog();
  const handleInputChange = (field, value) => setEditForm(prev => ({...prev, [field]: value}));

  return !loaded.current ? (
    <CircularLoading />
  ) : (
    <div className="w-full">
      <ThemeProvider theme={theme}>
        <div className="w-full rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
          <TableShadcn
            columns={columns}
            data={sortedData || []}
            initialFilterColumn={'firstName'}
            onAdd={() => { setItemToEdit(null); setEditForm(initialEditForm); setEditDialogOpen(true); }}
            addButtonLabel={t('add_driver')}
            title={t('drivers_title')}
            columnsButtonLabel={t('columns')}
            columnLabels={{
              createdAt: t('createdAt'),
              firstName: t('first_name'),
              lastName: t('last_name'),
              mobile: t('mobile'),
              email: t('email'),
              ...(settings.showSocialSecurityDrivers && { socialSecurity: 'Social Security' }),
              profile_image: t('profile_image'),
              approved: t('account_approve'),
              driverActiveStatus: t('driver_active'),
              queue: t('queue')
            }}
            renderActions={(row) => (
              <div className="flex gap-2 md:gap-3">
                <IconButton aria-label="edit" onClick={() => handleEditClick(row)}>
                  <EditIcon fontSize='small' />
                </IconButton>
                <IconButton aria-label="info" onClick={() => navigate(`/users/driverdetails/${row.id}`,{state:{pageNo:currentPage}})}>
                  <InfoIcon fontSize='small' />
                </IconButton>
                <IconButton aria-label="documents" onClick={() => navigate(`/users/userdocuments/${id}/${row.id}`,{state:{pageNo:currentPage}})}>
                  <DescriptionIcon fontSize='small' />
                </IconButton>
                <IconButton aria-label="delete" onClick={() => handleDeleteClick(row)}>
                  <DeleteIcon fontSize='small' />
                </IconButton>
              </div>
            )}
          />
        </div>

        <Dialog open={editDialogOpen} onOpenChange={(open)=> { if(!open) closeEditDialog(); else setEditDialogOpen(true); }}>
          <DialogOverlay onClick={closeEditDialog} />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{ itemToEdit ? t('edit') : t('add_driver') }</DialogTitle>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('mobile')}</label>
                <div className="flex gap-2">
                  <select value={editForm.countryCode} onChange={(e)=>handleInputChange('countryCode', e.target.value)} className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none">
                    <option value="+1">+1</option>
                    <option value="+57">+57</option>
                  </select>
                  <input type="tel" value={editForm.localMobile} onChange={(e)=>handleInputChange('localMobile', e.target.value.replace(/\D/g,''))} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" disabled={editSaving} placeholder={t('mobile')} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('email')}</label>
                <input type="email" value={editForm.email} onChange={(e)=>handleInputChange('email', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" disabled={editSaving} />
              </div>

              <div className="flex items-center gap-4 flex-wrap">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={editForm.approved} onChange={(e)=>handleInputChange('approved', e.target.checked)} className="h-4 w-4" disabled={editSaving} />
                  {t('account_approve')}
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={editForm.driverActiveStatus} onChange={(e)=>handleInputChange('driverActiveStatus', e.target.checked)} className="h-4 w-4" disabled={editSaving} />
                  {t('driver_active')}
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={editForm.queue} onChange={(e)=>handleInputChange('queue', e.target.checked)} className="h-4 w-4" disabled={editSaving} />
                  {t('queue')}
                </label>
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

      <ShadAlertDialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <ShadAlertDialogContent>
          <ShadAlertDialogHeader>
            <ShadAlertDialogTitle>{t('delete_account_modal_title')}</ShadAlertDialogTitle>
            <ShadAlertDialogDescription>
              {t('delete_user_confirmation')}
            </ShadAlertDialogDescription>
          </ShadAlertDialogHeader>
          <ShadAlertDialogFooter>
            <ShadAlertDialogCancel onClick={()=>setConfirmDeleteOpen(false)}>{t('cancel')}</ShadAlertDialogCancel>
            <ShadAlertDialogAction onClick={handleDeleteConfirm}>{t('delete')}</ShadAlertDialogAction>
          </ShadAlertDialogFooter>
        </ShadAlertDialogContent>
      </ShadAlertDialog>

      <AlertDialog open={commonAlert.open} onClose={handleCommonAlertClose}>
        {commonAlert.msg}
      </AlertDialog>
      <ToastContainer />
    </div>
  );
}
