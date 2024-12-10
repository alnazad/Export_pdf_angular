import { Injectable } from "@angular/core";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Function to convert ArrayBuffer to Base64 string
function arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

@Injectable({
  providedIn: "root",
})
export class PdfDetailsService {
  formatDatePdf(date: Date): string {
    const year = date.getFullYear();
    const month = ("0" + (date.getMonth() + 1)).slice(-2);
    const day = ("0" + date.getDate()).slice(-2);
    return `${year}${month}${day}`;
  }

  async generatePdf(shinseiId: any, pdfdetails: any[],data:any) {
    console.log(pdfdetails)
    try {
         // set Japaniese local time -------------------- 
 // set Japaniese local time -------------------- 
 const date = new Date().toLocaleString('ja-JP', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
});
// Parse the date and time components
const [fullDate, fullTime] = date.split(' ');
const [year, month, day] = fullDate.split('/');
const [hour, minute, second] = fullTime.split(':');

// Format the date as per Japanese standards
// const formattedDate = `${year}年${month}月${day}日 ${hour}:${minute}:${second}`;
const formattedDate = `${year}年${month}月${day}日`;


// Generate PDF-------------------------
const doc = new jsPDF();

const fontUrl = 'labelprint/assets/fonts/NotoSerifJP-Regular.ttf';

// Load the custom font
const fontBytes = await fetch(fontUrl).then(res => res.arrayBuffer());
const fontBase64 = arrayBufferToBase64(fontBytes);

// Embed the custom font
doc.addFileToVFS('NotoSansCJKtc-Regular.ttf', fontBase64);
doc.addFont('NotoSansCJKtc-Regular.ttf', 'NotoSans', 'normal');
doc.setFont('NotoSans'); // Set the custom font

// Add company information as a two-column table
const companyInfoHeaders = [['防火壁装施工管理ラベル交付申請書']];

autoTable(doc, {
head: companyInfoHeaders,
startY: 5,
tableWidth: 117,
theme: 'plain',
headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0] },
styles: { font: 'NotoSans',halign:'center',fontSize:20 },
margin: { left: 30 },
didDrawCell: (data) => {
    const { cell, doc } = data;
    
    // Check if the current cell is a header cell and draw an underline
    if (data.row.index === 0 && data.column.index === 0) {
      const yPosition = cell.y + cell.height; // Position the line at the bottom of the header cell
      const lineWidth = cell.width; // Width of the cell
      const xPosition = cell.x; // X position of the cell
      doc.setDrawColor(0, 0, 0); // Set line color (black)
      doc.setLineWidth(0.5); // Set the thickness of the underline line
      doc.line(xPosition, yPosition, xPosition + lineWidth, yPosition); // Draw the underline
    }
  },
});
// ------------Date and month table start---------------------------
const formatYear = (date:any) => new Date(date).getUTCFullYear();
const formatMonth = (date:any) => String(new Date(date).getUTCMonth() + 1).padStart(2, '0');  // Ensure two digits for month
const formatDay = (date:any) => String(new Date(date).getUTCDate()).padStart(2, '0');  // Ensure two digits for day
const insert_date_formatted = data.insert_date ? `${formatYear(data.insert_date)} 年 ${formatMonth(data.insert_date)} 月 ${formatDay(data.insert_date)} 日` : '';
const check_date_formatted = data.check_date ? `${formatYear(data.check_date)} 年 ${formatMonth(data.check_date)} 月 ${formatDay(data.check_date)} 日` : '          年     月       日';
const datemonth = [[
  '申請日 '+insert_date_formatted+ '\n' +'承認日 '+check_date_formatted,
],
[
   
]];
autoTable(doc, {
head: datemonth,
startY: 3,
tableWidth: 100,
theme: 'plain',
headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0] },
styles: { font: 'NotoSans',halign:'left',fontSize:10 },
margin: { left: 150 }
});
// ------------Date and month table End---------------------------

