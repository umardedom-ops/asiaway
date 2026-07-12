import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import PdfPrinter from "pdfmake";

// Standard fonts for pdfmake
const fonts = {
  Roboto: {
    normal: 'Helvetica',
    bold: 'Helvetica-Bold',
    italics: 'Helvetica-Oblique',
    bolditalics: 'Helvetica-BoldOblique'
  }
};

export async function POST(req: Request) {
  try {
    const { month, year } = await req.json();

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Calculate dates
    const startDate = new Date(year, month - 1, 1).toISOString();
    const endDate = new Date(year, month, 1).toISOString();

    // Fetch transactions
    const { data: transactions } = await supabase
      .from('transactions')
      .select('*')
      .gte('created_at', startDate)
      .lt('created_at', endDate);

    let totalIncome = 0;
    let totalExpense = 0;
    let totalSalary = 0;
    let totalCost = 0;

    const tableBody = [
      ['Sana', 'Tur', 'Tavsif', 'Summa']
    ];

    transactions?.forEach(t => {
      if (t.type === 'income') totalIncome += Number(t.amount);
      if (t.type === 'expense') totalExpense += Number(t.amount);
      if (t.type === 'salary') totalSalary += Number(t.amount);
      if (t.type === 'cost') totalCost += Number(t.amount);

      tableBody.push([
        new Date(t.created_at).toLocaleDateString(),
        t.type.toUpperCase(),
        t.description || '-',
        `$${t.amount}`
      ]);
    });

    const netProfit = totalIncome - totalExpense - totalSalary - totalCost;

    const printer = new PdfPrinter(fonts);
    const docDefinition = {
      content: [
        { text: 'ASIA WAY - Oylik Moliya Hisoboti', style: 'header' },
        { text: `Sana: ${month}/${year}\n\n`, style: 'subheader' },
        {
          table: {
            widths: ['*', '*', '*', '*'],
            body: [
              ['Umumiy Tushum', 'Xarajatlar', 'Oyliklar', 'Tan Narxlar'],
              [`$${totalIncome}`, `$${totalExpense}`, `$${totalSalary}`, `$${totalCost}`]
            ]
          }
        },
        { text: `\nSOF FOYDA: $${netProfit}\n\n`, style: 'profit', color: netProfit >= 0 ? 'green' : 'red' },
        { text: 'Tranzaksiyalar Ro\'yxati', style: 'subheader' },
        {
          table: {
            headerRows: 1,
            widths: ['auto', 'auto', '*', 'auto'],
            body: tableBody
          }
        }
      ],
      styles: {
        header: { fontSize: 22, bold: true, margin: [0, 0, 0, 10] },
        subheader: { fontSize: 16, bold: true, margin: [0, 10, 0, 5] },
        profit: { fontSize: 18, bold: true, margin: [0, 20, 0, 20] }
      },
      defaultStyle: { font: 'Roboto' }
    };

    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    const chunks: Buffer[] = [];
    pdfDoc.on('data', (chunk) => chunks.push(chunk));
    
    const pdfPromise = new Promise<Buffer>((resolve) => {
      pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
    });
    
    pdfDoc.end();
    const pdfBuffer = await pdfPromise;

    // Send to Telegram
    const botToken = process.env.TELEGRAM_BOT_SHEF_TOKEN;
    
    // Get all Shef chat IDs from DB
    const { data: subscribers } = await supabase
      .from('bot_subscribers')
      .select('chat_id')
      .eq('role', 'shef');

    if (botToken && subscribers && subscribers.length > 0) {
      const pdfBlob = new Blob([pdfBuffer], { type: 'application/pdf' });

      for (const sub of subscribers) {
        const formData = new FormData();
        formData.append('chat_id', sub.chat_id.toString());
        formData.append('document', pdfBlob as any, `AsiaWay_Hisobot_${month}_${year}.pdf`);
        formData.append('caption', `📊 ${month}/${year} oyi uchun Moliya Hisoboti.\n💰 Sof Foyda: $${netProfit}`);

        await fetch(`https://api.telegram.org/bot${botToken}/sendDocument`, {
          method: 'POST',
          body: formData
        });
      }
    }

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Hisobot_${month}_${year}.pdf"`
      }
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
