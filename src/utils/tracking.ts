export const getTrackingUrl = (carrier: string, trackingId: string): string => {
    const c = carrier.toLowerCase();
    const id = trackingId.trim();

    if (['uber', 'ola', 'rapido', 'swiggy', 'dunzo', 'bike'].some(bike => c.includes(bike))) {
        return '#';
    }

    switch (c) {
        case 'delhivery':
            return `https://www.delhivery.com/track/package/${id}`;
        case 'bluedart':
            return `https://bluedart.com/trackdartresult?trackable_link=${id}&mode=parcels`;
        case 'dtdc':
            return `https://www.dtdc.in/tracking/shipment-tracking.asp?no=${id}`;
        case 'india post':
        case 'speed post':
            return `https://www.indiapost.gov.in/`;
        case 'professional couriers':
        case 'tpc':
            return `https://www.tpcindia.com/`;
        case 'trackon':
            return `https://trackon.in/Tracking/Tracking?consignmentNo=${id}`;
        default:
            return `https://www.google.com/search?q=${carrier}+tracking+${id}`;
    }
};

export const TRACKING_CARRIERS = [
    'Delhivery',
    'BlueDart',
    'DTDC',
    'India Post',
    'Professional Couriers',
    'Trackon',
    'Uber Parcel',
    'Ola Parcel',
    'Rapido',
    'Swiggy Genie',
    'Dunzo',
    'Other Bike Parcel',
    'Other'
];