// ------------2nd and month table start-------------------------
const sensei= data.shinsei_status === 0 ? "未承認":'';
if (sensei) {
const secondtab = [[sensei]];

autoTable(doc, {
  head: secondtab,
  startY: 22,
  tableWidth:30 ,
  theme: 'plain',
  headStyles: { 
    fillColor: [255, 255, 255], 
    textColor: [255, 0, 0] ,
    fontStyle:"bold"
  },
  styles: { 
    font: 'NotoSans', 
    halign: 'center', 
    fontSize: 12,
    cellPadding: 3
  },
  margin: { left: 150 },
  didDrawCell: (data) => {
    const { cell, doc } = data;

    // Get the position and dimensions of the cell
    const xPosition = cell.x;
    const yPosition = cell.y;
    const width = cell.width;
    const height = cell.height;

    // Set the border color to red
    doc.setDrawColor(255, 0, 0); // Red color for borders
    doc.setLineWidth(0.8); // Outer border thickness

    // Draw the outer border
    doc.rect(xPosition, yPosition, width, height);

    // Adjust for inner border - slightly offset
    const innerOffset = 2; // Adjust inner border position if necessary
    doc.setLineWidth(0.3); // Inner border thickness
    doc.rect(xPosition + innerOffset, yPosition + innerOffset, width - 2 * innerOffset, height - 2 * innerOffset); // Inner border
  }
});
}
// ------------2nd and month table End---------------------------
// ------------3rd and month table start-------------------------
const thirdtab = [[data.union_name+' '+' '+' '+' '+' 殿']];

autoTable(doc, {
head: thirdtab,
startY: 20,
tableWidth: 90,
theme: 'plain',
headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0] },
styles: { font: 'NotoSans',halign:'left',fontSize:12 },
margin: { left: 6 },
didDrawCell: (data) => {
    const { cell, doc } = data;
    // Check if the current cell is a header cell and draw an underline
    if (data.row.index === 0 && data.column.index === 0) {
      const yPosition = cell.y + cell.height; // Position the line at the bottom of the header cell
      const lineWidth = cell.width; // Width of the cell
      const xPosition = cell.x; // X position of the cell
      doc.setDrawColor(0, 0, 0); // Set line color (black)
      doc.setLineWidth(0.5); // Set the thickness of the underline line
      doc.line(xPosition, yPosition, xPosition + lineWidth, yPosition); // Draw the underline
    }
  },
});
// ------------3rd and month table End---------------------------
// ------------4rd and month table start-------------------------
const receive_date_formatted = data.receive_date ? `${formatYear(data.receive_date)} 年 ${formatMonth(data.receive_date)} 月 ${formatDay(data.receive_date)} 日` : '';
const receive_type= data.receive_type === "1" ? "郵送" : "窓口"
const receive_date='受取予定日 '+' '+' '+' '+receive_date_formatted
const forthtab = [['受取方法 '+' '+' '+' '+ receive_type],[receive_date ]];
autoTable(doc, {
head: forthtab,
startY: 30,
tableWidth: 75,
theme: 'plain',
headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0] },
styles: { font: 'NotoSans',halign:'left',fontSize:12 },
margin: { left: 4 }
});
// ------------4rd and month table End---------------------------
// ------------5th and month table start-------------------------

