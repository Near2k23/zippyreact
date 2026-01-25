export const getCarTypeWithZonePrices = (carType, zoneId) => {
    if (!carType || !zoneId) return carType;
    
    const zonePrices = carType.zonePrices?.[zoneId];
    if (!zonePrices) return carType;
    
    return {
        ...carType,
        base_fare: zonePrices.base_fare !== undefined ? zonePrices.base_fare : carType.base_fare,
        rate_per_unit_distance: zonePrices.rate_per_unit_distance !== undefined ? zonePrices.rate_per_unit_distance : carType.rate_per_unit_distance,
        rate_per_hour: zonePrices.rate_per_hour !== undefined ? zonePrices.rate_per_hour : carType.rate_per_hour,
        min_fare: zonePrices.min_fare !== undefined ? zonePrices.min_fare : carType.min_fare,
        convenience_fees: zonePrices.convenience_fees !== undefined ? zonePrices.convenience_fees : carType.convenience_fees,
        convenience_fee_type: zonePrices.convenience_fee_type || carType.convenience_fee_type || 'flat',
        fleet_admin_fee: zonePrices.fleet_admin_fee !== undefined ? zonePrices.fleet_admin_fee : carType.fleet_admin_fee,
    };
};

export const getFilteredCarTypesByZone = (cars, zoneId) => {
    if (!cars || cars.length === 0) return [];
    
    if (!zoneId) return cars;
    
    return cars.filter(car => {
        return car.zones && Array.isArray(car.zones) && car.zones.includes(zoneId);
    });
};

export const getFilteredCarTypesWithZonePrices = (cars, zoneId) => {
    if (!cars || cars.length === 0) return [];
    
    let filteredCars = cars;
    
    if (zoneId) {
        filteredCars = cars.filter(car => {
            return car.zones && Array.isArray(car.zones) && car.zones.includes(zoneId);
        });
    }
    
    const sorted = filteredCars.sort((a, b) => (a.pos || 0) - (b.pos || 0));
    
    return sorted.map(car => {
        if (zoneId && car.zonePrices?.[zoneId]) {
            return getCarTypeWithZonePrices(car, zoneId);
        }
        return car;
    });
};

