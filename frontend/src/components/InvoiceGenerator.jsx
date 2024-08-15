import React, { useState, useEffect } from 'react';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import numberToWords from 'number-to-words';
import axios from 'axios';

pdfMake.vfs = pdfFonts.pdfMake.vfs;

const InvoiceGenerator = () => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  const [itemDescription, setItemDescription] = useState('');

  const taskId = '66b45f45ca4ede80e12f909f'; 
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2YjI1YTUyMzNlNDVjYzIyOTM1ZmY4MyIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTcyMzUyMTM4MSwiZXhwIjoxNzIzNTI0OTgxfQ.Zo01dCeCcA09P1we84WE94Rg2cA4AIDu-vWtxXYfpEA';

  useEffect(() => {
    // Fetch task details from the backend with authorization header
    const fetchTaskDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5007/api/tasks/pay/${taskId}`, {
          headers: {
            Authorization: `Bearer ${token}` // Add token to the Authorization header
          }
        });
        const task = response.data;

        // Populate the form fields with the fetched task details
        setName(task.paymentDetails.name || '');
        setAmount(task.paymentDetails.amount || '');
        setAddress(task.paymentDetails.address || '');
        setItemDescription(task.task || '');
      } catch (error) {
        console.error('Error fetching task details:', error);
      }
    };

    fetchTaskDetails();
  }, [taskId, token]);

  const generatePDF = () => {
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString();
    const amountInWords = numberToWords.toWords(parseInt(amount));

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
                            { text: 'Additional Line : ', bold: true }, 'Your text here\n',  // New line added
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
          },
        }
      ,
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
                { text: itemDescription, style: 'tableBody', border: [true, true, true, true] }, 
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
              border: [false,false, false,false]  // Full border around the text area
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
  };

  return (
    <div>
      <h1>Invoice Generator</h1>
      <button onClick={generatePDF}>Generate Invoice</button>
    </div>
  );
};

export default InvoiceGenerator;