const fifthtab = [['・壁装施工団体協議会の品質表示規定を\n　遵守し、下記の通り施工しました\n・防火壁装材料の施工には日本壁装協会に\n　登録されている接着剤等を使用しています。 ']];
autoTable(doc, {
head: fifthtab,
startY: 47,
tableWidth: 100,
theme: 'grid',
headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0],fontStyle: 'normal' },
styles: { font: 'NotoSans',halign:'left',fontSize:12,fontStyle: 'normal' },
margin: { left: 2 }
});
// ------------5th and month table End---------------------------
// ------------6th and month table start-------------------------
const sixtab = [['事業所名 '+' '+' '+' '+' '+' '+' '+' '+' '+''+'(有)'+data.office_name],['施工管理者名'+' '+'\n '+''],['登録番号'+' '+' '+' '+' '+' '+' '+' '+' '+' '+' '+' '+' '+data.user_system_no]];
autoTable(doc, {
head: sixtab,
startY: 47,
tableWidth: 100,
theme: 'grid',
headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0],fontStyle: 'normal' },
styles: { font: 'NotoSans',halign:'left',fontSize:12,fontStyle: 'normal' },
margin: { left: 110 }
});
// ------------6th and month table End---------------------------
// ------------7th and month table start-------------------------
const seventab = [['（講習受講登録者）']];
autoTable(doc, {
head: seventab,
startY: 63,
tableWidth: 100,
theme: 'grid',
headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0],fontStyle: 'normal' },
styles: { font: 'NotoSans',halign:'left',fontSize:9,fontStyle: 'normal' },
margin: { left: 109 }
});
// ------------7th and month table End---------------------------
// ------------8th and month table start-------------------------
const eighttab = [[data.manager_name]];
autoTable(doc, {
head: eighttab,
startY: 55,
tableWidth: 60,
theme: 'grid',
headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0],fontStyle: 'normal' },
styles: { font: 'NotoSans',halign:'left',fontSize:12,fontStyle: 'normal' },
margin: { left: 142 },
didDrawCell: (data) => {
  const { cell, doc } = data;
  
  // Check if the current cell is a header cell and draw an underline
  if (data.row.index === 0 && data.column.index === 0) {
    const yPosition = cell.y + cell.height; // Position the line at the bottom of the header cell
    const lineWidth = cell.width; // Width of the cell
    const xPosition = cell.x; // X position of the cell
    doc.setDrawColor(0, 0, 0); // Set line color (black)
    doc.setLineWidth(0.5); // Set the thickness of the underline line
    doc.line(xPosition, yPosition, xPosition + lineWidth, yPosition); // Draw the underline
  }
},
});

// ------------8th and month table End---------------------------


// ------------First table start---------------------------
// Add first table header
const firstt = [['標記ラベルの交付を申請します。']];

autoTable(doc, {
head: firstt,
startY: 77,
tableWidth: 'auto',
theme: 'plain',
headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0],fontStyle: 'normal' },
styles: { font: 'NotoSans',halign:'center',fontSize:12,fontStyle: 'normal' },
margin: { left: -117  },
});
const contents = data.kenchiku_type === "1" ? "新築" :
               data.kenchiku_type === "2" ? "改装" :
               data.kenchiku_type === "3" ? "改築" :
               "Unknown";
const kenchiku_k = data.kenchiku_kozo === "1"
? "耐火 建築物"
: data.kenchiku_kozo === "2"
? "準耐火 建築物"
: data.kenchiku_kozo === "3"
? "準耐火 建築物"
: data.kenchiku_kozo === "4"
? "その他"
: "Unknown"
const companyInfoBody = [
    [
        { content: '工 事 名 称', },
        { content:  contents+'\n'+data.koji_name},
        { content: '建築物の'+'\n'+'用   途' }, // Merges into 3 columns below
        { content: data.kenchiku_yoto }, // Merges into 4 columns below
    ],
    [
        { content: '現 場 所 在 地' },
        { content: data.syozaichi },
        { content: '建築物の'+'\n'+'規   模' },
        { content: '延面積'+data.menseki +'㎡'+'\n'+ data.kaisu+'階建' },
    ],
    [
        { content: '建築業者又は発注者' },
        { content: '認定番号' },
        { content: '建築物の'+'\n'+'構   造',rowSpan: 2 },
        { content: kenchiku_k,rowSpan: 2 },
    ],
    [
        { content: '建築工事責任者' },
        { content: data.kenchiku_sekininsya },
    ]
  ];

