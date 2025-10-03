import { jsPDF } from 'jspdf'

const MARGIN = 20 // mm
const COLORS = {
  primary: [37, 99, 235], // #2563eb
  primaryLight: [59, 130, 246],
  text: [30, 41, 59], // #1e293b
  muted: [100, 116, 139], // #64748b
  surface: [255, 255, 255],
  surfaceAlt: [245, 247, 250], // light bg for boxes
  border: [226, 232, 240], // #e2e8f0
}

function textBlockHeight(pdf, text, maxWidth, lineHeight) {
  const lines = pdf.splitTextToSize(text || '', maxWidth)
  return Math.max(lineHeight, lines.length * lineHeight)
}

function drawWrappedText(pdf, text, x, y, maxWidth, lineHeight, colorRgb, font='helvetica', style='normal', size=11) {
  pdf.setFont(font, style)
  pdf.setFontSize(size)
  if (colorRgb) pdf.setTextColor(...colorRgb)
  const lines = pdf.splitTextToSize(text || '', maxWidth)
  lines.forEach((line, i) => pdf.text(line, x, y + i * lineHeight))
  return y + lines.length * lineHeight
}

export function generatePDF(rdv) {
  const pdf = new jsPDF('p', 'mm', 'a4')
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const contentWidth = pageWidth - MARGIN * 2

  // Header
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(18)
  pdf.setTextColor(...COLORS.text)
  const headerY = 28
  pdf.text('RDV Edouard Lambert en Accompagnement', pageWidth / 2, headerY, { align: 'center' })
  // underline accent
  pdf.setDrawColor(...COLORS.primary)
  pdf.setLineWidth(1)
  pdf.line(pageWidth/2 - 30, headerY + 3, pageWidth/2 + 30, headerY + 3)

  // Info panel (dynamic height)
  const infoX = MARGIN
  const infoY = headerY + 10
  const infoPadding = 5
  const lineH = 6
  const infoLines = [
    `Client: ${rdv.clientName}`,
    `Date/Heure: ${rdv.date} ${rdv.time}`,
    `Lieu: ${rdv.location}`,
    `Conseiller: ${rdv.accompagnant}`,
  ]
  // measure
  let infoHeight = infoPadding * 2 + infoLines.length * lineH

  // box bg
  pdf.setDrawColor(...COLORS.border)
  pdf.setFillColor(...COLORS.surfaceAlt)
  pdf.roundedRect(infoX, infoY, contentWidth, infoHeight, 3, 3, 'FD')

  // text
  let ty = infoY + infoPadding + 4
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(12)
  pdf.setTextColor(...COLORS.text)
  infoLines.forEach((t) => {
    pdf.text(t, infoX + infoPadding, ty)
    ty += lineH
  })

  // Q&A section - compute heights first to distribute vertical space
  const qStartY = infoY + infoHeight + 10
  const qLineH = 6
  const qTitleSize = 12
  const aTextSize = 11

  const questions = [
    "Qu'est-ce qui a été nécessaire dans la préparation au(x) rendez-vous auxquel(s) vous avez assisté ?",
    "Qu'est-ce qui a été important dans le (les) 'entretien(s) de vente auxquel(s) vous avez participé ?",
    'Quel(s) éléments ont fait basculer la / les vente(s) ?',
    "Quel était, selon vous, l’objectif du client ? / par quelle(s) solution(s) était-il intéressé et pourquoi",
  ]

  const blocks = questions.map((q, idx) => {
    const qText = `Question ${idx + 1} : ${q}`
    const aText = `Réponse : ${((rdv.responses && rdv.responses[idx]) || '').trim()}`
    const qH = textBlockHeight(pdf, qText, contentWidth, qLineH)
    const aH = textBlockHeight(pdf, aText, contentWidth, qLineH)
    // add a little padding around answer block
    const blockH = qH + 2 + aH + 6
    return { qText, aText, qH, aH, blockH }
  })

  const usedUpToQ = qStartY
  const bottomLimit = pageHeight - MARGIN
  const available = bottomLimit - usedUpToQ
  const totalBlocksH = blocks.reduce((s, b) => s + b.blockH, 0)
  // distribute remaining height as gaps between blocks
  const gaps = blocks.length + 1
  const minGap = 4
  const extra = Math.max(0, available - totalBlocksH)
  const gap = minGap + extra / gaps

  // Draw Q&A with nice styles
  let y = qStartY + gap
  blocks.forEach((b) => {
    // Title
    pdf.setTextColor(...COLORS.primary)
    y = drawWrappedText(pdf, b.qText, MARGIN, y, contentWidth, qLineH, COLORS.primary, 'helvetica', 'bold', qTitleSize)
    y += 2
    // Answer shaded box
    const boxH = b.aH + 4
    pdf.setDrawColor(...COLORS.border)
    pdf.setFillColor(...COLORS.surfaceAlt)
    pdf.roundedRect(MARGIN, y, contentWidth, boxH, 2, 2, 'FD')
    y += 3
    pdf.setTextColor(...COLORS.text)
    y = drawWrappedText(pdf, b.aText, MARGIN + 3, y, contentWidth - 6, qLineH, COLORS.text, 'helvetica', 'normal', aTextSize)
    y += gap
  })

  // Footer subtle note (optional)
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(9)
  pdf.setTextColor(...COLORS.muted)
  pdf.text('Document généré automatiquement', pageWidth - MARGIN, pageHeight - 8, { align: 'right' })

  const safeName = String(rdv.clientName || 'Client').replace(/[^a-z0-9_-]+/gi, '_')
  const fileName = `RDV_${safeName}_${rdv.date}.pdf`
  pdf.save(fileName)
}
