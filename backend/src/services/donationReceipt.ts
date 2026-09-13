import fs from 'fs'
import path from 'path'
import PDFDocument from 'pdfkit'

export function getCanonicalReceiptDir(): string {
  const cwd = process.cwd()
  const baseDir = path.basename(cwd) === 'backend' ? cwd : path.join(cwd, 'backend')
  return path.resolve(baseDir, 'receipts')
}

export async function generateReceipt(donation: any) {
  const dir = getCanonicalReceiptDir()
  await fs.promises.mkdir(dir, { recursive: true })
  const filePath = path.join(dir, `receipt_${donation._id}.pdf`)
  await new Promise<void>((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 })
    const stream = fs.createWriteStream(filePath)
    stream.on('finish', resolve)
    stream.on('error', reject)
    doc.pipe(stream)
    doc.fontSize(20).text('Shri Gurudev Ashram', { align: 'center' })
    doc.moveDown().fontSize(14).text('Donation Receipt', { align: 'center' })
    doc.moveDown().fontSize(11)
    doc.text(`Receipt No.: ${donation.receiptNumber ?? 'N/A'}`)
    doc.text(`Donor: ${donation.donor?.anonymousDisplay ? 'Anonymous Donor' : donation.donor?.name ?? '-'}`)
    doc.text(`Mobile: ${donation.donor?.mobile ?? '-'}`)
    doc.text(`Cause: ${donation.donationHead?.name ?? '-'}`)
    doc.text(`Amount: INR ${donation.amount}`)
    doc.text(`Payment: ${donation.paymentMethod ?? 'ONLINE'}`)
    doc.text(`Transaction ID: ${donation.paymentId ?? donation.transactionRef ?? 'N/A'}`)
    doc.moveDown().text('Thank you for your generous contribution.')
    doc.end()
  })
  return filePath
}

export function publicReceiptUrl(filePath: string, donation?: any) {
  if (donation?._id && donation?.receiptToken) {
    return `/api/donations/${donation._id}/receipt?token=${donation.receiptToken}`
  }
  if (donation?._id) {
    return `/api/donations/${donation._id}/receipt`
  }
  const idFromFilename = path.basename(filePath, '.pdf').replace('receipt_', '')
  return `/api/donations/${idFromFilename}/receipt`
}
