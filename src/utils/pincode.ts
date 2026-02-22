export interface PostOfficeBranch {
    name: string;
    branchType: string;
    deliveryStatus: string;
    circle: string;
    district: string;
    division: string;
    region: string;
    state: string;
    country: string;
}

export interface PincodeInfo {
    state: string;
    city: string;
    country: string;
    branches: PostOfficeBranch[];
}

export async function lookupPincode(pincode: string): Promise<PincodeInfo | null> {
    if (!pincode || pincode.length !== 6) return null;

    try {
        const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
        const data = await response.json();

        if (data && data[0] && data[0].Status === 'Success') {
            const postOffices = data[0].PostOffice;
            const firstOffice = postOffices[0];

            return {
                state: firstOffice.State,
                city: firstOffice.District,
                country: firstOffice.Country || 'India',
                branches: postOffices.map((po: any) => ({
                    name: po.Name,
                    branchType: po.BranchType,
                    deliveryStatus: po.DeliveryStatus,
                    circle: po.Circle,
                    district: po.District,
                    division: po.Division,
                    region: po.Region,
                    state: po.State,
                    country: po.Country,
                })),
            };
        }
    } catch (error) {
        console.error('Error looking up pincode:', error);
    }

    return null;
}
