import React, { useMemo, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Icon } from 'react-native-elements';
import { colors } from '../common/theme';
import { fonts } from '../common/font';

const { width } = Dimensions.get('window');
const DEFAULT_COLOR = '#F97316';

const isValidHexColor = (value) => /^#(?:[0-9A-Fa-f]{3}){1,2}$/.test((value || '').trim());

const getReadableTextColor = (backgroundColor) => {
  const hex = (backgroundColor || DEFAULT_COLOR).replace('#', '');
  const normalized = hex.length === 3 ? hex.split('').map((char) => char + char).join('') : hex;
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  const luminance = (0.299 * r) + (0.587 * g) + (0.114 * b);
  return luminance > 186 ? '#111111' : '#FFFFFF';
};

const getSortedBanners = (items = []) => {
  return [...items].sort((a, b) => {
    const orderDiff = (parseInt(a.sortOrder, 10) || 0) - (parseInt(b.sortOrder, 10) || 0);
    if (orderDiff !== 0) {
      return orderDiff;
    }
    return (parseInt(b.createdAt, 10) || 0) - (parseInt(a.createdAt, 10) || 0);
  });
};

export default function AppBannerCarousel({
  banners,
  onDismiss,
  showDismissButton = false,
  containerStyle,
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef(null);
  const cardWidth = width - 56;

  const sortedBanners = useMemo(() => getSortedBanners(banners || []), [banners]);

  const handleOpenUrl = async (url) => {
    const normalizedUrl = String(url || '').trim();
    if (!normalizedUrl) {
      return;
    }
    try {
      const supported = await Linking.canOpenURL(normalizedUrl);
      if (!supported) {
        Alert.alert('Enlace no disponible', 'No pudimos abrir este enlace.');
        return;
      }
      await Linking.openURL(normalizedUrl);
    } catch (error) {
      Alert.alert('Enlace no disponible', 'No pudimos abrir este enlace.');
    }
  };

  if (!sortedBanners.length) {
    return null;
  }

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {showDismissButton ? (
        <View style={styles.dismissRow}>
          <TouchableOpacity onPress={onDismiss} style={styles.dismissButton}>
            <Icon name="close-outline" type="ionicon" size={20} color={colors.SHADOW} />
          </TouchableOpacity>
        </View>
      ) : null}

      <FlatList
        ref={listRef}
        data={sortedBanners}
        horizontal
        keyExtractor={(item, index) => item.id || `${item.app || 'banner'}-${index}`}
        showsHorizontalScrollIndicator={false}
        snapToInterval={cardWidth + 14}
        snapToAlignment="start"
        decelerationRate="fast"
        contentContainerStyle={styles.listContent}
        onMomentumScrollEnd={(event) => {
          const nextIndex = Math.round(event.nativeEvent.contentOffset.x / (cardWidth + 14));
          setActiveIndex(nextIndex);
        }}
        renderItem={({ item }) => {
          const backgroundColor = isValidHexColor(item.backgroundColor) ? item.backgroundColor : DEFAULT_COLOR;
          const textColor = getReadableTextColor(backgroundColor);
          const url = String(item.url || '').trim();

          return (
            <View style={[styles.card, { width: cardWidth, backgroundColor }]}>
              <View style={[styles.backgroundBubblePrimary, { backgroundColor: `${textColor}12` }]} />
              <View style={[styles.backgroundBubbleSecondary, { backgroundColor: `${textColor}10` }]} />

              <View style={styles.cardContent}>
                <View style={styles.textColumn}>
                  <Text style={[styles.title, { color: textColor }]} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <Text style={[styles.description, { color: `${textColor}E0` }]} numberOfLines={3}>
                    {item.description}
                  </Text>

                  {url ? (
                    <TouchableOpacity
                      style={[styles.ctaButton, { backgroundColor: `${textColor}1A`, borderColor: `${textColor}28` }]}
                      onPress={() => handleOpenUrl(url)}
                    >
                      <Text style={[styles.ctaText, { color: textColor }]}>Abrir</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>

                <View style={[styles.iconContainer, { backgroundColor: `${textColor}12`, borderColor: `${textColor}22` }]}>
                  <Icon name={item.icon || 'megaphone-outline'} type="ionicon" size={34} color={textColor} />
                </View>
              </View>
            </View>
          );
        }}
      />

      {sortedBanners.length > 1 ? (
        <View style={styles.indicatorRow}>
          {sortedBanners.map((item, index) => (
            <View
              key={item.id || `indicator-${index}`}
              style={[
                styles.indicator,
                {
                  width: activeIndex === index ? 18 : 7,
                  backgroundColor: activeIndex === index ? DEFAULT_COLOR : `${colors.SHADOW}66`
                }
              ]}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  dismissRow: {
    width: '100%',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  dismissButton: {
    width: 34,
    height: 34,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.WHITE,
    borderWidth: 1,
    borderColor: `${colors.SHADOW}33`,
  },
  listContent: {
    paddingHorizontal: 2,
  },
  card: {
    marginRight: 14,
    minHeight: 168,
    borderRadius: 28,
    padding: 18,
    overflow: 'hidden',
  },
  backgroundBubblePrimary: {
    position: 'absolute',
    top: -18,
    right: -8,
    width: 120,
    height: 120,
    borderRadius: 999,
  },
  backgroundBubbleSecondary: {
    position: 'absolute',
    bottom: -26,
    left: -16,
    width: 90,
    height: 90,
    borderRadius: 999,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    alignItems: 'flex-start',
  },
  textColumn: {
    flex: 1,
    minHeight: 132,
    justifyContent: 'space-between',
  },
  title: {
    fontFamily: fonts.Bold,
    fontSize: 19,
    marginBottom: 8,
  },
  description: {
    fontFamily: fonts.Regular,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 14,
  },
  ctaButton: {
    alignSelf: 'flex-start',
    minWidth: 88,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
  },
  ctaText: {
    fontFamily: fonts.Bold,
    fontSize: 14,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  indicatorRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    gap: 6,
  },
  indicator: {
    height: 7,
    borderRadius: 999,
  },
});
