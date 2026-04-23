import { getErrandSearchCost, shouldApplyErrandSearchCost } from "./ErrandUtils";

export const FareCalculator = (distance,time,rateDetails,instructionData, decimal, dynamicRule, settings = {})=>{  

    let baseCalculated =  (parseFloat(rateDetails.rate_per_unit_distance) * parseFloat(distance)) + (parseFloat(rateDetails.rate_per_hour) * (parseFloat(time) / 3600));
    if(rateDetails.base_fare>0){
        baseCalculated = baseCalculated + rateDetails.base_fare;
    }
    if(instructionData && instructionData.parcelTypeSelected){
        baseCalculated = baseCalculated + instructionData.parcelTypeSelected.amount;
    }
    if(instructionData && instructionData.optionSelected){
        baseCalculated = baseCalculated + instructionData.optionSelected.amount;
    }
    if(instructionData && instructionData.errand && shouldApplyErrandSearchCost(instructionData.errand)){
        const errandSearchCost = instructionData.errand.searchCostAmount || getErrandSearchCost(settings);
        baseCalculated = baseCalculated + parseFloat(errandSearchCost || 0);
    }
    let total = baseCalculated > parseFloat(rateDetails.min_fare) ? baseCalculated : parseFloat(rateDetails.min_fare);

    let dynamicFee = 0;
    if(dynamicRule && dynamicRule.active){
        if(dynamicRule.multiplier_type === 'flat'){
            dynamicFee = parseFloat(dynamicRule.multiplier_value || 0);
        } else {
            dynamicFee = total * (parseFloat(dynamicRule.multiplier_value || 0) / 100);
        }
        total = total + dynamicFee;
    }
    let convenienceFee = 0;
    if(rateDetails.convenience_fee_type && rateDetails.convenience_fee_type == 'flat'){
        convenienceFee = rateDetails.convenience_fees;
    }else{
        convenienceFee = (total*parseFloat(rateDetails.convenience_fees)/100);
    }
    let grand = total + convenienceFee;

    return {
        totalCost:parseFloat(total.toFixed(decimal)),
        grandTotal:parseFloat(grand.toFixed(decimal)),
        convenience_fees:parseFloat(convenienceFee.toFixed(decimal))
        ,dynamic_fee:parseFloat(dynamicFee.toFixed(decimal))
    }
     
}
