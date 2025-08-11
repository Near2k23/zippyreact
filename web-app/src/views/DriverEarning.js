import React,{ useState,useEffect } from 'react';
// import MaterialTable from 'material-table';
import { useSelector } from "react-redux";
import CircularLoading from "../components/CircularLoading";
import { useTranslation } from "react-i18next";
import {colors} from '../components/Theme/WebTheme';
import {  SECONDORY_COLOR } from "../common/sharedFunctions";
import { ThemeProvider } from '@mui/material/styles';
import theme from "styles/tableStyle";
// import TableStyle from '../components/Table/Style';
// import localization from '../components/Table/Localization';
import TableShadcn from '../components/ui/TableShadcn';

export default function DriverEarning() {
  const { t,i18n } = useTranslation();
  const isRTL = i18n.dir();
  const settings = useSelector((state) => state.settingsdata.settings);
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

  const columns =  React.useMemo(() => ([
      { accessorKey: 'year', header: t('year') },
      { accessorKey: 'monthsName', header: t('months') },
      { accessorKey: 'driverName', header: t('driver_name') },
      { accessorKey: 'total_rides', header: t('booking_count') },
      { accessorKey: 'driverVehicleNo', header: t('vehicle_reg_no') },
      { accessorKey: 'driverShare', header: t('earning_amount'), cell: ({row}) => row.original.driverShare ? formatAmount(row.original.driverShare, settings.decimal, settings.country) : 0 }
  ]), [t, settings]);

  const [data, setData] = useState([]);
  const driverearningdata = useSelector(state => state.driverearningdata);

  useEffect(()=>{
        if(driverearningdata.driverearnings){
            setData(driverearningdata.driverearnings);
        }
  },[driverearningdata.driverearnings]);

  const [selectedRow, setSelectedRow] = useState(null);
  
  return (
    driverearningdata.loading? <CircularLoading/>:
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
            initialFilterColumn={'driverName'}
            title={t('driver_earning_title')}
            columnsButtonLabel={t('columns')}
            columnLabels={{
              year: t('year'),
              monthsName: t('months'),
              driverName: t('driver_name'),
              total_rides: t('booking_count'),
              driverVehicleNo: t('vehicle_reg_no'),
              driverShare: t('earning_amount')
            }}
          />
        </div>
      </ThemeProvider>
  );
}