import React,{ useState, useEffect } from 'react';
// import { downloadCsv } from '../common/sharedFunctions';
// import MaterialTable from "material-table";
import CircularLoading from "../components/CircularLoading";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import moment from 'moment/min/moment-with-locales';
import {colors} from '../components/Theme/WebTheme';
import {SECONDORY_COLOR} from "../common/sharedFunctions"
import { ThemeProvider } from '@mui/material/styles';
import theme from "styles/tableStyle";
// import TableStyle from '../components/Table/Style';
// import localization from '../components/Table/Localization';
import TableShadcn from '../components/ui/TableShadcn';

const Sos = () => {
  const { t,i18n } = useTranslation();
  const isRTL = i18n.dir();
  const settings = useSelector(state => state.settingsdata.settings);
  const columns =  React.useMemo(() => ([
    { accessorKey: 'bookingId', header: t('id') },
    { accessorKey: 'user_name', header: t('name') },
    { accessorKey: 'contact', header: t('contact'), cell: ({row}) => settings.AllowCriticalEditsAdmin ? row.original.contact : t('hidden_demo') },
    { accessorKey: 'user_type', header: t('user_type') },
    { accessorKey: 'complainDate', header: t('complain_date'), cell: ({row}) => row.original.complainDate ? moment(row.original.complainDate).format('lll') : null },
  ]), [t, settings]);
  const [data, setData] = useState([]);
  const sosdata = useSelector(state => state.sosdata);

  useEffect(()=>{
        if(sosdata.sos){
            setData(sosdata.sos);
        }else{
          setData([]);
        }
  },[sosdata.sos]);

  // const [selectedRow, setSelectedRow] = useState(null);
  
  return (
    sosdata.loading? <CircularLoading/>:
    <ThemeProvider theme={theme}>
      <div style={{direction:isRTL ==='rtl'?'rtl':'ltr', borderRadius: "8px", boxShadow: `0px 2px 5px ${SECONDORY_COLOR}`, padding: '20px'}}>
        <TableShadcn
          columns={columns}
          data={data || []}
          initialFilterColumn={'user_name'}
          title={t('sos_title')}
          columnsButtonLabel={t('columns')}
          columnLabels={{
            bookingId: t('id'),
            user_name: t('name'),
            contact: t('contact'),
            user_type: t('user_type'),
            complainDate: t('complain_date')
          }}
        />
      </div>
    </ThemeProvider>
  );
}

export default Sos;