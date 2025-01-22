const axios = require('axios');

exports.main = async (event, callback) => {
    // Apollo.io API credentials
    const apiKey = 'apollo_api'; // Replace with your actual Apollo.io API key
    const companyDomain = event.fields.domain;

    if (!companyDomain) {
        console.error('Error: company_domain is missing.');
        callback({
            outputFields: {
                status: false,
                error: 'Missing company domain.',
            },
        });
        return;
    }

    try {
        // Set up the request options
        const options = {
            method: 'GET',
            url: `https://api.apollo.io/api/v1/organizations/enrich`,
            headers: {
                'Content-Type': 'application/json',
                'accept': 'application/json',
                'x-api-key': apiKey,
            },
            params: { domain: companyDomain },
            timeout: 10000, // 10-second timeout
        };

        // Make the API call
        const response = await axios.request(options);

        // Process and return the response (update output fields in HubSpot)
        const companyDetails = response.data.organization || {};
        console.log('Company Details:', companyDetails);

        // Send data back to HubSpot
        callback({
            outputFields: {
                status: true,
                company_name: companyDetails.name || 'N/A',
                company_url: companyDetails.website_url || 'N/A',
                company_description: companyDetails.short_description || companyDetails.description || 'N/A',
                linkedin_url: companyDetails.linkedin_url || 'N/A',
                twitter_url: companyDetails.twitter_url || 'N/A',
                facebook_url: companyDetails.facebook_url || 'N/A',
                founded_year: companyDetails.founded_year || 'N/A',
                industry: companyDetails.industry || 'N/A',
                keywords: companyDetails.keywords || 'N/A',
                estimated_num_employees: companyDetails.estimated_num_employees || 'N/A',
                raw_address: companyDetails.raw_address || 'N/A',
                city: companyDetails.city || 'N/A',
                state: companyDetails.state || 'N/A',
                postal_code: companyDetails.postal_code || 'N/A',
                country: companyDetails.country || 'N/A',
                annual_revenue: companyDetails.annual_revenue_printed || 'N/A',
                headquarters: companyDetails.raw_address || 'N/A',
                logo_url: companyDetails.logo_url || 'N/A',
                
            },
        });
    } catch (error) {
        console.error('Error occurred:', error.response?.data || error.message || error);
        callback({
            outputFields: {
                status: false,
                error: error.response?.data || error.message || 'Unknown error occurred.',
            },
        });
    }
};
