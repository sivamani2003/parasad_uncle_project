// import * as pdfMake from 'pdfmake/build/pdfmake';
// import numberToWords from 'number-to-words';
// import axios from 'axios';
// import 'pdfmake/build/vfs_fonts';
// // Set up pdfMake with the embedded font definitions
// pdfMake.vfs = pdfFonts.pdfMake.vfs;


// export const generateInvoicePDF = async (taskId, token) => {
//     try {
//         // Fetch invoice data from your API
//         const response = await axios.get(`https://parasad-uncle-project.onrender.com/api/tasks/pay/${taskId}`, {
//             headers: {
//                 Authorization: `Bearer ${token}`
//             }
//         });
//         const task = response.data;

//         // Extract relevant data from the task
//         const { name, address, amount } = task.paymentDetails;
//         const currentDate = new Date();
//         const formattedDate = currentDate.toLocaleDateString();
//         const amountInWords = numberToWords.toWords(amount);

//         // Define the PDF document structure
//         const docDefinition = {
//             content: [
//                 // Header section
//                 {
//                     columns: [
//                         {
//                             text: 'Your Company Name\nYour Address\nYour City, State, ZIP\nYour Country\nYour Email',
//                             style: 'header'
//                         },
//                         {
//                             text: 'TAX INVOICE',
//                             style: 'invoiceTitle',
//                             alignment: 'right'
//                         }
//                     ],
//                     border: [false, false, false, true] // Bottom border only
//                 },
//                 { text: '\n' }, // Add some space
//                 {
//                     table: {
//                         widths: ['*'],
//                         body: [
//                             [
//                                 {
//                                     table: {
//                                         widths: ['50%', '50%'],
//                                         body: [
//                                             [
//                                                 {
//                                                     text: [
//                                                         { text: '# : ', bold: true }, 'INV-000181\n',
//                                                         { text: 'Invoice Date : ', bold: true }, `${formattedDate}\n`,
//                                                         { text: 'Additional Line : ', bold: true }, 'Your text here\n',
//                                                         { text: 'Terms : ', bold: true }, 'Due on Receipt\n',
//                                                         { text: 'Due Date : ', bold: true }, `${formattedDate}`
//                                                     ],
//                                                     margin: [2, 2, 2, 2] // Adds some padding inside the cell
//                                                 },
//                                                 ''
//                                             ]
//                                         ]
//                                     },
//                                     // No margin for the nested table
//                                 }
//                             ]
//                         ],
//                         layout: 'noBorders' // No borders for the outer table
//                     }
//                 },
//                 { text: '\n' }, // Add some space
//                 { text: 'Bill To', style: 'subheader' },
//                 {
//                     columns: [
//                         {
//                             text: `${name}\n${address}`,
//                             style: 'customerDetails'
//                         }
//                     ],
//                     border: [true, true, true, true] // Full border around the billing information
//                 },
//                 { text: '\n' }, // Add some space
//                 {
//                     table: {
//                         headerRows: 1,
//                         widths: ['*', 'auto', 'auto', 'auto', 'auto'],
//                         body: [
//                             [
//                                 { text: '#', style: 'tableHeader', border: [true, true, true, true] },
//                                 { text: 'Item & Description', style: 'tableHeader', border: [true, true, true, true] },
//                                 { text: 'Qty', style: 'tableHeader', border: [true, true, true, true] },
//                                 { text: 'Rate', style: 'tableHeader', border: [true, true, true, true] },
//                                 { text: 'Amount', style: 'tableHeader', border: [true, true, true, true] }
//                             ],
//                             [
//                                 { text: '1', style: 'tableBody', border: [true, true, true, true] },
//                                 { text: 'Sample Item Description', style: 'tableBody', border: [true, true, true, true] },
//                                 { text: '1.00', style: 'tableBody', border: [true, true, true, true] },
//                                 { text: `${amount}.00`, style: 'tableBody', border: [true, true, true, true] },
//                                 { text: `${amount}.00`, style: 'tableBody', border: [true, true, true, true] }
//                             ]
//                         ]
//                     },
//                     layout: 'lightHorizontalLines'
//                 },
//                 { text: '\n' }, // Add some space
//                 {
//                     columns: [
//                         {
//                             width: '*',
//                             text: [
//                                 { text: 'Total In Words\n', bold: true },
//                                 `${amountInWords.charAt(0).toUpperCase() + amountInWords.slice(1)} rupees only\n\n`,
//                                 { text: 'Notes\n', bold: true },
//                                 'GST : NOT APPLICABLE\nThanks for your business.\n\n',
//                                 { text: 'Terms & Conditions\n', bold: true },
//                                 'Payment to be made by Cheque, drawn in the favor of " PRASAD KALAVA "\nPayable at Hyderabad or Credit to ICICI, GACHIBOWLI, Hyderabad.\nA/C no- 056701504611& IFSC Code- ICIC0000567'
//                             ],
//                             border: [false, false, false, false] // No border around the text area
//                         },
//                         {
//                             width: 'auto',
//                             table: {
//                                 body: [
//                                     [{ text: 'Sub Total', alignment: 'right', border: [true, true, true, true] }, { text: `${amount}.00`, alignment: 'right', border: [true, true, true, true] }],
//                                     [{ text: 'Total', alignment: 'right', border: [true, true, true, true] }, { text: `₹${amount}.00`, alignment: 'right', bold: true, border: [true, true, true, true] }],
//                                     [{ text: 'Balance Due', alignment: 'right', border: [true, true, true, true] }, { text: `₹${amount}.00`, alignment: 'right', bold: true, border: [true, true, true, true] }]
//                                 ]
//                             },
//                             layout: 'noBorders'
//                         }
//                     ]
//                 },
//                 { text: '\nAuthorized Signature', alignment: 'right', border: [true, false, false, false] } // Add top border to the signature
//             ],
//             styles: {
//                 header: { fontSize: 10, margin: [0, 0, 0, 10] },
//                 invoiceTitle: { fontSize: 18, bold: true, margin: [0, 0, 0, 10] },
//                 subheader: { fontSize: 12, bold: true, margin: [0, 10, 0, 5] },
//                 customerDetails: { fontSize: 12, margin: [0, 0, 0, 5] },
//                 tableHeader: { bold: true, fontSize: 12, color: 'black' },
//                 tableBody: { fontSize: 12, color: 'black' }
//             },
//             pageMargins: [40, 40, 40, 40],
//             background: function (_currentPage, pageSize) {
//                 return [
//                     {
//                         // First Border
//                         canvas: [
//                             {
//                                 type: 'rect',
//                                 x: 20,
//                                 y: 20,
//                                 w: pageSize.width - 40,
//                                 h: pageSize.height - 40,
//                                 lineWidth: 1,
//                                 lineColor: 'black'
//                             },
//                             // Second Border, slightly smaller
//                             {
//                                 type: 'rect',
//                                 x: 24,
//                                 y: 24,
//                                 w: pageSize.width - 48,
//                                 h: pageSize.height - 48,
//                                 lineWidth: 1,
//                                 lineColor: 'black'
//                             }
//                         ]
//                     }
//                 ];
//             }
//         };

