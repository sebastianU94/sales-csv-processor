require('dotenv').config()

const fs = require('fs')
const csv = require('csv-parser')
const path = require('path')

const processCSV = (filePath) => {
  const customers = []
  const columnHeaders = []

  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (row) => {
      if (columnHeaders.length === 0) {
        columnHeaders.push(...Object.keys(row))
      }
      const customerName = row['Name']

      if (!customerName || customerName.trim() === '') {
        return
      }

      let customer = customers.find(c => c.name === customerName)

      if (!customer) {
        customer = {
          name: customerName,
          sales: [],
        }
        customers.push(customer)
      }

      const sale = {
        'Trans #': row['Trans #'],
        'Type': row['Type'],
        'Date': row['Date'],
        'Num': row['Num'],
        'S. O. #': row['S. O. #'],
        'P. O. #': row['P. O. #'],
        'Memo': row['Memo'],
        'Due Date': row['Due Date'],
        'TRACKING #': row['TRACKING #'],
        'Account': row['Account'],
        'Rep': row['Rep'],
        'Clr': row['Clr'],
        'Split': row['Split'],
        'Debit': row['Debit'],
        'Credit': row['Credit'],
        'Entered/Last Modified': row['Entered/Last Modified'],
      }

      customer.sales.push(sale)

    })
    .on('end', () => {
      console.log('Column Headers:', columnHeaders)
      console.log('Parsed Data:', customers)
      const jsonFilePath = 'db.json'
      fs.writeFile(jsonFilePath, JSON.stringify(customers, null, 2), (err) => {
        if (err) {
          console.error('Error writing JSON file:', err);
        } else {
          console.log('Customer data has been saved to', jsonFilePath)
        }
      })
    })
}

const filePath = path.join(process.env.CSV_FILE_PATH)
processCSV(filePath)
