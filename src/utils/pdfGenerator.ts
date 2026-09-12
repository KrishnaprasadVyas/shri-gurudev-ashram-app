import * as Print from 'expo-print'
import { Asset } from 'expo-asset'
import * as FileSystem from 'expo-file-system/legacy'
import type { SevaReceiptData } from '../types/seva'
import type { TravelReceiptData } from '../components/TravelReceipt'
import { formatDateIST } from './date'
import { getSevaLabel } from '../constants/seva'
import * as Sharing from 'expo-sharing'
import { Alert, Platform } from 'react-native'

function numberToWords(num: number): string {
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  if ((num = num || 0) === 0) return 'Zero';
  if (num < 0) return 'Negative ' + numberToWords(Math.abs(num));

  let str = '';
  if (num > 99999) {
    str += numberToWords(Math.floor(num / 100000)) + 'Lakh ';
    num %= 100000;
  }
  if (num > 999) {
    str += numberToWords(Math.floor(num / 1000)) + 'Thousand ';
    num %= 1000;
  }
  if (num > 99) {
    str += a[Math.floor(num / 100)] + 'Hundred ';
    num %= 100;
  }
  if (num > 0) {
    if (str !== '') {
      str += 'and ';
    }
    if (num < 20) {
      str += a[num];
    } else {
      str += b[Math.floor(num / 10)];
      if (num % 10 > 0) {
        str += ' ' + a[num % 10];
      }
    }
  }
  return str.trim();
}

const getAssetBase64 = async (module: any): Promise<string> => {
  try {
    const [asset] = await Asset.loadAsync(module)
    if (asset.localUri) {
      const base64 = await FileSystem.readAsStringAsync(asset.localUri, { encoding: FileSystem.EncodingType.Base64 })
      return `data:image/jpeg;base64,${base64}`
    }
  } catch (e) {
    console.error('Error loading asset for PDF', e)
  }
  return ''
}

export type ReceiptSourceData = {
  type: 'seva' | 'travel' | 'donation'
  sevaData?: SevaReceiptData | null
  travelData?: TravelReceiptData | null
  donationData?: any
}

