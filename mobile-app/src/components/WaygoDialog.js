import React from 'react';
import {
    Dimensions,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    useColorScheme,
    View
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import i18n from 'i18n-js';
import { colors } from '../common/theme';
import { fonts } from '../common/font';
import { MAIN_COLOR, MAIN_COLOR_DARK } from '../common/sharedFunctions';

const { height } = Dimensions.get('window');

const normalizeIconName = (name) => {
    switch (name) {
        case 'check-circle':
            return 'checkmark-circle';
        case 'account-convert-outline':
            return 'swap-horizontal-outline';
        case 'account-outline':
            return 'person-outline';
        case 'message-text-outline':
            return 'chatbubble-ellipses-outline';
        case 'map-marker-outline':
            return 'location-outline';
        case 'tag-outline':
            return 'pricetag-outline';
        case 'bell-outline':
            return 'notifications-outline';
        default:
            return name;
    }
};

export default function WaygoDialog({
    visible,
    onClose,
    title,
    message,
    icon,
    iconColor,
    showButtons = false,
    singleButton = false,
    onConfirm,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    type = 'info',
    showIcon = true,
    customContent = null
}) {
    const isRTL = i18n.locale.indexOf('he') === 0 || i18n.locale.indexOf('ar') === 0;
    const auth = useSelector((state) => state.auth);
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();

    const getMode = () => {
        if (auth?.profile?.mode) {
            if (auth.profile.mode === 'system') {
                return colorScheme;
            }
            return auth.profile.mode;
        }
        return 'light';
    };

    const mode = getMode();

    const getIconProps = () => {
        if (icon && iconColor) {
            return { name: normalizeIconName(icon), color: iconColor };
        }

        switch (type) {
            case 'warning':
                return { name: 'warning-outline', color: colors.ORANGE };
            case 'confirm':
                return { name: 'help-circle-outline', color: mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR };
            case 'alert':
                return { name: 'alert-circle-outline', color: colors.RED };
            default:
                return { name: 'information-circle-outline', color: mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR };
        }
    };

    const iconProps = getIconProps();
    const handleBackdropPress = singleButton ? undefined : onClose;
    const handleRequestClose = singleButton ? () => {} : onClose;
    const sheetBottomPadding = Math.max(insets.bottom, 12);
    const hasContent = Boolean(customContent || message);
    const showHeader = Boolean(showIcon || title);

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={handleRequestClose}
            statusBarTranslucent={true}
        >
            <KeyboardAvoidingView
                style={styles.modalOverlay}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <Pressable
                    style={styles.backdrop}
                    onPress={handleBackdropPress}
                />

                <View
                    style={[
                        styles.sheet,
                        {
                            backgroundColor: mode === 'dark' ? '#272A2C' : colors.WHITE,
                            paddingBottom: sheetBottomPadding
                        }
                    ]}
                >
                    <View style={styles.handleBar} />

                    {showHeader ? (
                        <View style={styles.headerBody}>
                            <View style={[styles.modalHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                                {showIcon && (
                                    <View style={styles.iconContainer}>
                                        <Ionicons
                                            name={iconProps.name}
                                            size={24}
                                            color={iconProps.color}
                                        />
                                    </View>
                                )}
                                {title ? (
                                    <Text
                                        style={[
                                            styles.modalTitle,
                                            {
                                                color: mode === 'dark' ? colors.WHITE : colors.BLACK,
                                                textAlign: showIcon ? (isRTL ? 'right' : 'left') : 'center',
                                                marginLeft: showIcon ? (isRTL ? 0 : 16) : 0,
                                                marginRight: showIcon ? (isRTL ? 16 : 0) : 0,
                                                flex: 1,
                                            }
                                        ]}
                                    >
                                        {title}
                                    </Text>
                                ) : null}
                            </View>
                        </View>
                    ) : null}

                    {hasContent ? (
                        <ScrollView
                            style={styles.contentScroll}
                            contentContainerStyle={styles.contentBody}
                            keyboardShouldPersistTaps="handled"
                            nestedScrollEnabled={true}
                            showsVerticalScrollIndicator={false}
                        >
                            {customContent ? (
                                customContent
                            ) : (
                                <Text
                                    style={[
                                        styles.modalMessage,
                                        {
                                            color: mode === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)',
                                            textAlign: isRTL ? 'right' : 'left'
                                        }
                                    ]}
                                >
                                    {message}
                                </Text>
                            )}
                        </ScrollView>
                    ) : null}

                    {showButtons && (
                        <View style={styles.footerBody}>
                            <View style={[styles.buttonContainer, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                                {!singleButton && (
                                    <TouchableOpacity
                                        style={[
                                            styles.button,
                                            styles.cancelButton,
                                            { backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : '#E2E9EC' }
                                        ]}
                                        onPress={onClose}
                                    >
                                        <Text style={[styles.buttonText, { color: mode === 'dark' ? colors.WHITE : colors.BLACK }]}>
                                            {cancelText}
                                        </Text>
                                    </TouchableOpacity>
                                )}

                                <TouchableOpacity
                                    style={[
                                        styles.button,
                                        styles.confirmButton,
                                        singleButton && styles.buttonFullWidth,
                                        {
                                            backgroundColor: type === 'warning'
                                                ? colors.RED
                                                : (mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR)
                                        }
                                    ]}
                                    onPress={onConfirm || onClose}
                                >
                                    <Text style={[styles.buttonText, { color: colors.WHITE }]}>
                                        {confirmText}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    sheet: {
        width: '100%',
        maxHeight: height * 0.86,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        shadowColor: colors.BLACK,
        shadowOffset: {
            width: 0,
            height: -4,
        },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 16,
        overflow: 'hidden',
    },
    handleBar: {
        width: 56,
        height: 4,
        backgroundColor: 'rgba(128, 128, 128, 0.3)',
        borderRadius: 2,
        alignSelf: 'center',
        marginTop: 10,
        marginBottom: 14,
    },
    headerBody: {
        paddingHorizontal: 20,
        paddingBottom: 14,
    },
    modalHeader: {
        alignItems: 'center',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(128, 128, 128, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontFamily: fonts.Bold,
        lineHeight: 22,
    },
    contentScroll: {
        maxHeight: height * 0.56,
    },
    contentBody: {
        paddingHorizontal: 20,
        paddingBottom: 4,
    },
    modalMessage: {
        fontSize: 14,
        fontFamily: fonts.Regular,
        lineHeight: 20,
        marginTop: 6,
        marginBottom: 12,
    },
    footerBody: {
        paddingHorizontal: 20,
        paddingTop: 8,
    },
    buttonContainer: {
        gap: 10,
        marginTop: 6,
    },
    button: {
        flex: 1,
        height: 44,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButton: {},
    confirmButton: {},
    buttonFullWidth: {
        flex: 1,
        maxWidth: '100%',
    },
    buttonText: {
        fontSize: 14,
        fontFamily: fonts.Medium,
        lineHeight: 18,
    },
});
