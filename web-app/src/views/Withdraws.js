import React,{ useState, useEffect } from 'react';
import { downloadCsv } from '../common/sharedFunctions';
import CircularLoading from "../components/CircularLoading";
import { useSelector, useDispatch } from "react-redux";
import { useLocation } from 'react-router-dom';
import { api } from 'common';
import { useTranslation } from "react-i18next";
import moment from 'moment/min/moment-with-locales';
import {colors} from '../components/Theme/WebTheme';
import { SECONDORY_COLOR } from "../common/sharedFunctions";
import { ThemeProvider } from '@mui/material/styles';
import theme from "styles/tableStyle";
import TableShadcn from '../components/ui/TableShadcn';
import { Dialog, DialogOverlay, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Button, TextField, FormControl, FormControlLabel, Radio, RadioGroup, FormLabel } from '@mui/material';

const Withdraws = () => {
  const { t,i18n } = useTranslation();
  const isRTL = i18n.dir();
  const location = useLocation();
  const settings = useSelector(state => state.settingsdata.settings);
  const {
    completeWithdraw
  } = api;
  const dispatch = useDispatch();

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

  const columns =  React.useMemo(() => {
    const base = [
      { accessorKey: 'id', header: 'ID' },
      { accessorKey: 'date', header: t('requestDate'), cell: ({row}) => row.original.date ? moment(row.original.date).format('lll') : null },
      { accessorKey: 'name', header: t('driver_name') },
      { accessorKey: 'amount', header: t('amount'), cell: ({row}) => row.original.amount
        ? (settings.swipe_symbol ? `${formatAmount(row.original.amount, settings.decimal, settings.country)} ${settings.symbol}` : `${settings.symbol} ${formatAmount(row.original.amount, settings.decimal, settings.country)}`)
        : (settings.swipe_symbol ? `0 ${settings.symbol}` : `${settings.symbol} 0`) },
      { 
        accessorKey: 'status', 
        header: t('withdraw_status') || 'Status', 
        cell: ({row}) => {
          const status = row.original.status || (row.original.processed ? 'approved' : 'pending');
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
        accessorKey: 'adminNote', 
        header: t('admin_note') || 'Admin Note', 
        cell: ({row}) => (
          <span style={{ 
            fontStyle: row.original.adminNote ? 'normal' : 'italic',
            color: row.original.adminNote ? 'inherit' : '#999'
          }}>
            {row.original.adminNote || '--'}
          </span>
        )
      },
      { 
        accessorKey: 'rejectionReason', 
        header: t('rejection_reason') || 'Rejection Reason', 
        cell: ({row}) => (
          <span style={{ 
            fontStyle: row.original.rejectionReason ? 'normal' : 'italic',
            color: row.original.rejectionReason ? 'inherit' : '#999'
          }}>
            {row.original.rejectionReason || '--'}
          </span>
        )
      },
      { accessorKey: 'processDate', header: t('processDate'), cell: ({row}) => row.original.processDate ? moment(row.original.processDate).format('lll') : null },
    ];
    if (settings.bank_fields !== false) {
      base.push(
        { accessorKey: 'bankName', header: t('bankName') },
        { accessorKey: 'bankCode', header: t('bankCode') },
        { accessorKey: 'bankAccount', header: t('bankAccount') },
      );
    }
    return base;
  }, [t, settings]);

  const [data, setData] = useState([]);
  const withdrawdata = useSelector(state => state.withdrawdata);

  useEffect(()=>{
        if(withdrawdata.withdraws){
            setData(withdrawdata.withdraws);
        }else{
          setData([]);
        }
  },[withdrawdata.withdraws]);

  // Lógica de eventos personalizados removida - ahora navegamos directamente a la pantalla

  const [processDialogOpen, setProcessDialogOpen] = useState(false);
  const [itemToProcess, setItemToProcess] = useState(null);
  const [processForm, setProcessForm] = useState({
    status: 'approved',
    adminNote: '',
    rejectionReason: ''
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return '#4CAF50';
      case 'rejected': return '#F44336';
      case 'pending': return '#9E9E9E';
      default: return '#9E9E9E';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'approved': return t('approved') || 'Approved';
      case 'rejected': return t('rejected') || 'Rejected';
      case 'pending': return t('pending') || 'Pending';
      default: return t('pending') || 'Pending';
    }
  };

  const handleProcessClick = (row) => {
    setItemToProcess(row);
    setProcessForm({
      status: 'approved',
      adminNote: '',
      rejectionReason: ''
    });
    setProcessDialogOpen(true);
  };

  const handleProcessSave = () => {
    if (itemToProcess) {
      const updated = {
        ...itemToProcess,
        ...processForm
      };
      dispatch(completeWithdraw(updated));
      setData(prev => (prev || []).map(item => item.id === itemToProcess.id ? updated : item));
    }
    setProcessDialogOpen(false);
    setItemToProcess(null);
  };

  const handleProcessCancel = () => {
    setProcessDialogOpen(false);
    setItemToProcess(null);
    setProcessForm({
      status: 'approved',
      adminNote: '',
      rejectionReason: ''
    });
  };

  return (
    withdrawdata.loading? <CircularLoading/>:
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
          initialFilterColumn={'name'}
          title={t('Withdraw_title')}
          columnsButtonLabel={t('columns')}
          columnLabels={{
            id: 'ID',
            date: t('requestDate'),
            name: t('driver_name'),
            amount: t('amount'),
            status: t('withdraw_status') || 'Status',
            processDate: t('processDate'),
            bankName: t('bankName'),
            bankCode: t('bankCode'),
            bankAccount: t('bankAccount')
          }}
          renderActions={(row) => {
            const status = row.status || (row.processed ? 'approved' : 'pending');
            const isProcessed = status === 'approved' || status === 'rejected';
            
            return (
              <div style={{ display:'flex', gap: 6 }}>
                <Button 
                  variant="outlined" 
                  size="small" 
                  disabled={isProcessed}
                  onClick={() => handleProcessClick(row)}
                >
                  {isProcessed ? (t('processed') || 'Processed') : (t('process') || 'Process')}
                </Button>
              </div>
            );
          }}
        />
      </div>

      <Dialog open={processDialogOpen} onOpenChange={setProcessDialogOpen}>
        <DialogOverlay onClick={() => setProcessDialogOpen(false)} />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('process_withdraw') || 'Process Withdrawal'}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <FormControl component="fieldset">
              <FormLabel component="legend">{t('withdraw_status') || 'Withdrawal Status'}</FormLabel>
              <RadioGroup
                value={processForm.status}
                onChange={(e) => setProcessForm(prev => ({ ...prev, status: e.target.value }))}
              >
                <FormControlLabel 
                  value="approved" 
                  control={<Radio />} 
                  label={t('approve') || 'Approve'} 
                />
                <FormControlLabel 
                  value="rejected" 
                  control={<Radio />} 
                  label={t('reject') || 'Reject'} 
                />
              </RadioGroup>
            </FormControl>
            
            <TextField
              fullWidth
              multiline
              rows={3}
              label={t('admin_note') || 'Admin Note'}
              value={processForm.adminNote}
              onChange={(e) => setProcessForm(prev => ({ ...prev, adminNote: e.target.value }))}
              placeholder={t('admin_note_placeholder') || 'Optional note for the user...'}
            />
            
            {processForm.status === 'rejected' && (
              <TextField
                fullWidth
                multiline
                rows={2}
                label={t('rejection_reason') || 'Rejection Reason'}
                value={processForm.rejectionReason}
                onChange={(e) => setProcessForm(prev => ({ ...prev, rejectionReason: e.target.value }))}
                placeholder={t('rejection_reason_placeholder') || 'Reason for rejection...'}
              />
            )}
          </div>
          
          <DialogFooter>
            <Button onClick={handleProcessCancel}>
              {t('cancel') || 'Cancel'}
            </Button>
            <Button onClick={handleProcessSave} variant="contained">
              {t('process') || 'Process'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ThemeProvider>
  );
}

export default Withdraws;