export async function generateReceiptHtml(source: ReceiptSourceData): Promise<string> {
  console.log('[pdfGenerator] Generating receipt HTML for type:', source.type)
  const logoBase64 = await getAssetBase64(require('../../assets/recieptLogo.jpeg'))
  const gurudevBase64 = await getAssetBase64(require('../../assets/gurudev.jpeg'))
  console.log('[pdfGenerator] Assets loaded — logo:', logoBase64 ? 'YES' : 'NO', 'gurudev:', gurudevBase64 ? 'YES' : 'NO')

  let receiptNo = ''
  let date = ''
  let donorName = ''
  let mobileEmail = ''
  let address = ''
  let pan = ''
  let onAccountOf = ''
  let paymentMode = ''
  let amount = 0

  if (source.type === 'seva' && source.sevaData) {
    const d = source.sevaData
    receiptNo = d.receiptNumber
    date = formatDateIST(d.transactionDate, { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '/')
    donorName = d.sponsorName || d.devotee || '—'
    
    const phone = d.sponsorPhone || d.phone || ''
    const email = (d as any).email || ''
    if (phone && email) mobileEmail = `${phone} | ${email}`
    else mobileEmail = phone || email || '—'
    
    address = (d as any).address || '—'
    pan = (d.identityType === 'pan' && d.identityNumberMasked) ? d.identityNumberMasked : '—'
    
    let cause = getSevaLabel(d.sevaType).title || 'General Fund'
    if (d.bookingPurpose) cause += ` (${d.bookingPurpose})`
    onAccountOf = cause

    paymentMode = d.paymentMethod || 'Online'
    amount = d.amount
  } else if (source.type === 'travel' && source.travelData) {
    const d = source.travelData
    receiptNo = d.bookingReference
    date = d.createdAt ? formatDateIST(d.createdAt, { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '/') : '—'
    donorName = d.fullName || '—'
    mobileEmail = d.phoneNumber || '—'
    address = '—'
    pan = '—'
    onAccountOf = d.packageTitle || 'Yatra Booking'
    paymentMode = 'Razorpay / Online'
    amount = d.totalAmount
  }

  const amountInWords = numberToWords(amount)

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Donation Receipt</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700;900&display=swap');
        
        body {
          font-family: 'Times New Roman', Times, serif;
          margin: 0;
          padding: 30px;
          background: #fff;
          color: #000;
          width: 595px;
          max-width: 595px;
        }

        .receipt-container {
          border: 1px solid #F0703B;
          border-radius: 20px;
          padding: 20px 20px 40px 20px;
          position: relative;
          min-height: 800px;
        }

        /* HEADER */
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 2px solid #F0703B;
          padding-bottom: 15px;
          margin-bottom: 20px;
        }

        .header-left {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 15%;
        }
        .header-left .reg-no {
          color: #DC2626;
          font-size: 11px;
          font-family: 'Roboto', sans-serif;
          margin-bottom: 4px;
        }
        .header-left img {
          width: 100px;
          height: auto;
        }
        .header-left .donation-receipt {
          color: #DC2626;
          font-weight: bold;
          font-size: 13px;
          margin-top: 15px;
          font-family: 'Roboto', sans-serif;
          text-align: center;
        }

        .header-center {
          width: 65%;
          text-align: center;
          padding: 0 10px;
        }
        .trust-name {
          color: #B91C1C;
          font-size: 26px;
          font-weight: 900;
          font-family: 'Times New Roman', serif;
          line-height: 1.1;
          margin: 0;
          letter-spacing: 0.5px;
        }
        .address-line {
          font-size: 12px;
          color: #333;
          margin: 4px 0;
          font-family: 'Roboto', sans-serif;
        }
        .bold-text {
          font-weight: bold;
        }

        .header-right {
          width: 20%;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .header-right img {
          width: 120px;
          height: auto;
        }
        .gurudev-name {
          font-size: 10px;
          text-align: center;
          margin-top: 5px;
          font-family: 'Roboto', sans-serif;
        }

        /* RECEIPT NO & DATE */
        .receipt-info-row {
          display: flex;
          justify-content: space-between;
          font-family: 'Times New Roman', serif;
          font-weight: bold;
          font-size: 18px;
          margin-bottom: 25px;
          padding: 0 10px;
        }

        /* TABLE */
        .donor-table {
          width: 100%;
          border-collapse: collapse;
          border: 1px solid #D1D5DB;
          font-family: 'Times New Roman', serif;
          font-size: 16px;
        }
        .donor-table td {
          border: 1px solid #D1D5DB;
          padding: 14px 18px;
          vertical-align: top;
        }
        .donor-table tr td:first-child {
          width: 30%;
          font-weight: bold;
        }
        .donor-table tr td:last-child {
          width: 70%;
        }

        .amount-row td {
          background-color: #F3F4F6;
        }
        .amount-row td:first-child {
          font-weight: bold;
        }
        .amount-value {
          font-weight: bold;
          font-size: 18px;
        }
        .amount-words {
          font-weight: normal;
          font-size: 15px;
          color: #4B5563;
        }

        /* FOOTER */
        .footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 40px;
          padding: 0 10px;
        }
        .exemption-text {
          font-family: 'Times New Roman', serif;
          font-size: 16px;
          line-height: 1.5;
        }
        .seal-circle {
          width: 90px;
          height: 90px;
          border-radius: 45px;
          border: 2px solid #1E3A8A;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          color: #1E3A8A;
          font-family: 'Roboto', sans-serif;
          font-weight: bold;
          text-transform: uppercase;
        }
        .seal-inner {
          width: 80px;
          height: 80px;
          border-radius: 40px;
          border: 1px solid #1E3A8A;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        .seal-text-top {
          font-size: 8px;
          position: absolute;
          width: 70px;
          text-align: center;
          top: 12px;
        }
        .seal-text-center {
          font-size: 10px;
        }
        .seal-text-bottom {
          font-size: 7px;
          position: absolute;
          width: 70px;
          text-align: center;
          bottom: 12px;
        }
      </style>
    </head>
    <body>
      <div class="receipt-container">
        <!-- HEADER -->
        <div class="header">
          <div class="header-left">
            <div class="reg-no">Regd. No. E-594</div>
            ${logoBase64 ? `<img src="${logoBase64}" alt="Logo" />` : ''}
            <div class="donation-receipt">DONATION RECEIPT</div>
          </div>
          
          <div class="header-center">
            <h1 class="trust-name">SWAMI HARICHAITANYA SHANTI<br/>ASHRAM TRUST</h1>
            <p class="address-line">Head Office : Datala, Malkapur, Dist. Buldhana, Maharashtra - 443102 (INDIA)</p>
            <p class="address-line">Branch Office : Palasakhed Sapkal, Chikhali, Dist. Buldhana, Maharashtra 443001</p>
            <p class="address-line"><span class="bold-text">Mob.:+91 9158740007, 9834151577, 9422881942</span></p>
            <p class="address-line"><span class="bold-text">E-mail : info@shrigurudevashram.org | Website : www.shrigurudevashram.org</span></p>
          </div>

          <div class="header-right">
            ${gurudevBase64 ? `<img src="${gurudevBase64}" alt="Gurudev" />` : ''}
            <div class="gurudev-name">Swami Harichaitanyanand Saraswati Ji Maharaj</div>
          </div>
        </div>

        <!-- RECEIPT NO & DATE -->
        <div class="receipt-info-row">
          <div>Receipt No. : ${receiptNo}</div>
          <div>Date : ${date}</div>
        </div>

        <!-- DONOR DETAILS TABLE -->
        <table class="donor-table">
          <tr>
            <td>Donor Name</td>
            <td>${donorName}</td>
          </tr>
          <tr>
            <td>Mobile & Email</td>
            <td>${mobileEmail}</td>
          </tr>
          <tr>
            <td>Address</td>
            <td>${address}</td>
          </tr>
          <tr>
            <td>PAN</td>
            <td>${pan}</td>
          </tr>
          <tr>
            <td>On Account of</td>
            <td>${onAccountOf}</td>
          </tr>
          <tr>
            <td>Payment Mode</td>
            <td>${paymentMode}</td>
          </tr>
          <tr class="amount-row">
            <td>Donation Amount</td>
            <td>
              <span class="amount-value">Rs ${amount}</span> 
              <span class="amount-words">(${amountInWords} Only)</span>
            </td>
          </tr>
        </table>

        <!-- FOOTER / EXEMPTION -->
        <div class="footer">
          <div class="exemption-text">
            Exemption order ref no. AAQTS3485B24PN02<br/>
            Valid upto. 2027-28
          </div>
          <div class="seal-circle" style="position: relative;">
            <div class="seal-inner">
              <div class="seal-text-top">SWAMI HARICHAITANYA</div>
              <div class="seal-text-center">Regd.<br/>No. E-594</div>
              <div class="seal-text-bottom">SHANTI ASHRAM TRUST</div>
            </div>
          </div>
        </div>

      </div>
    </body>
    </html>
  `
}

export async function generateAndShareReceiptPdf(source: ReceiptSourceData) {
  try {
    const isAvailable = await Sharing.isAvailableAsync()
    if (!isAvailable) {
      Alert.alert('Sharing Unavailable', 'Sharing is not available on this device.')
      return
    }

    const html = await generateReceiptHtml(source)
    const { uri } = await Print.printToFileAsync({ html })

    // Determine filename
    let filename = 'Receipt.pdf'
    if (source.type === 'seva' && source.sevaData) {
      filename = `Seva_Receipt_${source.sevaData.receiptNumber || 'Pending'}.pdf`
    } else if (source.type === 'travel' && source.travelData) {
      filename = `Travel_Receipt_${source.travelData.bookingReference || 'Pending'}.pdf`
    } else if (source.type === 'donation' && source.donationData) {
      filename = `Donation_Receipt_${source.donationData.receiptNumber || 'Pending'}.pdf`
    }

    // Rename file by copying it to cache directory so share sheet shows correct name/type
    const newUri = `${FileSystem.cacheDirectory}${filename}`
    await FileSystem.copyAsync({ from: uri, to: newUri })

    console.log('[pdfGenerator] Sharing PDF:', newUri)
    await Sharing.shareAsync(newUri, {
      UTI: 'com.adobe.pdf',
      mimeType: 'application/pdf',
      dialogTitle: 'Share Receipt',
    })
  } catch (e) {
    console.error('[pdfGenerator] Share failed:', e)
    Alert.alert('Error', 'Failed to generate and share the receipt PDF.')
  }
}

export async function generateAndDownloadReceiptPdf(source: ReceiptSourceData) {
  try {
    const html = await generateReceiptHtml(source)
    const { uri } = await Print.printToFileAsync({ html })

    let filename = 'Receipt.pdf'
    if (source.type === 'seva' && source.sevaData) {
      filename = `Seva_Receipt_${source.sevaData.receiptNumber || 'Pending'}.pdf`
    } else if (source.type === 'travel' && source.travelData) {
      filename = `Travel_Receipt_${source.travelData.bookingReference || 'Pending'}.pdf`
    } else if (source.type === 'donation' && source.donationData) {
      filename = `Donation_Receipt_${source.donationData.receiptNumber || 'Pending'}.pdf`
    }

    if (Platform.OS === 'android') {
      const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync()
      if (permissions.granted) {
        const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 })
        const newUri = await FileSystem.StorageAccessFramework.createFileAsync(permissions.directoryUri, filename, 'application/pdf')
        await FileSystem.writeAsStringAsync(newUri, base64, { encoding: FileSystem.EncodingType.Base64 })
        console.log('[pdfGenerator] PDF downloaded to:', newUri)
        Alert.alert('Success', 'PDF downloaded successfully.')
      } else {
        Alert.alert('Permission Denied', 'Storage permission is required to save the PDF.')
      }
    } else {
      const isAvailable = await Sharing.isAvailableAsync()
      if (!isAvailable) {
        Alert.alert('Sharing Unavailable', 'Sharing is not available on this device.')
        return
      }
      const newUri = `${FileSystem.cacheDirectory}${filename}`
      await FileSystem.copyAsync({ from: uri, to: newUri })
      await Sharing.shareAsync(newUri, {
        UTI: 'com.adobe.pdf',
        mimeType: 'application/pdf',
        dialogTitle: 'Download / Save PDF',
      })
    }
  } catch (e) {
    console.error('[pdfGenerator] Download failed:', e)
    Alert.alert('Error', 'Failed to save PDF to device.')
  }
}
