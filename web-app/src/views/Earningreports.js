import React,{ useState,useEffect } from 'react';
// import MaterialTable from 'material-table';
import { useSelector} from "react-redux";
import CircularLoading from "../components/CircularLoading";
import { useTranslation } from "react-i18next";
import {colors} from '../components/Theme/WebTheme';
import {  SECONDORY_COLOR } from "../common/sharedFunctions";
import { ThemeProvider } from '@mui/material/styles';
import theme from "styles/tableStyle";
// import TableStyle from '../components/Table/Style';
// import localization from '../components/Table/Localization';
import TableShadcn from '../components/ui/TableShadcn';

export default function Earningreports() {
  const { t,i18n } = useTranslation();
  const isRTL = i18n.dir();
  
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

  const columns =  React.useMemo(() => ([
    { accessorKey: 'year', header: t('year') },
    { accessorKey: 'monthsName', header: t('months') },
    { accessorKey: 'total_rides', header: t('booking_count') },
    { accessorKey: 'Gross_trip_cost', header: t('Gross_trip_cost'), cell: ({row}) => formatAmount((parseFloat(row.original.tripCost||0) + parseFloat(row.original.cancellationFee||0)), settings.decimal, settings.country) },
    { accessorKey: 'rideCost', header: t('trip_cost_driver_share'), cell: ({row}) => formatAmount(row.original.rideCost||0, settings.decimal, settings.country) },
    { accessorKey: 'cancellationFee', header: t('cancellationFee'), cell: ({row}) => formatAmount(row.original.cancellationFee||0, settings.decimal, settings.country) },
    { accessorKey: 'convenienceFee', header: t('convenience_fee'), cell: ({row}) => formatAmount(row.original.convenienceFee||0, settings.decimal, settings.country) },
    { accessorKey: 'fleetadminFee', header: t('convenience_fee'), cell: ({row}) => formatAmount(row.original.fleetadminFee||0, settings.decimal, settings.country) },
    { accessorKey: 'Profit', header: t('Profit'), cell: ({row}) => formatAmount((parseFloat(row.original.convenienceFee||0) + parseFloat(row.original.cancellationFee||0) - parseFloat(row.original.discountAmount||0)), settings.decimal, settings.country) },
  ]), [t, settings]);

  const [data, setData] = useState([]);
  const earningreportsdata = useSelector(state => state.earningreportsdata);

  useEffect(()=>{
        if(earningreportsdata.Earningreportss){
            setData(earningreportsdata.Earningreportss);
        }
  },[earningreportsdata.Earningreportss]);

  const [selectedRow, setSelectedRow] = useState(null);

  return (
    earningreportsdata.loading? <CircularLoading/>:
    <ThemeProvider theme={theme}>
      <div style={{
        direction: isRTL === "rtl" ? "rtl" : "ltr",
        borderRadius: "8px",
        padding: "20px",
        boxShadow: `0px 2px 5px ${SECONDORY_COLOR}`,
      }}>
        <TableShadcn
          columns={columns}
          data={data || []}
          initialFilterColumn={'monthsName'}
          title={t('earning_reports_title')}
          columnsButtonLabel={t('columns')}
          columnLabels={{
            year: t('year'),
            monthsName: t('months'),
            total_rides: t('booking_count'),
            Gross_trip_cost: t('Gross_trip_cost'),
            rideCost: t('trip_cost_driver_share'),
            cancellationFee: t('cancellationFee'),
            convenienceFee: t('convenience_fee'),
            fleetadminFee: t('convenience_fee'),
            Profit: t('Profit')
          }}
        />
      </div>
    </ThemeProvider>
  );
}