autoTable(doc, {
body: companyInfoBody,
startY: 86,
tableWidth: 'auto',
theme: 'grid',
styles: { fontSize: 11, halign: 'left', font: 'NotoSans',valign: 'middle' },
margin: { left: 6 },
columnStyles: {
 0: { cellWidth: 47,fillColor: [255, 255, 255] }, // Column 1 width (認定取得者名)
 1: { cellWidth: 87 }, // Column 2 width (会社名)
 2: { cellWidth: 21 }, // Column 2 width (会社名)
 3: { cellWidth: 43 }, // Column 2 width (会社名)
},
didDrawCell: (data) => {
  const cell = data.cell;
  const doc = data.doc;
  doc.setLineWidth(0.4);
  doc.setDrawColor(0, 0, 0);
  doc.rect(cell.x, cell.y, cell.width, cell.height); // Draw borders manually
  }
});
// ------------First table end---------------------------
// ------------Second table start------------------------
// Add second table header
const secondt = [['（注） 改築・改装の場合はその旨を工事名称欄にご記入下さい。']];

autoTable(doc, {
head: secondt,
startY: 133,
tableWidth: 'auto',
theme: 'plain',
headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0],fontStyle: 'normal' },
styles: { font: 'NotoSans',halign:'center',fontSize:12,fontStyle: 'normal' },
margin: { left: -60 }
});
// Define complex table headers
const headerRows = [
  [
      { content: '区    分', rowSpan: 2,colSpan: 3 },
      { content: '区画数', rowSpan: 2 },
      { content: '防火壁装材料', colSpan: 3 }, // Merges into 3 columns below
      { content: 'ラベル'+'\n'+'枚数',rowSpan: 2 }, // Merges into 4 columns below
  ],
  [
      { content: '基材(下地)材料名/品番' },
      { content: '認定番号' },
      { content: '使用量' }
  ]
];

// Map the rows based on your dynamic data
const rows = pdfdetails.map(item => [
    // Dynamically setting the values for each row
    item.kubun_area === "1" || item.kubun_area === "3" ? "居　室" : "",
    item.kubun_kabe === "1" ? "天井" : item.kubun_kabe !== "1" ? "壁" : "",
    
    '  '+'  '+'  '+'    '+"階"+'\n'+item.kubun_kaisu,  // Adding "階" after the value
    
    '  '+'   '+'   '+'    '+"区画"+'\n'+item.kukaku_num, // Adding "区画" after the value
    
    item.sitaji_name + '\n' + item.merchandise_id, // Adding line break for the two values
    
    item.nintei_no,
    
    '   '+'   '+'   '+'    '+"㎡"+'\n'+item.shiyoryo, // Adding "㎡" after the value
    
    '   '+'   '+'   '+'   '+"枚"+'\n'+item.label_num // Adding "枚" after the value
  ]);

  // Check if the number of rows is less than 10
const minRows = 11;
const rowsToAdd = minRows - rows.length;

// If there are less than 10 rows, fill the remaining rows with empty values
for (let i = 0; i < rowsToAdd; i++) {
  rows.push([
    "",  // Empty content for the first column
    "",  // Empty content for the second column
    "",  // Empty content for the third column
    "",  // Empty content for the fourth column
    "",  // Empty content for the fifth column
    "",  // Empty content for the sixth column
    "",  // Empty content for the seventh column
    "",  // Empty content for the eighth column
    "",  // Empty content for the ninth column
    "",  // Empty content for the ninth column
  ]);
}
// Modify the last (blank) row to include the totals
  let kukaku_total=0
  let siyoryo_total=0
  let label_num_total=0
  pdfdetails.map(item => [
    kukaku_total += parseInt(String(item.kukaku_num), 10) || 0,
    siyoryo_total += parseInt(String(item.shiyoryo), 10) || 0,
    label_num_total += parseInt(String(item.label_num), 10) || 0
  ]);
rows[rows.length - 1] = [
  "", // Empty content for the first column
  "", // Empty content for the second column
  "", // Empty content for the third column
  '   '+'   '+'   '+'  '+"区画"+'\n'+`${kukaku_total}`, // Total for kukaku (number of districts)
  "", // Empty content for the fifth column
  "", // Empty content for the sixth column
  '    '+'   '+'   '+'   '+"㎡"+'\n'+`${siyoryo_total}`, // Total for siyoryo (area in square meters)
  '   '+'   '+'   '+'   '+"枚"+'\n'+`${label_num_total}`, // Total for label number
];

