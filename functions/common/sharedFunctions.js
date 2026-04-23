const admin = require('firebase-admin');
const { isErrandBooking, toNumber } = require('./errand');

module.exports.UpdateBooking = (bookingData,order_id,transaction_id,gateway) => {
    admin.database().ref("settings").once("value", async settingsdata => {
        let settings = settingsdata.val();
        if (bookingData.paymentPacket && bookingData.paymentPacket.paymentType === 'ERRAND_DELTA') {
            const deltaAmount = toNumber(bookingData.paymentPacket.errandDeltaAmount || bookingData.paymentPacket.cardPaymentAmount, 0);
            const currentPaidOnline = toNumber(bookingData && bookingData.errand ? bookingData.errand.itemValuePaidOnline : 0, 0);
            const updatedErrand = Object.assign({}, bookingData.errand || {}, {
                itemValuePaidOnline: parseFloat((currentPaidOnline + deltaAmount).toFixed(settings.decimal)),
                pendingOnlinePayment: 0,
                requiresAdditionalPayment: false,
                phase: 'ITEM_CONFIRMED'
            });
            admin.database().ref('bookings').child(order_id).update({
                errand: updatedErrand,
                paymentPacket: null,
                gateway: gateway,
                transaction_id: transaction_id,
                cardPaymentAmount: parseFloat((toNumber(bookingData.cardPaymentAmount, 0) + deltaAmount).toFixed(settings.decimal)),
                customer_paid: parseFloat((toNumber(bookingData.customer_paid, 0) + deltaAmount).toFixed(settings.decimal)),
                payableAmount: 0
            });
            return;
        }
        let curChanges = {
            status: bookingData.booking_from_web && !settings.prepaid? 'COMPLETE': settings.prepaid ? 'NEW' :'PAID',
            prepaid: settings.prepaid,
            transaction_id: transaction_id,
            gateway: gateway
        }
        Object.assign(curChanges, bookingData.paymentPacket);
        if (isErrandBooking(bookingData)) {
            curChanges.upfrontOnlineAmount = bookingData.upfrontOnlineAmount ? bookingData.upfrontOnlineAmount : bookingData.trip_cost;
        }
        admin.database().ref('bookings').child(order_id).update(curChanges);
        admin.database().ref('users').child(bookingData.driver).update({queue:false});
    })
}

module.exports.addEstimate = (bookingId, driverId, distance) => {
    return true;
}