//         // Generate and download the PDF
//         pdfMake.createPdf(docDefinition).download('invoice.pdf');
//     } catch (error) {
//         console.error('Error generating invoice:', error);
//     }
// };
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import numberToWords from 'number-to-words';
import axios from 'axios';

export const generateInvoicePDF = async (taskId, token) => {
    try {
        // Fetch invoice data from your API
        const response = await axios.get(`https://parasad-uncle-project.onrender.com/api/tasks/pay/${taskId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        const task = response.data;

        // Extract relevant data from the task
        const { name, address, amount } = task.paymentDetails;
        const currentDate = new Date();
        const formattedDate = currentDate.toLocaleDateString();
        const amountInWords = numberToWords.toWords(amount);

        // Create a new jsPDF instance
        const doc = new jsPDF();

        // Header section
        doc.setFontSize(10);
        doc.text('Your Company Name\nYour Address\nYour City, State, ZIP\nYour Country\nYour Email', 20, 20);
        doc.setFontSize(18);
        doc.text('TAX INVOICE', 160, 20, { align: 'right' });

        // Invoice details
        doc.setFontSize(12);
        doc.text('Invoice Date: ' + formattedDate, 20, 40);
        doc.text('Additional Line: Your text here', 20, 50);
        doc.text('Terms: Due on Receipt', 20, 60);
        doc.text('Due Date: ' + formattedDate, 20, 70);

        // Billing information
        doc.setFontSize(12);
        doc.text('Bill To', 20, 90);
        doc.text(`${name}\n${address}`, 20, 100);

        // Table of items
        doc.autoTable({
            startY: 120,
            head: [['#', 'Item & Description', 'Qty', 'Rate', 'Amount']],
            body: [
                ['1', 'Sample Item Description', '1.00', `${amount}.00`, `${amount}.00`]
            ],
            theme: 'grid',
            styles: {
                fontSize: 12,
                cellPadding: 2,
                valign: 'middle'
            }
        });

        // Total, notes, and signature
        doc.setFontSize(12);
        doc.text(`Total In Words: ${amountInWords.charAt(0).toUpperCase() + amountInWords.slice(1)} rupees only`, 20, doc.lastAutoTable.finalY + 10);
        doc.text('Notes\nGST: NOT APPLICABLE\nThanks for your business.', 20, doc.lastAutoTable.finalY + 20);
        doc.text('Terms & Conditions\nPayment to be made by Cheque, drawn in favor of " PRASAD KALAVA "\nPayable at Hyderabad or Credit to ICICI, GACHIBOWLI, Hyderabad.\nA/C no- 056701504611 & IFSC Code- ICIC0000567', 20, doc.lastAutoTable.finalY + 40);

        doc.autoTable({
            startY: doc.lastAutoTable.finalY + 70,
            body: [
                ['Sub Total', `${amount}.00`],
                ['Total', `₹${amount}.00`],
                ['Balance Due', `₹${amount}.00`]
            ],
            theme: 'plain',
            styles: {
                fontSize: 12,
                cellPadding: 2,
                valign: 'middle',
                halign: 'right'
            },
            columnStyles: {
                0: { halign: 'right', fontStyle: 'bold' },
                1: { halign: 'right' }
            }
        });

        // Signature
        doc.text('Authorized Signature', 160, doc.lastAutoTable.finalY + 30, { align: 'right' });

        // Borders
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        doc.setLineWidth(1);
        doc.rect(10, 10, pageWidth - 20, pageHeight - 20, 'S'); // Outer border
        doc.rect(14, 14, pageWidth - 28, pageHeight - 28, 'S'); // Inner border

        // Generate and download the PDF
        doc.save('invoice.pdf');
    } catch (error) {
        console.error('Error generating invoice:', error);
    }
};
