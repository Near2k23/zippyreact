export const RIDE_SERVICE_TYPE = 'RIDE';
export const ERRAND_SERVICE_TYPE = 'ERRAND';

export const ERRAND_PHASES = {
  TO_STORE: 'TO_STORE',
  SEARCHING: 'SEARCHING',
  AWAITING_PRICE_APPROVAL: 'AWAITING_PRICE_APPROVAL',
  ITEM_CONFIRMED: 'ITEM_CONFIRMED',
  DELIVERING: 'DELIVERING',
};

export const ERRAND_ILLEGAL_NOTICE = 'No se aceptan articulos ilegales como drogas, armas o productos restringidos.';

const toNumber = (value, fallback = 0) => {
  const parsed = parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toNullableNumber = (value) => {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const parsed = parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export const getServiceType = (booking = {}) =>
  booking.serviceType === ERRAND_SERVICE_TYPE ? ERRAND_SERVICE_TYPE : RIDE_SERVICE_TYPE;

export const isErrandBooking = (booking = {}) => getServiceType(booking) === ERRAND_SERVICE_TYPE;

export const getErrandSearchCost = (settings = {}) => toNumber(settings.errandSearchCost, 0);

export const getErrandPaymentThreshold = (settings = {}) =>
  toNumber(settings.errandOnlinePaymentThreshold, 0);

export const getErrandItemValue = (errand = {}) => {
  if (errand.itemAlreadyPaid) {
    return 0;
  }
  const approved = toNullableNumber(errand.approvedItemValue);
  if (approved !== null) {
    return approved;
  }
  return toNumber(errand.declaredItemValue, 0);
};

export const shouldApplyErrandSearchCost = (errand = {}) => !!errand.requiresSearch;

export const shouldForceErrandOnlinePayment = (errand = {}, settings = {}) => {
  if (errand.itemAlreadyPaid) {
    return false;
  }
  return getErrandItemValue(errand) > getErrandPaymentThreshold(settings);
};

export const canAcceptCashForErrand = (errand = {}, settings = {}) =>
  !shouldForceErrandOnlinePayment(errand, settings);

export const normalizeErrandData = (errand = {}, settings = {}) => {
  const base = {
    requestText: '',
    illegalGoodsAccepted: false,
    illegalNotice: ERRAND_ILLEGAL_NOTICE,
    itemAlreadyPaid: true,
    declaredItemValue: 0,
    approvedItemValue: null,
    requiresSearch: false,
    searchArea: null,
    searchCostApplied: false,
    searchCostAmount: 0,
    phase: ERRAND_PHASES.TO_STORE,
    activePriceChangeRequest: null,
    priceChangeHistory: [],
    itemValuePaidOnline: 0,
    pendingOnlinePayment: 0,
    requiresAdditionalPayment: false,
    pendingWalletRefund: 0,
    cashItemCollectionAmount: 0,
    customerTotalEstimate: 0,
  };

  const merged = {
    ...base,
    ...errand,
  };

  merged.declaredItemValue = toNumber(merged.declaredItemValue, 0);
  merged.approvedItemValue = toNullableNumber(merged.approvedItemValue);
  merged.searchCostAmount = shouldApplyErrandSearchCost(merged)
    ? toNumber(merged.searchCostAmount, getErrandSearchCost(settings))
    : 0;
  merged.searchCostApplied = shouldApplyErrandSearchCost(merged) && merged.searchCostAmount > 0;
  merged.itemValuePaidOnline = toNumber(merged.itemValuePaidOnline, 0);
  merged.pendingOnlinePayment = toNumber(merged.pendingOnlinePayment, 0);
  merged.pendingWalletRefund = toNumber(merged.pendingWalletRefund, 0);
  merged.cashItemCollectionAmount = toNumber(merged.cashItemCollectionAmount, 0);
  merged.priceChangeHistory = Array.isArray(merged.priceChangeHistory) ? merged.priceChangeHistory : [];
  merged.searchArea = merged.searchArea && merged.searchArea.lat !== undefined ? merged.searchArea : null;
  merged.customerTotalEstimate = toNumber(merged.customerTotalEstimate, 0);

  return merged;
};

export const buildErrandDataForBooking = (errand = {}, settings = {}, paymentMode = 'cash', serviceAmount = 0) => {
  const normalized = normalizeErrandData(errand, settings);
  const itemValue = getErrandItemValue(normalized);
  const shouldPayOnline = paymentMode !== 'cash' && !normalized.itemAlreadyPaid;
  const itemValuePaidOnline = shouldPayOnline
    ? toNumber(normalized.itemValuePaidOnline || itemValue, itemValue)
    : 0;

  return {
    ...normalized,
    itemValuePaidOnline,
    pendingOnlinePayment: 0,
    requiresAdditionalPayment: false,
    pendingWalletRefund: 0,
    cashItemCollectionAmount:
      paymentMode === 'cash' && !normalized.itemAlreadyPaid ? itemValue : 0,
    customerTotalEstimate: parseFloat((toNumber(serviceAmount) + itemValue).toFixed(2)),
  };
};

export const getErrandPaymentSummary = (bookingLike = {}, settings = {}) => {
  const serviceAmount = toNumber(
    bookingLike.trip_cost ??
      bookingLike.estimateFare ??
      bookingLike.estimate?.estimateFare ??
      bookingLike.estimate?.grandTotal,
    0
  );

  const errand = normalizeErrandData(bookingLike.errand, settings);
  const itemValue = getErrandItemValue(errand);
  const itemValuePaidOnline = toNumber(errand.itemValuePaidOnline, 0);
  const pendingOnlinePayment = toNumber(errand.pendingOnlinePayment, 0);
  const cashItemCollectionAmount =
    bookingLike.payment_mode === 'cash' && !errand.itemAlreadyPaid ? itemValue : 0;

  return {
    serviceAmount,
    searchCostAmount: errand.searchCostApplied ? errand.searchCostAmount : 0,
    itemValue,
    itemValuePaidOnline,
    pendingOnlinePayment,
    cashItemCollectionAmount,
    customerTotal: parseFloat((serviceAmount + itemValue).toFixed(2)),
    upfrontOnlineAmount: parseFloat((serviceAmount + itemValuePaidOnline).toFixed(2)),
    pendingWalletRefund: toNumber(errand.pendingWalletRefund, 0),
  };
};

export const appendErrandPriceHistory = (history = [], request = {}, status = 'PENDING', actor = '') => {
  const safeHistory = Array.isArray(history) ? history : [];
  return [
    ...safeHistory,
    {
      ...request,
      status,
      actedBy: actor || request.requestedBy || '',
      actedAt: Date.now(),
    },
  ];
};
