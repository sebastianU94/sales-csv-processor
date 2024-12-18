require('dotenv').config()

const fs = require('fs')
const path = require('path')
const createCsvWriter = require('csv-writer').createObjectCsvWriter
const { compareDates, isOnTime } = require('./src/utils')

const jsonFilePath = process.env.JSON_FILE_PATH

if (!jsonFilePath) {
  console.error('Error: JSON_FILE_PATH is not set in the .env file')
  process.exit(1)
}

try {
  const fullJsonPath = path.resolve(process.cwd(), jsonFilePath)
  const jsonData = fs.readFileSync(fullJsonPath, 'utf8')
  const parsedData = JSON.parse(jsonData)

  const customers = Array.isArray(parsedData) ? parsedData : [parsedData]

  const customersOutput = customers.map(customer => {
    const salesOrders = customer.sales.filter(sale => sale.Type === 'Sales Order')
    const invoices = customer.sales.filter(sale => sale.Type === 'Invoice')
  
    const processedSales = salesOrders.map(salesOrder => {
      const matchingInvoices = invoices.filter(invoice => salesOrder.Num === invoice['S. O. #'])
      
      if (matchingInvoices.length > 0) {
        const mostRecentInvoiceDate = matchingInvoices.reduce((latest, invoice) => 
          compareDates(latest, invoice.Date), matchingInvoices[0].Date)
        
        return {
          salesOrderNumber: salesOrder.Num,
          date: salesOrder.Date,
          dueDate: salesOrder['Due Date'],
          invoiceCount: matchingInvoices.length,
          mostRecentInvoiceDate: mostRecentInvoiceDate,
          onTime: isOnTime(salesOrder['Due Date'], mostRecentInvoiceDate),
        }
      }
      return null
    }).filter(Boolean)
  
    return {
      name: customer.name,
      sales: processedSales
    }
  })

// Flatten the data structure for CSV output
const flattenedData = customersOutput.flatMap(customer => 
  customer.sales.map(sale => ({
    customerName: customer.name,
    ...sale
  }))
)

// Define the CSV writer
const csvWriter = createCsvWriter({
  path: './output/output.csv',
  header: [
    {id: 'customerName', title: 'Customer Name'},
    {id: 'salesOrderNumber', title: 'Sales Order Number'},
    {id: 'date', title: 'Sales Order Date'},
    {id: 'dueDate', title: 'Due Date'},
    {id: 'invoiceCount', title: 'Invoices Count'},
    {id: 'mostRecentInvoiceDate', title: 'Shipping Date'},
    {id: 'onTime', title: 'On Time'}
  ]
})

// Write the data to the CSV file
csvWriter.writeRecords(flattenedData)
  .then(() => {
    console.log('CSV file has been written successfully')
  })
  .catch((error) => {
    console.error('Error writing CSV file:', error)
  })

} catch (error) {
  console.error('Error reading or parsing the JSON file:', error.message)
  process.exit(1)
}
