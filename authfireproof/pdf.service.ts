import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

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
    providedIn: 'root',
})
export class PdfService {
    constructor() { }

    async generatePdf(fireproofList: any[]) {

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
        const formattedDate = `${year}年${month}月${day}日 ${hour}:${minute}:${second}`;

        // Generate PDF-------------------------
        const doc = new jsPDF();
        const fontUrl = '/assets/fonts/NotoSansCJKtc-Regular.ttf';

        // Load the custom font
        const fontBytes = await fetch(fontUrl).then(res => res.arrayBuffer());
        const fontBase64 = arrayBufferToBase64(fontBytes);

        // Embed the custom font
        doc.addFileToVFS('NotoSansCJKtc-Regular.ttf', fontBase64);
        doc.addFont('NotoSansCJKtc-Regular.ttf', 'NotoSans', 'normal');
        doc.setFont('NotoSans'); // Set the custom font

     // Add company information as a two-column table
     const companyInfoHeaders = [['会社別防火認定番号マスタ 印刷画面（サイズ「A4」用紙の向き「縦」にして印刷してください）']];

autoTable(doc, {
  head: companyInfoHeaders,
  startY: 20,
  tableWidth: 'auto',
  theme: 'plain',
  headStyles: { fillColor: [230, 230, 230], textColor: [0, 0, 0] },
  styles: { font: 'NotoSans',halign:'center' },
});

     const companyInfoBody = [
      ['認定取得者名', fireproofList[0].company_name || 'トキワ工業株式会社'],
    ];

     autoTable(doc, {
       body: companyInfoBody,
       startY: 30,
       theme: 'grid',
       styles: { fontSize: 10, halign: 'center', font: 'NotoSans' },
       columnStyles: {
         0: { cellWidth: 40,fillColor: [200, 200, 200] }, // Column 1 width (認定取得者名)
         1: { cellWidth: 100 }, // Column 2 width (会社名)
       }
     });


        // Define complex table headers
        const headerRows = [
            [
                { content: '認定コード', rowSpan: 2 },
                { content: '認定重量', rowSpan: 2 },
                { content: '防火性能／直張り', colSpan: 4 }, // Merges into 3 columns below
                { content: '仮認定商品分類コード番号' }, // Merges into 4 columns below
            ],
            [
                { content: '不燃下地' },
                { content: '不燃石膏' },
                { content: '準不燃 ' },
                { content: '金属' },
                { content: '取得会社' }
            ]
        ];

        // Map the rows based on your dynamic data
        const rows = fireproofList.map(item => [
            item.certified_products_classification_code,
            item.authorization_fireproofing_weight,
            item.fire_performance_fireproof_undercoat_number,
            item.fire_performance_fireproof_plaster_number,
            item.fire_performance_quasi_incombustible_number,
            item.fire_performance_metal_number,
            item.provisional_fireproofing_company_name,
        ]);

    // Use autoTable to generate the table with complex headers
    autoTable(doc, {
      head: headerRows,
      body: rows,
      tableWidth: 'auto',
      startY: 40, // Start after the company name
      headStyles: { fillColor: [200, 200, 200], textColor: [0, 0, 0] }, // Custom header background color
      styles: { fontSize: 9, textColor: 50, font: 'NotoSans',halign:'center'}, // Set the custom font
      theme: 'grid', // Table style
      margin: { top: 30 }, // Adjust top margin for table
      columnStyles: {
        0: { cellWidth: 25 }, // Adjust the width for each column if needed
        1: { cellWidth: 25 },
        2: { cellWidth: 20 },
        3: { cellWidth: 20 },
        4: { cellWidth: 20 },
        5: { cellWidth: 20 },
        6: { cellWidth: 45 },
      }
    });
        doc.setFontSize(10);
        doc.text(
            '※表示の内容は、今日現在の日本壁装協会壁紙品質情報管理システムに登録されている情報です。',
            14,
            doc.internal.pageSize.getHeight() - 50
        );
        doc.text(`(${formattedDate})`, 14, doc.internal.pageSize.getHeight() - 45);

        // Save the generated PDF
        const pdfBlob = doc.output('blob');
        const pdfUrl = window.URL.createObjectURL(pdfBlob);
        window.open(pdfUrl);
    }
}
