export interface PincodeInfo {
    state: string;
    city: string;
}

export async function lookupPincode(pincode: string): Promise<PincodeInfo | null> {
    if (!pincode || pincode.length !== 6) return null;

    try {
        const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
        const data = await response.json();

        if (data && data[0] && data[0].Status === 'Success') {
            const postOffice = data[0].PostOffice[0];
            return {
                state: postOffice.State,
                city: postOffice.District, // Using District as city for general lookup
            };
        }
    } catch (error) {
        console.error('Error looking up pincode:', error);
    }

    return null;
}
