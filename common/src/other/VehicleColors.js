export const VEHICLE_COLORS = [
    { key: 'white', labelKey: 'color_white', hex: '#FFFFFF' },
    { key: 'pearl_white', labelKey: 'color_pearl_white', hex: '#F5F5F0' },
    { key: 'ivory', labelKey: 'color_ivory', hex: '#FFFFF0' },
    { key: 'cream', labelKey: 'color_cream', hex: '#FFFDD0' },
    { key: 'beige', labelKey: 'color_beige', hex: '#C8AD7F' },
    { key: 'champagne', labelKey: 'color_champagne', hex: '#F7E7CE' },
    { key: 'gold', labelKey: 'color_gold', hex: '#CFB53B' },
    { key: 'yellow', labelKey: 'color_yellow', hex: '#FFD700' },
    { key: 'orange', labelKey: 'color_orange', hex: '#FF8C00' },
    { key: 'red', labelKey: 'color_red', hex: '#CC0000' },
    { key: 'burgundy', labelKey: 'color_burgundy', hex: '#800020' },
    { key: 'pink', labelKey: 'color_pink', hex: '#FF69B4' },
    { key: 'purple', labelKey: 'color_purple', hex: '#6A0DAD' },
    { key: 'light_blue', labelKey: 'color_light_blue', hex: '#87CEEB' },
    { key: 'blue', labelKey: 'color_blue', hex: '#0047AB' },
    { key: 'dark_blue', labelKey: 'color_dark_blue', hex: '#00008B' },
    { key: 'turquoise', labelKey: 'color_turquoise', hex: '#30D5C8' },
    { key: 'green', labelKey: 'color_green', hex: '#228B22' },
    { key: 'dark_green', labelKey: 'color_dark_green', hex: '#013220' },
    { key: 'brown', labelKey: 'color_brown', hex: '#5C4033' },
    { key: 'copper', labelKey: 'color_copper', hex: '#B87333' },
    { key: 'bronze', labelKey: 'color_bronze', hex: '#CD7F32' },
    { key: 'silver', labelKey: 'color_silver', hex: '#C0C0C0' },
    { key: 'gray', labelKey: 'color_gray', hex: '#808080' },
    { key: 'charcoal', labelKey: 'color_charcoal', hex: '#36454F' },
    { key: 'black', labelKey: 'color_black', hex: '#000000' },
];

export const getVehicleColorByKey = (colorKey) => {
    if (!colorKey) return null;
    return VEHICLE_COLORS.find((c) => c.key === colorKey) || null;
};
