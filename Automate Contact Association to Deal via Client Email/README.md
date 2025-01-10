# HubSpot Contact and Deal Association Script

## Overview
This script is designed to work with the HubSpot API to search for, create, and associate contacts with deals in HubSpot CRM. It uses a Node.js environment and leverages the `axios` library to make HTTP requests.

### Features
1. **Search Contacts by Email:**
   - Searches HubSpot for contacts based on their email address.
   - Filters and retrieves contact information if it exists.

2. **Associate Existing Contacts with Deals:**
   - Associates found contacts with a specific deal using custom association types.

3. **Create and Associate New Contacts:**
   - Creates a new contact if no existing contact is found for the provided email.
   - Associates the newly created contact with the specified deal.

4. **Error Handling:**
   - Logs errors for debugging.
   - Handles missing or invalid input data.

## Requirements
- Node.js (v14 or higher recommended)
- `axios` package
- HubSpot API Access Token (with sufficient permissions for CRM operations)

## Environment Variables
- `token`: Your HubSpot API access token.

## Installation
1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```bash
   cd <project-directory>
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

## Usage
### Input
The script expects the following input structure:
```json
{
  "object": {
    "objectId": "<deal-id>"
  },
  "fields": {
    "client_email": "<client-email-address>"
  }
}
```

### Execution
Run the script using Node.js:
```bash
node script.js
```

### Output
- Logs the following:
  - Results of contact search.
  - Confirmation of successful associations.
  - Any errors encountered during execution.

## Code Details
### Main Steps
#### 1. Contact Search
- Sends a POST request to the `/crm/v3/objects/contacts/search` endpoint to find contacts matching the given email.
- Retrieves the contact IDs of matching contacts.

#### 2. Associate Contacts with Deals
- Uses the `/crm/v4/objects/deal/{dealId}/associations/contact/{contactId}` endpoint to associate contacts with the deal.
- Handles both existing and newly created contacts.

#### 3. Create New Contacts
- If no matching contact is found, a new contact is created using the `/crm/v3/objects/contacts` endpoint.
- The new contact is then associated with the deal.

### Error Handling
- Captures and logs errors from API responses.
- Handles cases such as missing input data or invalid email formats.

### Example Logs
- **Successful Contact Search:**
  ```
  contactResults: [ { id: '12345', properties: { email: 'client@example.com' } } ]
  Association with existing contacts successful
  ```
- **New Contact Created:**
  ```
  New contact created with ID: 67890
  Contact created and associated with the deal successfully!
  ```
- **Error Example:**
  ```
  Error occurred: { status: 404, message: 'Contact not found' }
  ```

## Notes
- Update the `typeId` variable to match the custom association type ID in your HubSpot account.
- Ensure your HubSpot API token has permissions for contacts, deals, and associations.

## License
This project is licensed under the MIT License. See the LICENSE file for details.
