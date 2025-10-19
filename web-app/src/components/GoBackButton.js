import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useTranslation } from 'react-i18next';
import { FONT_FAMILY } from 'common/sharedFunctions';
import { MAIN_COLOR } from 'common/sharedFunctions';

const GoBackButton = ({ isRTL, onClick, style, size = "medium" }) => {
    const { t } = useTranslation();

    return (
        <div dir={isRTL === "rtl" ? "rtl" : "ltr"} style={{ ...style }}>
            <Tooltip title={t("go_back")} arrow>
                <IconButton 
                    onClick={onClick}
                    size={size}
                    sx={{
                        color: MAIN_COLOR,
                        backgroundColor: 'rgba(0, 141, 153, 0.1)',
                        '&:hover': {
                            backgroundColor: 'rgba(0, 141, 153, 0.2)',
                            transform: 'scale(1.1)',
                        },
                        transition: 'all 0.2s ease-in-out',
                        boxShadow: '0 2px 8px rgba(0, 141, 153, 0.2)',
                    }}
                >
                    <ArrowBackIcon 
                        sx={{ 
                            fontSize: size === "large" ? 32 : size === "small" ? 20 : 24,
                            transform: isRTL === "rtl" ? "scaleX(-1)" : "none"
                        }} 
                    />
                </IconButton>
            </Tooltip>
        </div>
    );
};

export default GoBackButton;