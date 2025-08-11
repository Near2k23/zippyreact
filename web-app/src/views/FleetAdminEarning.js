import React,{ useState,useEffect } from 'react';
// import MaterialTable from 'material-table';
import { useSelector } from "react-redux";
import CircularLoading from "../components/CircularLoading";
import { useTranslation } from "react-i18next";
import {  SECONDORY_COLOR } from "../common/sharedFunctions";
// import TableStyle from '../components/Table/Style';
// import localization from '../components/Table/Localization';
import TableShadcn from '../components/ui/TableShadcn';

export default function FleetAdminEarning() {
  
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
    { accessorKey: 'fleetUId', header: t('fleetadmin_id') },
    { accessorKey: 'fleetadminName', header: t('fleetadmin_name') },
    { accessorKey: 'year', header: t('year') },
    { accessorKey: 'monthsName', header: t('months') },
    { accessorKey: 'total_rides', header: t('booking_count') },
    { accessorKey: 'fleetCommission', header: t('earning_amount'), cell: ({row}) => formatAmount(row.original.fleetCommission||0, settings.decimal, settings.country) }
  ]), [t, settings]);

  const [data, setData] = useState([]);
  const fleetadminearningdata = useSelector(state => state.fleetadminearningdata);

  useEffect(()=>{
    if(fleetadminearningdata.fleetadminearning){
      setData(fleetadminearningdata.fleetadminearning);
    }
  },[fleetadminearningdata.fleetadminearning]);

  const [selectedRow, setSelectedRow] = useState(null);
  
  return (
    fleetadminearningdata.loading? <CircularLoading/>:
    <div style={{
      direction: isRTL === "rtl" ? "rtl" : "ltr",
      borderRadius: "8px",
      boxShadow: `0px 2px 5px ${SECONDORY_COLOR}`,
      padding: "20px",
    }}>
      <TableShadcn
        columns={columns}
        data={data || []}
        initialFilterColumn={'fleetadminName'}
        title={t('driver_earning_title')}
        columnsButtonLabel={t('columns')}
        columnLabels={{
          fleetUId: t('fleetadmin_id'),
          fleetadminName: t('fleetadmin_name'),
          year: t('year'),
          monthsName: t('months'),
          total_rides: t('booking_count'),
          fleetCommission: t('earning_amount')
        }}
      />
    </div>
  );
}