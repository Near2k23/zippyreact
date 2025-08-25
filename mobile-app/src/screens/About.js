import React, { useState, useEffect} from 'react';
import { colors } from '../common/theme';
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    Dimensions,
    useColorScheme,
    TouchableOpacity,
    Linking
} from 'react-native';
import i18n from 'i18n-js';
import { useSelector } from "react-redux";
import { MaterialIcons, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { fonts } from '../common/font';
var { width} = Dimensions.get('window');

export default function AboutPage(props) {

    const { t } = i18n;
    const isRTL = i18n.locale.indexOf('he') === 0 || i18n.locale.indexOf('ar') === 0;
    const settings = useSelector(state => state.settingsdata.settings);
    const auth = useSelector((state) => state.auth);
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

    const handlePhonePress = () => {
        if (settings.CompanyPhone) {
            Linking.openURL(`tel:${settings.CompanyPhone}`);
        }
    };

    const handleEmailPress = () => {
        if (settings.contact_email) {
            Linking.openURL(`mailto:${settings.contact_email}`);
        }
    };

    const handleWebsitePress = () => {
        if (settings.CompanyWebsite) {
            Linking.openURL(settings.CompanyWebsite);
        }
    };

    return (
        <View style={[styles.mainView, {backgroundColor: mode === 'dark' ? colors.PAGEBACK : colors.WHITE}]}>
            <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollContainer}>
                <View style={styles.contentSection}>
                    <Text style={[styles.description, {color: mode === 'dark' ? colors.WHITE : colors.BLACK, textAlign: isRTL ? 'right' : 'left'}]}>
                        {t('about_us_content1')}
                    </Text>
                    
                    <Text style={[styles.description, {color: mode === 'dark' ? colors.WHITE : colors.BLACK, textAlign: isRTL ? 'right' : 'left'}]}>
                        {t('about_us_content2')}
                    </Text>
                </View>

                {settings && (settings.CompanyPhone || settings.contact_email || settings.CompanyWebsite) ?
                <View style={styles.contactSection}>
                    {settings.CompanyPhone ?
                        <TouchableOpacity onPress={handlePhonePress} style={[styles.contactBox, {backgroundColor: mode === 'dark' ? colors.PAGEBACK : colors.WHITE}]}>
                            <Ionicons name="call" size={18} color={colors.HEADER} />
                            <Text style={[styles.contactText, {color: mode === 'dark' ? colors.WHITE : colors.BLACK}]}>
                                {settings.CompanyPhone}
                            </Text>
                        </TouchableOpacity>
                    : null }
                    
                    {settings.contact_email ?
                        <TouchableOpacity onPress={handleEmailPress} style={[styles.contactBox, {backgroundColor: mode === 'dark' ? colors.PAGEBACK : colors.WHITE}]}>
                            <MaterialIcons name="email" size={18} color={colors.HEADER} />
                            <Text style={[styles.contactText, {color: mode === 'dark' ? colors.WHITE : colors.BLACK}]}>
                                {settings.contact_email}
                            </Text>
                        </TouchableOpacity>
                    : null }
                    
                    {settings.CompanyWebsite ?
                        <TouchableOpacity onPress={handleWebsitePress} style={[styles.contactBox, {backgroundColor: mode === 'dark' ? colors.PAGEBACK : colors.WHITE}]}>
                            <MaterialCommunityIcons name="web" size={18} color={colors.HEADER} />
                            <Text style={[styles.contactText, {color: mode === 'dark' ? colors.WHITE : colors.BLACK}]}>
                                {settings.CompanyWebsite}
                            </Text>
                        </TouchableOpacity>
                    : null }
                </View>
                : null }
            </ScrollView>
        </View>
    );
}


const styles = StyleSheet.create({
    mainView: {
        flex: 1
    },
    scrollContainer: {
        flex: 1,
        paddingHorizontal: 15,
    },
    contentSection: {
        marginBottom: 20,
        marginTop: 15
    },
    description: {
        fontSize: 14,
        fontFamily: fonts.Regular,
        lineHeight: 20,
        marginBottom: 10
    },
    contactSection: {
        marginBottom: 20
    },
    contactBox: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: colors.HEADER + '30',
        borderRadius: 6
    },
    contactText: {
        fontSize: 14,
        fontFamily: fonts.Regular,
        marginLeft: 10,
        flex: 1
    }
})