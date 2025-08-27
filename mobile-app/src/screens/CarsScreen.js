import React, { useState, useEffect } from 'react'
import { View, Text, Image, StyleSheet, Dimensions, ScrollView, TouchableWithoutFeedback, TouchableOpacity, Alert, Switch } from 'react-native'
import { colors } from '../common/theme'
import { useSelector, useDispatch } from 'react-redux';
import i18n from 'i18n-js';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { MAIN_COLOR, MAIN_COLOR_DARK, SECONDORY_COLOR } from '../common/sharedFunctions';
import { FontAwesome5 } from '@expo/vector-icons';
import { api } from 'common';
import { fonts } from '../common/font';
import { getLangKey } from 'common/src/other/getLangKey';
const { height, width } = Dimensions.get("window");
import { useColorScheme } from 'react-native';

export default function CarsScreen(props) {
    const {editCar, updateUserCar} = api;
    const dispatch = useDispatch();
    const { t } = i18n;
    const isRTL = i18n.locale.indexOf('he') === 0 || i18n.locale.indexOf('ar') === 0;
    const carlistdata = useSelector(state => state.carlistdata);
    const [data, setData] = useState([]);
    const params = props.route.params;

    const fromPage = params && params.fromPage? params.fromPage: "";

    const auth = useSelector(state => state.auth);
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
        if (carlistdata.cars) {
            setData(carlistdata.cars);
        } else {
            setData([]);
        }
    }, [carlistdata.cars]);

    const onPress = (car) => {
        props.navigation.navigate('CarEdit', { car: car })
    }

    const onPressBack = () => {
        if(fromPage == 'DriverTrips'){
            props.navigation.navigate('TabRoot', { screen: fromPage });
        }else{
            props.navigation.goBack() 
        }
    }

    const lCom = () => {
        return (
          <TouchableOpacity style={{ marginLeft: 10}} onPress={onPressBack}>
            <FontAwesome5 name="arrow-left" size={24} color={colors.WHITE} />
          </TouchableOpacity>
        );
    }
    
    React.useEffect(() => {
        props.navigation.setOptions({
            headerLeft: lCom,
        });
    }, [props.navigation]);

    React.useEffect(() => {
        props.navigation.setOptions({
            headerRight: () => {
                return (
                    <TouchableOpacity 
                        onPress={() => props.navigation.navigate('CarEdit')} 
                        style={[
                            styles.addButton,
                            { 
                                marginEnd: 12,
                                width: 120,
                                paddingHorizontal: 16,
                                flexDirection: 'row',
                                gap: 6
                            }
                        ]}
                    >
                        <MaterialIcons name="add" size={20} color={colors.WHITE} />
                        <Text style={styles.addButtonText}>
                            {t('add_car')}
                        </Text>
                    </TouchableOpacity>
                )
            }
        });
    }, [props.navigation, mode]);


    const deleteCar = async (item) => {
        if(!item.active){
            Alert.alert(
                t('alert'),
                t('delete_your_car'),
                [
                    {
                        text: t('cancel'),
                        onPress: () => {},
                        style: 'cancel',
                        
                    },
                    {
                        text: t('yes'), onPress: () => {
                            dispatch(editCar(item,"Delete"));

                        }
                    },
                ],
                { cancelable: true }
            );
        }else{
            Alert.alert(t('alert'), t('active_car_delete'))
        }
    }

    const toggleCarActive = async (item) => {
        if (item.approved) {
            let activeCar = null;
            for (let i = 0; i < data.length; i++) {
                if (data[i].active && data[i].id !== item.id) {
                    activeCar = data[i];
                    break;
                }
            }
            
            if (activeCar && !item.active) {
                activeCar.active = false;
                dispatch(editCar(activeCar, "Update"));
            }
            
            const updatedItem = { ...item, active: !item.active };
            dispatch(editCar(updatedItem, "Update"));
            
            if (updatedItem.active) {
                let updateData = {
                    carType: updatedItem.carType,
                    vehicleNumber: updatedItem.vehicleNumber,
                    vehicleMake: updatedItem.vehicleMake,
                    vehicleModel: updatedItem.vehicleModel,
                    other_info: updatedItem.other_info || "",
                    car_image: updatedItem.car_image,
                    carApproved: updatedItem.approved,
                    updateAt: new Date().getTime()
                };
                dispatch(updateUserCar(auth.profile.uid, updateData));
            } else {
                dispatch(updateUserCar(auth.profile.uid, {
                    carType: null,
                    vehicleNumber: null,
                    vehicleMake: null,
                    vehicleModel: null,
                    other_info: null,
                    car_image: null,
                    updateAt: new Date().getTime()
                }));
            }
        } else {
            Alert.alert(t('alert'), t('car_not_approved'));
        }
    }

    return (

        <View style={[styles.container, {backgroundColor: mode === 'dark' ? colors.PAGEBACK : colors.WHITE}]}>
            <View style={{flex: 1, position: 'absolute',backgroundColor: colors.TRANSPARENT, height:'100%', width: '100%' }}>
                <ScrollView styles={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom: 100, paddingHorizontal: 8, paddingTop: 8}}>
                    {data && data.length > 0 ?
                        data.map((c, i) => {
                            return (
                                <View key={"index" + i} style={[styles.modernCard, mode === 'dark' ? styles.modernCardDark : styles.modernCardLight]}>
                                    <TouchableWithoutFeedback onPress={() => onPress(c)}>
                                        <View style={styles.cardContent}>
                                            <View style={styles.cardHeader}>
                                                <View style={styles.carImageContainer}>
                                                    <Image source={{ uri: c.car_image }} style={styles.carImage} resizeMode='cover' />
                                                    {c.active && (
                                                        <View style={styles.activeBadge}>
                                                            <Ionicons name="checkmark-circle" size={20} color={colors.WHITE} />
                                                        </View>
                                                    )}
                                                </View>
                                                
                                                <View style={styles.carInfo}>
                                                    <View style={styles.carTitleRow}>
                                                        <Text style={[styles.carTitle, { color: mode === 'dark' ? colors.WHITE : colors.BLACK }]}>
                                                            {c.vehicleMake} {c.vehicleModel}
                                                        </Text>
                                                        <TouchableOpacity onPress={() => deleteCar(c)} style={styles.deleteButton}>
                                                            <MaterialIcons name="delete-outline" size={20} color={colors.RED} />
                                                        </TouchableOpacity>
                                                    </View>
                                                    
                                                    {c.vehicleNumber && (
                                                        <Text style={[styles.carSubtitle, { color: mode === 'dark' ? colors.SHADOW : colors.GREY }]}>
                                                            {c.vehicleNumber}
                                                        </Text>
                                                    )}
                                                    
                                                    {c.carType && (
                                                        <View style={styles.carTypeContainer}>
                                                            <Text style={[styles.carTypeText, { color: mode === 'dark' ? colors.WHITE : colors.BLACK }]}>
                                                                {t(getLangKey(c.carType))}
                                                            </Text>
                                                        </View>
                                                    )}
                                                </View>
                                            </View>
                                            
                                            <View style={styles.cardFooter}>
                                                <View style={styles.statusContainer}>
                                                    <View style={[styles.statusChip, { backgroundColor: c.approved ? colors.GREEN + '20' : colors.RED + '20' }]}>
                                                        <Ionicons 
                                                            name={c.approved ? "checkmark-circle" : "time-outline"} 
                                                            size={14} 
                                                            color={c.approved ? colors.GREEN : colors.RED} 
                                                        />
                                                        <Text style={[styles.statusText, { color: c.approved ? colors.GREEN : colors.RED }]}>
                                                            {c.approved ? t('approved') : t('pending')}
                                                        </Text>
                                                    </View>
                                                </View>
                                                
                                                <View style={styles.toggleContainer}>
                                                    <Text style={[styles.toggleLabel, { color: mode === 'dark' ? colors.WHITE : colors.BLACK }]}>
                                                        {t('assigned')}
                                                    </Text>
                                                    <Switch
                                                        value={c.active}
                                                        onValueChange={() => toggleCarActive(c)}
                                                        trackColor={{ false: colors.SHADOW, true: colors.GREEN + '40' }}
                                                        thumbColor={c.active ? colors.GREEN : colors.WHITE}
                                                        disabled={!c.approved}
                                                        style={styles.switch}
                                                    />
                                                </View>
                                            </View>
                                        </View>
                                    </TouchableWithoutFeedback>
                                    
                                    {c.other_info && (
                                        <View style={styles.additionalInfo}>
                                            <Text style={[styles.additionalInfoText, { color: mode === 'dark' ? colors.SHADOW : colors.GREY }]}>
                                                {t('info')}: {c.other_info}
                                            </Text>
                                        </View>
                                    )}
                                </View>


                            );
                        })
                    :
                    <View style={{flex: 1, justifyContent:'center', alignItems:'center', height: height/2, padding: 10}}>
                        <Text style={{fontSize: 23, fontFamily:fonts.Bold, color: mode === 'dark' ? colors.WHITE : colors.BLACK}}>{t('car_add')}</Text>
                    </View>
                    }
                </ScrollView>
            </View>
            <TouchableOpacity
                style={styles.floatingButton}
                onPress={() => props.navigation.navigate('CarEdit')}
            >
                <MaterialIcons name="add" size={24} color={colors.WHITE} />
                <Text style={styles.floatingButtonText}>{t('add_car')}</Text>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    headerTitleStyle: {
        color: colors.WHITE,
        fontFamily:fonts.Bold,
        fontSize: 20,
        marginEnd: '10%'
    },
    modernCard: {
        borderRadius: 16,
        marginBottom: 16,
        marginHorizontal: 8,
        overflow: 'hidden',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    modernCardLight: {
        backgroundColor: colors.WHITE,
    },
    modernCardDark: {
        backgroundColor: colors.PAGEBACK,
    },
    cardContent: {
        padding: 12,
    },
    cardHeader: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    carImageContainer: {
        position: 'relative',
        marginRight: 12,
    },
    carImage: {
        width: 100,
        height: 80,
        borderRadius: 12,
    },
    activeBadge: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: colors.GREEN,
        borderRadius: 12,
        padding: 2,
    },
    carInfo: {
        flex: 1,
        justifyContent: 'space-between',
    },
    carTitleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 4,
    },
    carTitle: {
        fontSize: 18,
        fontFamily: fonts.Bold,
        flex: 1,
        marginRight: 8,
    },
    carSubtitle: {
        fontSize: 14,
        fontFamily: fonts.Regular,
        marginBottom: 8,
    },
    carTypeContainer: {
        backgroundColor: MAIN_COLOR + '20',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    carTypeText: {
        fontSize: 12,
        fontFamily: fonts.Bold,
    },
    deleteButton: {
        padding: 4,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: colors.SHADOW + '20',
    },
    statusContainer: {
        flex: 1,
    },
    statusChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        alignSelf: 'flex-start',
    },
    statusText: {
        fontSize: 12,
        fontFamily: fonts.Bold,
        marginLeft: 4,
    },
    toggleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    toggleLabel: {
        fontSize: 14,
        fontFamily: fonts.Regular,
        marginRight: 8,
    },
    switch: {
        transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
    },
    additionalInfo: {
        paddingHorizontal: 16,
        paddingBottom: 12,
        borderTopWidth: 1,
        borderTopColor: colors.SHADOW + '20',
    },
    additionalInfoText: {
        fontSize: 12,
        fontFamily: fonts.Regular,
        fontStyle: 'italic',
    },
    card: {
        backgroundColor: colors.WHITE,
        marginVertical: 8,
        borderRadius: 12,
        padding: 16,
        shadowColor: colors.BLACK,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        gap: 12
    },
    shadowBack: {
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.29,
        shadowRadius: 4.65,
        elevation: 7,
    },
    shadowBackDark: {
        backgroundColor: colors.GREY,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.29,
        shadowRadius: 4.65,
        elevation: 7,
    },
    text: {
        color: colors.BLACK,
        fontSize: 16,
        fontFamily:fonts.Medium
    },
    textDark: {
        color: colors.WHITE,
        fontSize: 16, 
        //marginHorizontal: 15,
        fontFamily:fonts.Medium
    },
    textInfo: {
        color: colors.BLACK,
        fontSize: 16, 
        marginHorizontal: 15,
        fontFamily:fonts.Regular
    },
    textInfoDark: {
        color: colors.WHITE,
        fontSize: 16, 
        marginHorizontal: 15,
        fontFamily:fonts.Regular
    },
    statusBox: {
        //height: 42,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
        padding: 10
    },
    statusBoxText:{
        color: colors.HEADER,
        fontSize: 18,
        fontFamily:fonts.Regular,
        fontWeight: '800'
    },
    hbox2: {
        width: 1
    },
    textStyle: {
        fontSize: 15,
        fontFamily: fonts.Regular
    },
    textStyleBold: {
        fontSize: 15,
        fontFamily: fonts.Bold
    },
    addButton: {
        width: '100%',
        backgroundColor: '#1369B4',
        borderRadius: 10,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 4
    },
    addButtonText: {
        color: colors.WHITE,
        fontSize: 16,
        fontFamily: fonts.Bold
    },
    floatingButton: {
        position: 'absolute',
        bottom: 30,
        left: 16,
        right: 16,
        backgroundColor: '#1369B4',
        borderRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 24,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: colors.BLACK,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
        flexDirection: 'row',
        gap: 10
    },
    floatingButtonText: {
        color: colors.WHITE,
        fontSize: 16,
        fontFamily: fonts.Bold
    },
})