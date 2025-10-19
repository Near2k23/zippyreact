import React, { useState, useEffect, useRef } from 'react';
import { downloadCsv } from '../common/sharedFunctions';
import { useSelector, useDispatch } from "react-redux";
import CircularLoading from "../components/CircularLoading";
import { api } from 'common';
import { useTranslation } from "react-i18next";
import { colors } from '../components/Theme/WebTheme';
import moment from 'moment/min/moment-with-locales';
import { SECONDORY_COLOR } from "../common/sharedFunctions";
import { ThemeProvider } from '@mui/material/styles';
import theme from "styles/tableStyle";
import TableShadcn from '../components/ui/TableShadcn';
import { Dialog, DialogOverlay, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Button, TextField, MenuItem, Select, FormControl, InputLabel } from '@mui/material';

export default function Complain() {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.dir();
    const settings = useSelector(state => state.settingsdata.settings);
    const {
        fetchUsersOnce,
        editComplain
    } = api;
    const [data, setData] = useState([]);
    const complaindata = useSelector(state => state.complaindata.list);
    const dispatch = useDispatch();
    const loaded = useRef(false);
    
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [itemToEdit, setItemToEdit] = useState(null);
    const [editForm, setEditForm] = useState({
        status: 'pending',
        adminMessage: ''
    });

    useEffect(() => {
        dispatch(fetchUsersOnce());
    }, [dispatch, fetchUsersOnce])

    useEffect(() => {
        if (complaindata) {
            setData(complaindata);
        } else {
            setData([]);
        }
        loaded.current = true;
    }, [complaindata]);

    const handleEditClick = (row) => {
        setItemToEdit(row);
        setEditForm({
            status: row.status || (row.check ? 'resolved' : 'pending'),
            adminMessage: row.adminMessage || ''
        });
        setEditDialogOpen(true);
    };

    const handleEditSave = () => {
        if (itemToEdit) {
            const updated = {
                ...itemToEdit,
                ...editForm
            };
            dispatch(editComplain(updated, 'Update'));
            setData(prev => (prev || []).map(item => item.id === itemToEdit.id ? updated : item));
        }
        setEditDialogOpen(false);
        setItemToEdit(null);
    };

    const handleEditCancel = () => {
        setEditDialogOpen(false);
        setItemToEdit(null);
        setEditForm({
            status: 'pending',
            adminMessage: ''
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'resolved': return '#4CAF50';
            case 'in_review': return '#FF9800';
            case 'rejected': return '#F44336';
            case 'pending': return '#9E9E9E';
            default: return '#9E9E9E';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'resolved': return t('resolved') || 'Resolved';
            case 'in_review': return t('in_review') || 'In Review';
            case 'rejected': return t('rejected') || 'Rejected';
            case 'pending': return t('pending') || 'Pending';
            default: return t('pending') || 'Pending';
        }
    };

    const columns = React.useMemo(() => ([
        { accessorKey: 'complainDate', header: t('complain_date'), cell: ({row}) => row.original.complainDate ? moment(row.original.complainDate).format('lll') : null },
        { accessorKey: 'firstName', header: t('first_name') },
        { accessorKey: 'lastName', header: t('last_name') },
        { accessorKey: 'role', header: t('usertype') },
        { accessorKey: 'email', header: t('email'), cell: ({row}) => settings.AllowCriticalEditsAdmin ? row.original.email : t('hidden_demo') },
        { accessorKey: 'mobile', header: t('mobile'), cell: ({row}) => settings.AllowCriticalEditsAdmin ? row.original.mobile : t('hidden_demo') },
        { accessorKey: 'body', header: t('message_text') },
        { accessorKey: 'subject', header: t('subject') },
        { accessorKey: 'processDate', header: t('processDate'), cell: ({row}) => row.original.processDate ? moment(row.original.processDate).format('lll') : null },
        { 
            accessorKey: 'status', 
            header: t('complain_status') || 'Status', 
            cell: ({row}) => {
                const status = row.original.status || (row.original.check ? 'resolved' : 'pending');
                return (
                    <span style={{ 
                        color: getStatusColor(status),
                        fontWeight: 'bold',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        backgroundColor: getStatusColor(status) + '20'
                    }}>
                        {getStatusText(status)}
                    </span>
                );
            }
        },
        {
            accessorKey: 'actions',
            header: t('actions') || 'Actions',
            cell: ({row}) => (
                <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={() => handleEditClick(row.original)}
                >
                    {t('edit') || 'Edit'}
                </Button>
            ),
            enableSorting: false,
            enableHiding: false
        }
    ]), [t, settings]);

    return (
        !loaded.current ? <CircularLoading /> :
          <ThemeProvider theme={theme}>
            <div style={{ 
                direction: isRTL === "rtl" ? "rtl" : "ltr",
                borderRadius: "8px",
                boxShadow: `0px 2px 5px ${SECONDORY_COLOR}`,
                padding: '20px'
            }}>
                <TableShadcn
                  columns={columns}
                  data={data || []}
                  initialFilterColumn={'firstName'}
                  title={t('complain_title')}
                  columnsButtonLabel={t('columns')}
                  columnLabels={{
                    complainDate: t('complain_date'),
                    firstName: t('first_name'),
                    lastName: t('last_name'),
                    role: t('usertype'),
                    email: t('email'),
                    mobile: t('mobile'),
                    body: t('message_text'),
                    subject: t('subject'),
                    processDate: t('processDate'),
                    status: t('complain_status') || 'Status',
                    actions: t('actions') || 'Actions'
                  }}
                />
            </div>
            
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogOverlay onClick={() => setEditDialogOpen(false)} />
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('edit_complain') || 'Edit Complaint'}</DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                        <FormControl fullWidth>
                            <InputLabel>{t('complain_status') || 'Status'}</InputLabel>
                            <Select
                                value={editForm.status}
                                onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value }))}
                                label={t('complain_status') || 'Status'}
                            >
                                <MenuItem value="pending">{t('pending') || 'Pending'}</MenuItem>
                                <MenuItem value="in_review">{t('in_review') || 'In Review'}</MenuItem>
                                <MenuItem value="rejected">{t('rejected') || 'Rejected'}</MenuItem>
                                <MenuItem value="resolved">{t('resolved') || 'Resolved'}</MenuItem>
                            </Select>
                        </FormControl>
                        
                        <TextField
                            fullWidth
                            multiline
                            rows={4}
                            label={t('admin_message') || 'Admin Message'}
                            value={editForm.adminMessage}
                            onChange={(e) => setEditForm(prev => ({ ...prev, adminMessage: e.target.value }))}
                            placeholder={t('no_admin_message') || 'No message from administrator'}
                        />
                    </div>
                    
                    <DialogFooter>
                        <Button onClick={handleEditCancel}>
                            {t('cancel') || 'Cancel'}
                        </Button>
                        <Button onClick={handleEditSave} variant="contained">
                            {t('save') || 'Save'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
          </ThemeProvider>
    );
}
