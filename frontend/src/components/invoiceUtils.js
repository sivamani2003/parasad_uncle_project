// invoiceUtils.js
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import numberToWords from 'number-to-words';
import axios from 'axios';

pdfMake.vfs = pdfFonts.pdfMake.vfs;

export const generateInvoicePDF = async (taskId, token) => {
    try {
      const response = await axios.get(`http://localhost:5007/api/tasks/pay/${taskId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const task = response.data;
  
      // Extracting values from task.paymentDetails
      const { name, address, amount } = task.paymentDetails;
      const currentDate = new Date();
      const formattedDate = currentDate.toLocaleDateString();
      const amountInWords = numberToWords.toWords(amount);
  
      const docDefinition = {
        content: [
          {
            columns: [
              {
                text: 'Prasad Kalava\nPATAMATA\nVIJAYAWADA Andhra Pradesh 520010\nIndia\nprasad.kalava@gmail.com',
                style: 'header'
              },
              {
                text: 'TAX INVOICE',
                style: 'invoiceTitle',
                alignment: 'right'
              }
            ],
            border: [false, false, false, true]  // bottom border only
          },
          { text: '\n' },  // Add some space
          {
            table: {
              widths: ['*'],
              body: [
                [
                  {
                    table: {
                      widths: ['50%', '50%'],
                      body: [
                        [
                          {
                            text: [
                              { text: '# : ', bold: true }, 'INV-000181\n',
                              { text: 'Invoice Date : ', bold: true }, `${formattedDate}\n`,
                              { text: 'Additional Line : ', bold: true }, 'Your text here\n',
                              { text: 'Terms : ', bold: true }, 'Due on Receipt\n',
                              { text: 'Due Date : ', bold: true }, `${formattedDate}`
                            ],
                            margin: [2, 2, 2, 2]  // Adds some padding inside the cell
                          },
                          ''
                        ]
                      ]
                    },
                    // No margin for the nested table
                  }
                ]
              ],
              layout: 'noBorders'  // No borders for the outer table
            }
          },
          { text: '\n' },  // Add some space
          { text: 'Bill To', style: 'subheader' },
          {
            columns: [
              {
                text: `${name}\n${address}`,
                style: 'customerDetails'
              }
            ],
            border: [true, true, true, true]  // Full border around the billing information
          },
          { text: '\n' },  // Add some space
          {
            table: {
              headerRows: 1,
              widths: ['*', 'auto', 'auto', 'auto', 'auto'],
              body: [
                [
                  { text: '#', style: 'tableHeader', border: [true, true, true, true] }, 
                  { text: 'Item & Description', style: 'tableHeader', border: [true, true, true, true] }, 
                  { text: 'Qty', style: 'tableHeader', border: [true, true, true, true] }, 
                  { text: 'Rate', style: 'tableHeader', border: [true, true, true, true] }, 
                  { text: 'Amount', style: 'tableHeader', border: [true, true, true, true] }
                ],
                [
                  { text: '1', style: 'tableBody', border: [true, true, true, true] }, 
                  { text: 'Sample Item Description', style: 'tableBody', border: [true, true, true, true] }, 
                  { text: '1.00', style: 'tableBody', border: [true, true, true, true] }, 
                  { text: `${amount}.00`, style: 'tableBody', border: [true, true, true, true] }, 
                  { text: `${amount}.00`, style: 'tableBody', border: [true, true, true, true] }
                ]
              ]
            },
            layout: 'lightHorizontalLines'
          },
          { text: '\n' },  // Add some space
          {
            columns: [
              {
                width: '*',
                text: [
                  { text: 'Total In Words\n', bold: true },
                  `${amountInWords.charAt(0).toUpperCase() + amountInWords.slice(1)} rupees only\n\n`,
                  { text: 'Notes\n', bold: true },
                  'GST : NOT APPLICABLE\nThanks for your business.\n\n',
                  { text: 'Terms & Conditions\n', bold: true },
                  'Payment to be made by Cheque, drawn in the favor of " PRASAD KALAVA "\nPayable at Hyderabad or Credit to ICICI, GACHIBOWLI, Hyderabad.\nA/C no- 056701504611& IFSC Code- ICIC0000567'
                ],
                border: [false,false, false,false]  // No border around the text area
              },
              {
                width: 'auto',
                table: {
                  body: [
                    [{ text: 'Sub Total', alignment: 'right', border: [true, true, true, true] }, { text: `${amount}.00`, alignment: 'right', border: [true, true, true, true] }],
                    [{ text: 'Total', alignment: 'right', border: [true, true, true, true] }, { text: `₹${amount}.00`, alignment: 'right', bold: true, border: [true, true, true, true] }],
                    [{ text: 'Balance Due', alignment: 'right', border: [true, true, true, true] }, { text: `₹${amount}.00`, alignment: 'right', bold: true, border: [true, true, true, true] }]
                  ]
                },
                layout: 'noBorders'
              }
            ]
          },
          { text: '\nAuthorized Signature', alignment: 'right', border: [true, false, false, false] }  // Add top border to the signature
        ],
        styles: {
          header: { fontSize: 10, margin: [0, 0, 0, 10] },
          invoiceTitle: { fontSize: 18, bold: true, margin: [0, 0, 0, 10] },
          subheader: { fontSize: 12, bold: true, margin: [0, 10, 0, 5] },
          customerDetails: { fontSize: 12, margin: [0, 0, 0, 5] },
          tableHeader: { bold: true, fontSize: 12, color: 'black' },
          tableBody: { fontSize: 12, color: 'black' }
        },
        pageMargins: [40, 40, 40, 40],
        background: function (_currentPage, pageSize) {
          return [
            {
              // First Border
              canvas: [
                {
                  type: 'rect',
                  x: 20,
                  y: 20,
                  w: pageSize.width - 40,
                  h: pageSize.height - 40,
                  lineWidth: 1,
                  lineColor: 'black'
                },
                // Second Border, slightly smaller
                {
                  type: 'rect',
                  x: 24,
                  y: 24,
                  w: pageSize.width - 48,
                  h: pageSize.height - 48,
                  lineWidth: 1,
                  lineColor: 'black'
                }
              ]
            }
          ];
        }
      };
  
      pdfMake.createPdf(docDefinition).download('invoice.pdf');
    } catch (error) {
      console.error('Error generating invoice:', error);
    }
  };
  
