require('dotenv').config();
const fs = require('fs');
const path = require('path')
const createCsvWriter = require('csv-writer').createObjectCsvWriter

const jsonFilePath = process.env.JSON_FILE_PATH;

if (!jsonFilePath) {
  console.error('Error: JSON_FILE_PATH is not set in the .env file')
  process.exit(1);
}

try {
  const fullJsonPath = path.resolve(process.cwd(), jsonFilePath)
  const jsonData = fs.readFileSync(fullJsonPath, 'utf8')
  const parsedData = JSON.parse(jsonData)

  const dataArray = Array.isArray(parsedData) ? parsedData : [parsedData]

  const results = []

  dataArray.forEach((customer) => {
    customer.sales.forEach((sale) => {
      // console.log(sale.Type, ' - ', sale['S. O. #'])
      if (sale.Type === 'Sales Order') {
        let due_date = sale.Date
        let sales_order_number = sale['S. O. #']

        const invoices = customer.sales.filter((transaction) =>
          transaction.Type === 'Invoice' && 
          transaction['S. O. #'] === sales_order_number
        )
        const latestInvoiceDate = invoices.reduce((latest, invoice) => {
          return latest > invoice.Date ? latest : invoice.Date;
        }, null)
        let status;
        if (invoices.length === 0) {
          status = 'Unfulfilled';
        } else if (latestInvoiceDate <= due_date) {
          status = 'On Time';
        } else {
          status = 'Late';
        }
        const salesOrderNumber = sale['S. O. #']
        results.push({
          customer_name: customer.name,
          sales_order_number: salesOrderNumber,
          due_date,
          latest_invoice_date: latestInvoiceDate || 'N/A',
          status,
        })
        const csvWriter = createCsvWriter({
          path: './output/output.csv',
          header: [
            { id: 'customer_name', title: 'Customer Name' },
            { id: 'sales_order_number', title: 'Sales Order Number' },
            { id: 'due_date', title: 'Due Date' },
            { id: 'latest_invoice_date', title: 'Latest Invoice Date' },
            { id: 'status', title: 'Status' },
          ],
        });
      
        csvWriter.writeRecords(results).then(() => {
          console.log('CSV file written successfully!');
        })
      }
    })
  })

} catch (error) {
  console.error('Error reading or parsing the JSON file:', error.message);
  process.exit(1);
}
