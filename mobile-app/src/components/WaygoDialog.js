import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, useColorScheme } from 'react-native';
import { Icon } from 'react-native-elements';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../common/theme';
import { fonts } from '../common/font';
import { MAIN_COLOR, MAIN_COLOR_DARK } from '../common/sharedFunctions';
import { useSelector } from 'react-redux';
import i18n from 'i18n-js';

export default function WaygoDialog({
    visible,
    onClose,
    title,
    message,
    icon,
    iconColor,
    showButtons = false,
    onConfirm,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    type = 'info',
    showIcon = true,
    customContent = null
}) {
    const isRTL = i18n.locale.indexOf('he') === 0 || i18n.locale.indexOf('ar') === 0;
    const auth = useSelector((state) => state.auth);
    let colorScheme = useColorScheme();
    const getMode = () => {
        if (auth?.profile?.mode) {
            if (auth.profile.mode === 'system') {
                return colorScheme;
            } else {
                return auth.profile.mode;
            }
        } else {
            return 'light';
        }
    };
    
    const mode = getMode();

    const getIconProps = () => {
        if (icon && iconColor) {
            return { name: icon, color: iconColor };
        }
        
        switch (type) {
            case 'warning':
                return { name: 'warning-outline', color: colors.ORANGE };
            case 'confirm':
                return { name: 'help-circle-outline', color: mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR };
            default:
                return { name: 'information-circle-outline', color: mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR };
        }
    };

    const iconProps = getIconProps();

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <TouchableOpacity 
                style={styles.modalOverlay}
                activeOpacity={1}
                onPress={onClose}
            >
                <TouchableOpacity 
                    style={[styles.modalContent, { 
                        backgroundColor: mode === 'dark' ? '#272A2C' : colors.WHITE 
                    }]}
                    activeOpacity={1}
                    onPress={() => {}}
                >
                    <View style={styles.handleBar} />
                    
                    <View style={styles.modalBody}>
                        <View style={[styles.modalHeader, { 
                            flexDirection: isRTL ? 'row-reverse' : 'row' 
                        }]}>
                            {showIcon && (
                                <View style={styles.iconContainer}>
                                    <Ionicons 
                                        name={iconProps.name} 
                                        size={24} 
                                        color={iconProps.color} 
                                    />
                                </View>
                            )}
                            <Text style={[styles.modalTitle, { 
                                color: mode === 'dark' ? colors.WHITE : colors.BLACK,
                                textAlign: showIcon ? (isRTL ? 'right' : 'left') : 'center',
                                marginLeft: showIcon ? (isRTL ? 0 : 16) : 0,
                                marginRight: showIcon ? (isRTL ? 16 : 0) : 0,
                                flex: 1,
                            }]}>
                                {title}
                            </Text>
                        </View>
                        
                        {customContent ? (
                            customContent
                        ) : (
                            <Text style={[styles.modalMessage, { 
                                color: mode === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)',
                                textAlign: isRTL ? 'right' : 'left'
                            }]}>
                                {message}
                            </Text>
                        )}
                        
                        {showButtons && (
                            <View style={[styles.buttonContainer, { 
                                flexDirection: isRTL ? 'row-reverse' : 'row' 
                            }]}>
                                <TouchableOpacity 
                                    style={[styles.button, styles.cancelButton, {
                                        backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : '#E2E9EC'
                                    }]}
                                    onPress={onClose}
                                >
                                    <Text style={[styles.buttonText, { 
                                        color: mode === 'dark' ? colors.WHITE : colors.BLACK 
                                    }]}>
                                        {cancelText}
                                    </Text>
                                </TouchableOpacity>
                                
                                <TouchableOpacity 
                                    style={[styles.button, styles.confirmButton, {
                                        backgroundColor: type === 'warning' ? colors.RED : 
                                                       (mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR)
                                    }]}
                                    onPress={onConfirm}
                                >
                                    <Text style={[styles.buttonText, { 
                                        color: colors.WHITE 
                                    }]}>
                                        {confirmText}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    modalContent: {
        width: '100%',
        maxWidth: 400,
        borderRadius: 20,
        shadowColor: colors.BLACK,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 16,
    },
    handleBar: {
        width: 80,
        height: 4,
        backgroundColor: 'rgba(128, 128, 128, 0.3)',
        borderRadius: 2,
        alignSelf: 'center',
        marginTop: 14,
        marginBottom: 18,
    },
    modalHeader: {
        alignItems: 'center',
        marginBottom: 16,
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
    modalBody: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    modalMessage: {
        fontSize: 14,
        fontFamily: fonts.Regular,
        lineHeight: 20,
        marginBottom: 20,
        marginTop: 6,
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
    cancelButton: {
        // Sin borde para el botón de cancelar
    },
    confirmButton: {
        // Sin borde para el botón principal
    },
    buttonText: {
        fontSize: 14,
        fontFamily: fonts.Medium,
        lineHeight: 18,
    },
});

