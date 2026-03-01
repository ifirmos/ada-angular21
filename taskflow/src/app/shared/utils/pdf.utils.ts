import jsPDF from 'jspdf';
import autoTable, { RowInput } from 'jspdf-autotable';
import { Transacao, TipoTransacao } from '../../main-panel/pages/transactions/models/transacao.model';

export interface ConfiguracaoRelatorio {
  titulo: string;
  subtitulo?: string;
  nomeArquivo: string;
  nomeTitular?: string;
}
function formatarMoedaBr(valor: number): string {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
function formatarData(dataIso: string): string {
  const data = new Date(dataIso);
  return data.toLocaleDateString('pt-BR');
}


function labelTipo(tipo: TipoTransacao): string {
  switch (tipo) {
    case TipoTransacao.RECEITA:
      return 'Entrada';
    case TipoTransacao.DESPESA:
      return 'Saída';
    case TipoTransacao.TRANSFERENCIA:
      return 'Transferência';
    default:
      return tipo;
  }
}

export function exportarTransacoesParaPdf(
  transacoes: Transacao[],
  config: ConfiguracaoRelatorio,
  periodoInicio?: Date,
  periodoFim?: Date,
): void {
  const doc = new jsPDF();

  const dataGeracao = new Date().toLocaleString('pt-BR');

  doc.setFillColor(30, 41, 59); // dark slate
  doc.rect(0, 0, 210, 30, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Banco X', 14, 13);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(config.titulo, 14, 22);

  doc.setTextColor(40, 40, 40);
  doc.setFontSize(9);

  let cursorY = 38;

  if (config.nomeTitular) {
    doc.text(`Titular: ${config.nomeTitular}`, 14, cursorY);
    cursorY += 6;
  }

  doc.text(`Emitido em: ${dataGeracao}`, 14, cursorY);
  cursorY += 6;

  if (periodoInicio && periodoFim) {
    const inicio = periodoInicio.toLocaleDateString('pt-BR');
    const fim = periodoFim.toLocaleDateString('pt-BR');
    doc.text(`Período: ${inicio} a ${fim}`, 14, cursorY);
    cursorY += 6;
  }

  doc.text(`Total de registros: ${transacoes.length}`, 14, cursorY);
  cursorY += 8;

  doc.setDrawColor(200, 200, 200);
  doc.line(14, cursorY, 196, cursorY);
  cursorY += 4;

  const linhas: RowInput[] = transacoes.map((t) => [
    formatarData(t.data),
    t.descricao,
    labelTipo(t.tipo),
    formatarMoedaBr(t.valor),
  ]);

  const tiposPorLinha = transacoes.map((t) => t.tipo);

  autoTable(doc, {
    startY: cursorY,
    head: [['Data', 'Descrição', 'Tipo', 'Valor']],
    body: linhas,
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: { fillColor: [245, 247, 250] },
    columnStyles: {
      3: { halign: 'right' },
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 3) {
        const tipo = tiposPorLinha[data.row.index];
        if (tipo === TipoTransacao.RECEITA) {
          data.cell.styles.textColor = [22, 163, 74]; // verde
        } else {
          data.cell.styles.textColor = [220, 38, 38]; // vermelho
        }
      }
    },
  });

  const totalPaginas = doc.getNumberOfPages();
  for (let i = 1; i <= totalPaginas; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `TaskFlow | Relatório gerado em ${dataGeracao} | Pág. ${i}/${totalPaginas}`,
      14,
      285,
    );
  }

  doc.save(`${config.nomeArquivo}.pdf`);
}
