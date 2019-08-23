import config from 'crm/config'

const {apiHost, apiHost_wu} = config

const api = {
    customerGroups: {
        url: `${apiHost}/customer_groups`,
        type: 'GET',
    },
    createCustomerGroups: {
        url: `${apiHost}/customer_groups`,
        type: 'POST',
    },
    editCustomerGroups: {
        url: `${apiHost}/customer_groups/{id}`,
        type: 'PUT',
    },
    deleteCustomerGroups: {
        url: `${apiHost}/customer_groups/{id}`,
        type: 'DELETE',
    },
    details: {
        url: `${apiHost}/customer_groups/{id}`,
        type: 'GET',
    },
    customersFilter: {
        url: `${apiHost}/customer_groups/customers/filter`,
        type: 'POST',
    },
    customersDetails: {
        url: `${apiHost}/customer_groups/{id}/customers`,
        type: 'GET',
    },
    shops: {
        url: `${apiHost_wu}/api/shops`,
        type: 'GET',
    },
}

export default api
