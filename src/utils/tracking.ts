export const getTrackingUrl = (carrier: string, trackingId: string): string => {
    const c = carrier.toLowerCase();
    const id = trackingId.trim();

    switch (c) {
        case 'delhivery':
            return `https://www.delhivery.com/track/package/${id}`;
        case 'bluedart':
            // BlueDart often uses a specific param or requires a search form. 
            // The trackdartresult URL is a common direct link pattern if available.
            return `https://bluedart.com/trackdartresult?trackable_link=${id}&mode=parcels`;
        case 'dtdc':
            return `https://www.dtdc.in/tracking/shipment-tracking.asp?no=${id}`;
        case 'india post':
        case 'speed post':
            // India Post is tricky for deep linking, but this is the tracking page.
            return `https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx`;
        case 'professional couriers':
        case 'tpc':
            return `http://www.tpcindia.com/track-consignment-search-details.aspx?obj=${id}`;
        case 'trackon':
            return `https://trackon.in/Tracking/Tracking?consignmentNo=${id}`;
        default:
            // Fallback to Google Search or 17Track for unknown carriers
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
    'Other'
];
