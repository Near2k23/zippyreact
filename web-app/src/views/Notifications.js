import React,{ useState, useEffect } from 'react';
// import MaterialTable from 'material-table';
import { useSelector, useDispatch } from "react-redux";
import CircularLoading from "../components/CircularLoading";
import { api } from 'common';
import { useTranslation } from "react-i18next";
import {colors} from '../components/Theme/WebTheme';
import {  useNavigate,useLocation } from 'react-router-dom';
import { SECONDORY_COLOR } from "../common/sharedFunctions";
import moment from 'moment/min/moment-with-locales';
import { ThemeProvider } from '@mui/material/styles';
import theme from "styles/tableStyle";
// import TableStyle from '../components/Table/Style';
// import localization from '../components/Table/Localization';
// import BlankTable from '../components/Table/BlankTable';
import TableShadcn from '../components/ui/TableShadcn';
import IconButton from '../components/ui/icon-button';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/Edit';
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

export default function Notifications() {
  const { t, i18n  } = useTranslation();
  const isRTL = i18n.dir();
  const {
    editNotifications
  } = api;

  const columns =  React.useMemo(() => ([
    { accessorKey: 'createdAt', header: t('createdAt'), cell: ({row}) => row.original.createdAt ? moment(row.original.createdAt).format('lll') : null },
    { accessorKey: 'devicetype', header: t('device_type'), cell: ({row}) => {
      const v = row.original.devicetype;
      return v === 'All' ? t('all') : v === 'ANDROID' ? t('android') : v === 'IOS' ? t('ios') : v;
    }},
    { accessorKey: 'usertype', header: t('user_type'), cell: ({row}) => row.original.usertype === 'customer' ? t('customer') : row.original.usertype === 'driver' ? t('driver') : row.original.usertype },
    { accessorKey: 'title', header: t('title') },
    { accessorKey: 'body', header: t('body') },
  ]), [t]);

  const [data, setData] = useState([]);
  const notificationdata = useSelector(state => state.notificationdata);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {state} = useLocation()
  const [currentPage,setCurrentPage] = useState(null)

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState(null);
  const initialEditForm = React.useMemo(()=>({
    devicetype: 'All',
    usertype: 'customer',
    title: '',
    body: ''
  }),[]);
  const [editForm, setEditForm] = useState(initialEditForm);

  useEffect(()=>{
    setCurrentPage(state?.pageNo)
  },[state])

  useEffect(()=>{
        if(notificationdata.notifications){
            setData(notificationdata.notifications);
        }else{
            setData([]);
        }
  },[notificationdata.notifications]);

  const handleDeleteClick = (row) => {
    setItemToDelete(row);
    setConfirmOpen(true);
  };
  const handleDeleteConfirm = () => {
    if (itemToDelete) {
      dispatch(editNotifications(itemToDelete, 'Delete'));
      setConfirmOpen(false);
      setItemToDelete(null);
    }
  };
  const handleDeleteCancel = () => { setConfirmOpen(false); setItemToDelete(null); };

  const handleAddClick = () => {
    setItemToEdit(null);
    setEditForm(initialEditForm);
    setEditDialogOpen(true);
  };
  const handleEditClick = (row) => {
    setItemToEdit(row);
    setEditForm({
      devicetype: row.devicetype || 'All',
      usertype: row.usertype || 'customer',
      title: row.title || '',
      body: row.body || ''
    });
    setEditDialogOpen(true);
  };
  const handleSave = () => {
    const isEmpty = (v) => !v || String(v).trim() === '';
    if (isEmpty(editForm.title) || isEmpty(editForm.body)) return;
    if (itemToEdit) {
      const updated = { ...itemToEdit, ...editForm };
      dispatch(editNotifications(updated, 'Update'));
    } else {
      const newItem = { ...editForm, createdAt: Date.now() };
      dispatch(editNotifications(newItem, 'Add'));
    }
    setEditDialogOpen(false);
    setItemToEdit(null);
  };

  return (
    notificationdata.loading? <CircularLoading/>:
    <ThemeProvider theme={theme}>
      <div style={{
        direction: isRTL === "rtl" ? "rtl" : "ltr",
        borderRadius: "8px",
        boxShadow: `0px 2px 5px ${SECONDORY_COLOR}`,
        padding: "20px",
      }}>
        <TableShadcn
          columns={columns}
          data={data || []}
          initialFilterColumn={'title'}
          onAdd={handleAddClick}
          addButtonLabel={t('add_notification')}
          title={t('push_notification_title')}
          columnsButtonLabel={t('columns')}
          columnLabels={{
            createdAt: t('createdAt'),
            devicetype: t('device_type'),
            usertype: t('user_type'),
            title: t('title'),
            body: t('body')
          }}
          renderActions={(row) => (
            <div style={{ display:'flex', gap: 6 }}>
              <IconButton aria-label="edit" onClick={() => handleEditClick(row)}>
                <EditIcon fontSize='small' />
              </IconButton>
              <IconButton aria-label="delete" onClick={() => handleDeleteClick(row)}>
                <DeleteIcon fontSize='small' />
              </IconButton>
            </div>
          )}
        />
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('confirm_delete')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('delete_confirmation') || '¿Eliminar esta notificación?'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeleteCancel}>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>{t('delete')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={editDialogOpen} onOpenChange={(open)=> { if(!open) setEditDialogOpen(false); else setEditDialogOpen(true); }}>
        <DialogOverlay onClick={()=>setEditDialogOpen(false)} />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{ itemToEdit ? t('edit') : t('add_notification') }</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('device_type')}</label>
              <select value={editForm.devicetype} onChange={(e)=>setEditForm(prev=>({...prev, devicetype: e.target.value}))} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                <option value="All">{t('all')}</option>
                <option value="ANDROID">{t('android')}</option>
                <option value="IOS">{t('ios')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('user_type')}</label>
              <select value={editForm.usertype} onChange={(e)=>setEditForm(prev=>({...prev, usertype: e.target.value}))} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                <option value="customer">{t('customer')}</option>
                <option value="driver">{t('driver')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('title')}</label>
              <input type="text" value={editForm.title} onChange={(e)=>setEditForm(prev=>({...prev, title: e.target.value}))} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('body')}</label>
              <textarea value={editForm.body} onChange={(e)=>setEditForm(prev=>({...prev, body: e.target.value}))} className="w-full px-3 py-2 border border-gray-300 rounded-md" rows={4} />
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <button onClick={()=>setEditDialogOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
              {t('cancel')}
            </button>
            <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700">
              {t('save')}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </ThemeProvider>
  );
}
