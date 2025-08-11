import React,{ useState, useEffect } from 'react';
import { downloadCsv } from '../common/sharedFunctions';
// import MaterialTable from "material-table";
import CircularLoading from "../components/CircularLoading";
import { useSelector, useDispatch } from "react-redux";
import { api } from 'common';
import { useTranslation } from "react-i18next";
import moment from 'moment/min/moment-with-locales';
import {colors} from '../components/Theme/WebTheme';
import { SECONDORY_COLOR } from "../common/sharedFunctions";
import { ThemeProvider } from '@mui/material/styles';
import theme from "styles/tableStyle";
// import TableStyle from '../components/Table/Style';
// import localization from '../components/Table/Localization';
import TableShadcn from '../components/ui/TableShadcn';
import IconButton from '../components/ui/icon-button';
import CheckIcon from '@mui/icons-material/Check';
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

const Withdraws = () => {
  const { t,i18n } = useTranslation();
  const isRTL = i18n.dir();
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
      { accessorKey: 'processed', header: t('processed'), cell: ({row}) => row.original.processed ? t('true') : t('false') },
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

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [itemToProcess, setItemToProcess] = useState(null);

  const handleProcessClick = (row) => {
    setItemToProcess(row);
    setConfirmOpen(true);
  };
  const handleProcessConfirm = () => {
    if (itemToProcess) {
      dispatch(completeWithdraw(itemToProcess));
      setConfirmOpen(false);
      setItemToProcess(null);
    }
  };
  const handleProcessCancel = () => { setConfirmOpen(false); setItemToProcess(null); };

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
            processed: t('processed'),
            processDate: t('processDate'),
            bankName: t('bankName'),
            bankCode: t('bankCode'),
            bankAccount: t('bankAccount')
          }}
          renderActions={(row) => (
            <div style={{ display:'flex', gap: 6 }}>
              <IconButton aria-label="process" disabled={row.processed} onClick={() => handleProcessClick(row)}>
                <CheckIcon fontSize='small' />
              </IconButton>
            </div>
          )}
        />
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('process_withdraw')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('confirm_delete') || '¿Procesar este retiro?'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleProcessCancel}>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleProcessConfirm}>{t('save')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ThemeProvider>
  );
}

export default Withdraws;