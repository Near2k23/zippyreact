const ERRAND_SERVICE_TYPE = 'ERRAND';

const toNumber = (value, fallback = 0) => {
  const parsed = parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const getErrandItemValue = (errand = {}) => {
  if (!errand || errand.itemAlreadyPaid) {
    return 0;
  }
  if (errand.approvedItemValue !== null && errand.approvedItemValue !== undefined && errand.approvedItemValue !== '') {
    return toNumber(errand.approvedItemValue, 0);
  }
  return toNumber(errand.declaredItemValue, 0);
};

const isErrandBooking = (booking = {}) => booking.serviceType === ERRAND_SERVICE_TYPE;

const getBookingUpfrontAmount = (booking = {}) => {
  if (!isErrandBooking(booking)) {
    return toNumber(booking.trip_cost, 0);
  }
  return toNumber(booking.upfrontOnlineAmount, toNumber(booking.trip_cost, 0));
};

const getErrandPendingDelta = (booking = {}) => {
  if (!isErrandBooking(booking)) {
    return 0;
  }
  return toNumber(booking && booking.errand ? booking.errand.pendingOnlinePayment : 0, 0);
};

const getErrandCancellationFee = (booking = {}, decimal = 2) => {
  if (!isErrandBooking(booking)) {
    return 0;
  }
  const phase = booking && booking.errand ? booking.errand.phase : null;
  if (phase === 'SEARCHING' || phase === 'AWAITING_PRICE_APPROVAL') {
    return parseFloat((toNumber(booking.trip_cost, 0) * 0.5).toFixed(decimal));
  }
  return 0;
};

module.exports = {
  ERRAND_SERVICE_TYPE,
  getErrandItemValue,
  getErrandPendingDelta,
  getBookingUpfrontAmount,
  getErrandCancellationFee,
  isErrandBooking,
  toNumber,
};
