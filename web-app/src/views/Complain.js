import React, { useState, useEffect, useRef } from 'react';
import { downloadCsv } from '../common/sharedFunctions';
// import MaterialTable from "material-table";
import { useSelector, useDispatch } from "react-redux";
import CircularLoading from "../components/CircularLoading";
import { api } from 'common';
import { useTranslation } from "react-i18next";
import { colors } from '../components/Theme/WebTheme';
import moment from 'moment/min/moment-with-locales';
import { SECONDORY_COLOR } from "../common/sharedFunctions";
import { ThemeProvider } from '@mui/material/styles';
import theme from "styles/tableStyle";
// import TableStyle from '../components/Table/Style';
// import localization from '../components/Table/Localization';
import TableShadcn from '../components/ui/TableShadcn';
import Switch from '@mui/material/Switch';

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

    const handleToggleCheck = (row) => {
        const updated = { ...row, check: !row.check };
        dispatch(editComplain(updated, 'Update'));
        setData(prev => (prev || []).map(item => item.id === row.id ? updated : item));
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
        { accessorKey: 'check', header: t('status'), cell: ({row}) => (
            <Switch
              checked={!!row.original.check}
              onChange={() => handleToggleCheck(row.original)}
            />
        )},
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
                    check: t('status')
                  }}
                />
            </div>
          </ThemeProvider>
    );
}
