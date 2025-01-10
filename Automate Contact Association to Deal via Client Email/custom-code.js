const axios = require('axios');

exports.main = async (event) => {
    const accessToken = process.env.APITOKEN;
    const dealId = event.object.objectId;
    const clientEmail = event.fields.client_email;

    try {
        // Step 1: Search for the contact by email
        const contactSearchRequest = {
            filters: [
                {
                    propertyName: "email",
                    operator: "EQ",
                    value: clientEmail,
                },
            ],
            properties: ["email"],
            limit: 100,
        };

        const contactSearchResponse = await axios.post(
            `https://api.hubspot.com/crm/v3/objects/contacts/search`,
            contactSearchRequest,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            }
        );

        const contactResults = contactSearchResponse.data.results || [];
        console.log('contactResults:', contactResults);

        const contactIds = contactResults.map((contact) => contact.id);

        if (contactIds.length > 0) {
            // Step 2: Associate existing contacts with the deal
            const typeId = 1; // Replace with actual typeId for custom association
            const associationInput = [
                {
                    associationCategory: "USER_DEFINED",
                    associationTypeId: typeId,
                },
            ];

            for (const contactId of contactIds) {
                await axios.put(
                    `https://api.hubspot.com/crm/v4/objects/deal/${dealId}/associations/contact/${contactId}`,
                    associationInput,
                    {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                            "Content-Type": "application/json",
                        },
                    }
                );
            }

            console.log('Association with existing contacts successful');
        } else {

            // Extract firstname, lastname, and company from email
            const emailPattern = /([a-zA-Z]+)(?:[._]([a-zA-Z]+))?@([a-zA-Z0-9.-]+)\./;
            const match = clientEmail.match(emailPattern);

            let firstName = null;
            let lastName = null;
            let company = null;

            if (match) {
                const toProperCase = (str) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

                firstName = toProperCase(match[1]);
                lastName = match[2] ? toProperCase(match[2]) : null;
                company = toProperCase(match[3]);
            }

            console.log('Extracted details:', { firstName, lastName, company });
            // Step 3: Create the contact and associate it with the deal
            const createContactPayload = {
                properties: {
                    firstname: firstName,
                    lastname: lastName,
                    company: company,
                    email: clientEmail,
                },
            };

            const createContactResponse = await axios.post(
                `https://api.hubspot.com/crm/v3/objects/contacts`,
                createContactPayload,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            const newContactId = createContactResponse.data.id;
            console.log(`New contact created with ID: ${newContactId}`);

            // Step 2: Define the association input
            const typeId = 1; // Replace with the actual typeId
            const associationInput = [
                {
                    associationCategory: "USER_DEFINED",
                    associationTypeId: typeId,
                },
            ];

            // Step 3: Associate the contact with the deal
            await axios.put(
                `https://api.hubspot.com/crm/v4/objects/deal/${dealId}/associations/contact/${newContactId}`,
                associationInput,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            console.log('Contact created and associated with the deal successfully!');
        }
    } catch (error) {
        console.error('Error occurred:', error.response?.data || error.message || error);
    }
};