// Generate PDF table and calculate height dynamically
const rowHeight = 10; // Approximate height of each row, adjust if needed
//const minHeight = 40; // Minimum table height (to prevent text overlap for small tables)
//const totalRows = rows.length; // Total number of rows in the table
//const tableHeight = Math.max(minHeight, totalRows * rowHeight); // Use the larger of minHeight or calculated height
//const startY = 40; // Table's starting Y position
//const textY = startY + tableHeight; // Position for the text below the table
// Use autoTable to generate the table with complex headers
autoTable(doc, {
head: headerRows,
body: rows,
tableWidth: 'auto',
startY: 143, // Start after the company name
headStyles: { fillColor: [255, 255, 255],valign: 'middle',halign:'center',font: 'NotoSans'}, // Custom header background color
bodyStyles: { fontSize: 11, textColor: 50, font: 'NotoSans',halign:'left',minCellHeight: rowHeight,valign: 'middle',cellPadding:.8}, // Set the custom font
theme: 'plain', // Table style
didDrawCell: (data) => {
const cell = data.cell;
const doc = data.doc;
doc.setLineWidth(0.4);
doc.setDrawColor(0, 0, 0);
doc.rect(cell.x, cell.y, cell.width, cell.height); // Draw borders manually
},
// Custom handling of superscript text and line breaks

margin: { top: 30 ,left:6 }, // Adjust top margin for table 
columnStyles: {
0: { cellWidth: 20 }, // Adjust the width for each column if needed
1: { cellWidth: 16 },
2: { cellWidth: 20 },
3: { cellWidth: 24 },
4: { cellWidth: 47 },
5: { cellWidth: 24 },
6: { cellWidth: 24 },
7: { cellWidth: 22 },
}
});
      // ------------Second table End------------------------
      doc.setFontSize(10);

       const downloadFileName = `shinsei-${("00000000" + shinseiId).slice(-8)}-${this.formatDatePdf(new Date())}.pdf`;
      doc.setProperties({
        title: downloadFileName
    })

      // // for phone-----------------
      if (window.innerWidth <= 500) { 
        // doc.save(downloadFileName);
        const pdfBlob = doc.output("blob");
      const pdfUrl = window.URL.createObjectURL(pdfBlob);
        const downloadLink = document.createElement("a");
        downloadLink.href = pdfUrl;
        downloadLink.download = `shinsei-${("00000000" +shinseiId).slice(-8
        )}-${this.formatDatePdf(new Date())}.pdf`; // Specify the file name
        downloadLink.style.display = "none"; // Hide the link
         // Append the link to the DOM and trigger the download
         document.body.appendChild(downloadLink);
         downloadLink.click();
         document.body.removeChild(downloadLink);
 
         // Revoke the object URL after download
         setTimeout(() => {
           window.URL.revokeObjectURL(pdfUrl);
         }, 100);
        
      }else{
      // // for phone---------------------------
      // Generate the PDF Blob
      const pdfBlob = doc.output('blob');
      // Create a URL for the Blob
      const pdfUrl = window.URL.createObjectURL(pdfBlob);
      // Open the PDF in an iframe within the same tab
      const iframe = document.createElement('iframe');
      iframe.style.position = 'absolute';
      iframe.style.top = '0';
      iframe.style.left = '0';
      iframe.style.width = '100%';
      iframe.style.height = '100%';  // Adjust the height to fit the screen
      iframe.src = pdfUrl;  // Set the iframe's source to the Blob URL
      // Append the iframe to the body of the page to display it
      document.body.appendChild(iframe);
      document.body.style.overflow = 'hidden'; 
    }
    } catch (error) {
      console.error("Error capturing element:", error);
    }
  }
}
