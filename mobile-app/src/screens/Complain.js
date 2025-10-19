import React, { useState, useEffect } from 'react';
import { colors } from '../common/theme';
import {
    StyleSheet,
    View,
    Text,
    Animated,
    Dimensions,
    TextInput,
    Alert,
    FlatList,
    useColorScheme,
    TouchableOpacity
} from 'react-native';
import i18n from 'i18n-js';
import { Button } from 'react-native-elements'
import { useSelector, useDispatch } from "react-redux";
import moment from 'moment/min/moment-with-locales';
import { api } from 'common';
import { MAIN_COLOR, MAIN_COLOR_DARK } from "../common/sharedFunctions";
import { fonts } from '../common/font';
import WaygoDialog from '../components/WaygoDialog';

var { width } = Dimensions.get('window');

export default function Complain() {

    const {
        editComplain
    } = api;

    const dispatch = useDispatch();
    const { t } = i18n;
    const isRTL = i18n.locale.indexOf('he') === 0 || i18n.locale.indexOf('ar') === 0;
    const auth = useSelector((state) => state.auth);
    const complaindata = useSelector(state => state.complaindata.list);
    const [scaleAnim] = useState(new Animated.Value(0))
    const [fadeAnim] = useState(new Animated.Value(0))
    const [data, setData] = useState();
    let colorScheme = useColorScheme();
    const [mode, setMode] = useState();

    useEffect(() => {
        if (auth?.profile?.mode) {
            if (auth.profile.mode === 'system'){
                setMode(colorScheme);
            }else{
                setMode(auth.profile.mode);
            }
        } else {
            setMode('light');
        }
    }, [auth, colorScheme]);

    useEffect(() => {
        Animated.spring(
            scaleAnim,
            {
                toValue: 1,
                friction: 3,
                useNativeDriver: true
            }
        ).start();
        setTimeout(() => {
            Animated.timing(
                fadeAnim,
                {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true
                }
            ).start();
        }, 500)
    }, []);

    useEffect(() => {
        if (complaindata && auth) {
            let arr = [];
            let uid = auth.profile.uid;
            for (let i = 0; i < complaindata.length; i++) {
                if (complaindata[i].uid == uid) {
                    arr.push(complaindata[i])
                }
            }
            setData(arr);
        } else {
            setData([]);
        }
    }, [complaindata]);

    const [state, setState] = useState({
        subject: '',
        body: '',
        check: false
    });
    
    const [dialogVisible, setDialogVisible] = useState(false);
    const [selectedComplaint, setSelectedComplaint] = useState(null);

    const submitComplain = () => {
        if (auth.profile.mobile || auth.profile.email) {
            if (state.subject && state.body) {
                let obj = { ...state };
                obj.uid = auth.profile.uid;
                obj.complainDate = new Date().getTime();
                obj.firstName = auth.profile.firstName ? auth.profile.firstName : '';
                obj.lastName = auth.profile.lastName ? auth.profile.lastName : '';
                obj.email = auth.profile.email ? auth.profile.email : '';
                obj.mobile = auth.profile.mobile ? auth.profile.mobile : '';
                obj.role = auth.profile.usertype;
                dispatch(editComplain(obj, "Add"));
                setState({
                    subject: '',
                    body: '',
                    check: false
                });
            } else {
                Alert.alert(t('alert'), t('no_details_error'));
            }
        } else {
            Alert.alert(t('alert'), t('email_phone'));
        }
    }

    const renderInputField = (label, placeholder, value, onChangeText, multiline = false) => (
        <Animated.View 
            style={[
                styles.textInputContainer,
                { transform: [{ scale: scaleAnim }] }
            ]}
        >
            <Text style={[styles.inputLabel, { color: mode === 'dark' ? '#A7A9AC' : '#A7A9AC' }]}>{label}</Text>
            <TextInput
                placeholder={placeholder}
                value={value}
                onChangeText={onChangeText}
                multiline={multiline}
                style={[
                    styles.textInput,
                    mode === 'dark' ? styles.textInputDark : styles.textInputLight,
                    multiline && { height: 100, textAlignVertical: 'top' },
                    { textAlign: isRTL ? 'right' : 'left', color: mode === 'dark' ? colors.WHITE : colors.BLACK }
                ]}
                placeholderTextColor={colors.SHADOW}
            />
        </Animated.View>
    );

    const getStatusInfo = (item) => {
        const status = item.status || (item.check ? 'resolved' : 'pending');
        let color, text, icon, iconColor;
        
        switch (status) {
            case 'resolved':
                color = colors.GREEN;
                text = t('resolved') || 'Resolved';
                icon = 'checkmark-circle-outline';
                iconColor = colors.GREEN;
                break;
            case 'in_review':
                color = colors.ORANGE;
                text = t('in_review') || 'In Review';
                icon = 'time-outline';
                iconColor = colors.ORANGE;
                break;
            case 'rejected':
                color = colors.RED;
                text = t('rejected') || 'Rejected';
                icon = 'close-circle-outline';
                iconColor = colors.RED;
                break;
            default:
                color = '#9E9E9E';
                text = t('pending') || 'Pending';
                icon = 'help-circle-outline';
                iconColor = '#9E9E9E';
        }
        
        return { color, text, icon, iconColor };
    };

    const handleComplaintPress = (item) => {
        setSelectedComplaint(item);
        setDialogVisible(true);
    };

    const getDialogContent = (item) => {
        const statusInfo = getStatusInfo(item);
        const adminMessage = item.adminMessage;
        
        let title = `${t('complain_status') || 'Complaint Status'}: ${statusInfo.text}`;
        let message = adminMessage || `${t('no_admin_message') || 'No message from administrator'}`;
        
        return {
            title,
            message,
            icon: statusInfo.icon,
            iconColor: statusInfo.iconColor,
            type: statusInfo.text.toLowerCase().replace(' ', '_')
        };
    };

    const renderComplaintCard = ({ item }) => {
        const statusInfo = getStatusInfo(item);
        
        return (
            <TouchableOpacity 
                onPress={() => handleComplaintPress(item)}
                activeOpacity={0.7}
            >
                <Animated.View 
                    style={[
                        styles.complaintCard,
                        mode === 'dark' ? styles.shadowBackDark : styles.shadowBack,
                        { opacity: fadeAnim }
                    ]}
                >
                    <View style={[styles.complaintHeader,{flexDirection: isRTL ? 'row-reverse' : 'row', gap: 10}]}>
                        <View style={styles.subjectContainer}>
                            <Text style={[styles.label, { color: mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR, textAlign: isRTL ? 'right' : 'left' }]}>
                                {t('subject')}
                            </Text>
                            <Text style={[styles.subject, { color: mode === 'dark' ? colors.WHITE : colors.BLACK, textAlign: isRTL ? 'right' : 'left' }]}>
                                {item.subject}
                            </Text>
                        </View>
                        <View style={[styles.statusContainer,{alignItems:'center'}]}>
                            <Text style={[styles.date, { color: statusInfo.color, textAlign: isRTL ? 'right' : 'left' }]}>
                                {moment(item.complainDate).format('ll')}
                            </Text>
                            <View style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}>
                                <Text style={styles.statusText}>
                                    {statusInfo.text}
                                </Text>
                            </View>
                        </View>
                    </View>
                    <View>
                        <Text style={[styles.label, { color: mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR, textAlign: isRTL ? 'right' : 'left' }]}>
                            {t('message_text')}
                        </Text>
                        <Text style={[styles.message, { color: mode === 'dark' ? colors.WHITE : colors.BLACK, textAlign: isRTL ? 'right' : 'left' }]}>
                            {item.body}
                        </Text>
                    </View>
                </Animated.View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={[styles.mainView, { backgroundColor: mode === 'dark' ? colors.PAGEBACK : colors.WHITE }]}>
            <View style={styles.formContainer}>
                {renderInputField(t('subject'), '', state.subject, (text) => setState({ ...state, subject: text }))}
                {renderInputField(t('message_text'), '', state.body, (text) => setState({ ...state, body: text }), true)}
                      
                <View style={styles.buttonContainer}>
                    <Button
                        onPress={submitComplain}
                        title={t('submit')}
                        titleStyle={[styles.buttonTitle, {color: colors.WHITE}]}
                        buttonStyle={[styles.submitButton,{backgroundColor: mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR}]}
                    />
                </View> 
            </View>

            <FlatList
                data={data}
                renderItem={renderComplaintCard}
                keyExtractor={(item, index) => index.toString()}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContainer}
            />
            
            <WaygoDialog
                visible={dialogVisible}
                onClose={() => setDialogVisible(false)}
                title={selectedComplaint ? getDialogContent(selectedComplaint).title : ''}
                message={selectedComplaint ? getDialogContent(selectedComplaint).message : ''}
                icon={selectedComplaint ? getDialogContent(selectedComplaint).icon : ''}
                iconColor={selectedComplaint ? getDialogContent(selectedComplaint).iconColor : ''}
                type={selectedComplaint ? getDialogContent(selectedComplaint).type : 'info'}
                showButtons={false}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    mainView: {
        flex: 1,
        width: width,
    },
    formContainer: {
        padding: 20,
        paddingBottom: 10,
        gap: 10,
    },
    textInputContainer: {
        width: '100%',
        marginBottom: 16,
    },
    inputLabel: {
        width: '100%',
        fontSize: 13,
        marginBottom: 6,
        fontFamily: fonts.Bold
    },
    textInput: {
        borderWidth: 1,
        borderColor: '#E2E9EC',
        borderRadius: 10,
        paddingVertical: 15,
        paddingLeft: 10,
        paddingRight: 10,
        fontFamily: fonts.Regular,
        fontSize: 14,
        minHeight: 50,
    },
    textInputDark: {
        borderColor: '#2C2C2E',
        backgroundColor: '#1C1C1E',
    },
    textInputLight: {
        backgroundColor: colors.WHITE,
    },
    buttonContainer: {
        width: '100%',
        marginBottom: 30,
        marginTop: 10,
    },
    submitButton: {
        width: '100%',
        borderRadius: 10,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 4,
        marginBottom: 5,
    },
    submitButtonText: {
        color: colors.WHITE,
        fontSize: 18,
        fontFamily: fonts.Bold,
    },
    listContainer: {
        padding: 20,
        paddingTop: 10,
    },
    complaintCard: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: colors.BLACK,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    complaintHeader: {
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    subjectContainer: {
        flex: 1,
    },
    statusContainer: {
        alignItems: 'flex-end',
    },
    label: {
        fontSize: 14,
        fontFamily: fonts.Bold,
        marginBottom: 5,
    },
    subject: {
        fontSize: 16,
        fontFamily: fonts.Bold,
    },
    date: {
        fontSize: 12,
        fontFamily: fonts.Regular,
        marginBottom: 5,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        color: colors.WHITE,
        fontSize: 12,
        fontFamily: fonts.Bold,
    },

    message: {
        fontSize: 14,
        fontFamily: fonts.Regular,
        lineHeight: 20,
    },
    shadowBack: {
        shadowColor: colors.BLACK,
        backgroundColor: colors.WHITE,
    },
    shadowBackDark: {
        shadowColor: colors.BLACK,
        backgroundColor: '#1C1C1E',
    },
    buttonTitle: {
        fontFamily:fonts.Bold,
        fontSize: 18
    },

})