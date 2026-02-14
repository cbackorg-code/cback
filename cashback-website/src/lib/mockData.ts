export interface Card {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
    maxCashbackRate: number;
}

export interface MerchantEntry {
    id: string;
    cardId: string;
    merchant: string;
    statementName: string;
    cashbackRate: string;
    contributor: string;
    date: string;
    comments: string;
    lastVerified: string;
    mcc?: string;
}

export const mockCards: Card[] = []; // Replaced by DB data

export const mockEntries: MerchantEntry[] = [
    // SBI Cashback Card Entries
    { id: "1", cardId: "sbi-cashback", merchant: "1mg via Tataneu", statementName: "TATA 1MG HEALTHCARE SOLUT110033 IN", cashbackRate: "5%", contributor: "Arkapal Sen", date: "16-Oct-24", comments: "", lastVerified: "17-Aug-2025", mcc: "5912" },
    { id: "2", cardId: "sbi-cashback", merchant: "1password", statementName: "1PASSWORD* TRIAL OVER TORONTO ON", cashbackRate: "5%", contributor: "akshayhs", date: "03-Apr-25", comments: "", lastVerified: "", mcc: "5734" },
    { id: "3", cardId: "sbi-cashback", merchant: "ABHIBUS", statementName: "ABHIBUS GURGAON IN", cashbackRate: "5%", contributor: "Thota", date: "25-Apr-25", comments: "", lastVerified: "17-Sep-2025" },
    { id: "4", cardId: "sbi-cashback", merchant: "Acko", statementName: "WWW ACKO COM GURGAON IN", cashbackRate: "5%", contributor: "Makeourdeal", date: "", comments: "", lastVerified: "" },
    { id: "5", cardId: "sbi-cashback", merchant: "ACT Fibernet", statementName: "ATRIA CONVERGENCE TECH MUMBAI In", cashbackRate: "0%", contributor: "Buddy_Maga", date: "26-Mar-25", comments: "", lastVerified: "" },
    { id: "6", cardId: "sbi-cashback", merchant: "ADOBE", statementName: "Adobe Systems Software Bangalore IN", cashbackRate: "0%", contributor: "", date: "01-Nov-24", comments: "", lastVerified: "" },
    { id: "7", cardId: "sbi-cashback", merchant: "Agoda", statementName: "PPSL* Agoda Company PTE Gurgaon HAR", cashbackRate: "5%", contributor: "Maulin", date: "09-Sep-25", comments: "Booked hotels in Agoda App, 5% cashback received", lastVerified: "02-Feb-26" },
    { id: "8", cardId: "sbi-cashback", merchant: "Agoda", statementName: "Agoda Company PTE LTD Mumbai IN", cashbackRate: "5%", contributor: "maximi", date: "21-Dec-24", comments: "Booked hotels in Agoda App, 5% cashback received", lastVerified: "27-May-2025" },
    { id: "9", cardId: "sbi-cashback", merchant: "Aha", statementName: "ARHA MEDIA AND BROADCASTING", cashbackRate: "0%", contributor: "Amarnath", date: "", comments: "", lastVerified: "" },
    { id: "10", cardId: "sbi-cashback", merchant: "Aha", statementName: "ARHA MEDIA AND BROADCA HYDERABAD IN", cashbackRate: "0%", contributor: "Rama", date: "07-Sep-25", comments: "", lastVerified: "7-Sep-2025" },
    { id: "11", cardId: "sbi-cashback", merchant: "Air India", statementName: "Air India", cashbackRate: "5%", contributor: "YzR", date: "", comments: "working as on 08 Aug 2025", lastVerified: "" },
    { id: "12", cardId: "sbi-cashback", merchant: "Air India Express", statementName: "WWWAIRINDIAEXPRESS MUMBAI IN", cashbackRate: "5%", contributor: "raghumahajan", date: "28-Nov-25", comments: "Seat selection payment was done.", lastVerified: "" },
    { id: "13", cardId: "sbi-cashback", merchant: "AirAsia", statementName: "AIRASIA-AKRB-FLT-INR KUALA LUMPUR MY", cashbackRate: "5%", contributor: "Vighnesh", date: "31-Aug-25", comments: "AirAsia Move App", lastVerified: "" },
    { id: "14", cardId: "sbi-cashback", merchant: "Airbnb", statementName: "Airbnb Payments India Gurgaon IND", cashbackRate: "5%", contributor: "Nesh", date: "22-Dec-24", comments: "5% cashback received", lastVerified: "" },
    { id: "15", cardId: "sbi-cashback", merchant: "Airtel Recharge", statementName: "Airtel Gurgaon IN", cashbackRate: "0%", contributor: "Saravanan", date: "25-Sep-25", comments: "5% cashback received, use payment method as Amazon Wallet", lastVerified: "" },
    { id: "16", cardId: "sbi-cashback", merchant: "AJIO", statementName: "RELIANCE PAYMEMT SOLUT THANE IN", cashbackRate: "1%", contributor: "", date: "", comments: "", lastVerified: "" },
    { id: "17", cardId: "sbi-cashback", merchant: "Akasa Air", statementName: "AKASA AIR WEB MUMBAI IN", cashbackRate: "5%", contributor: "Prateep", date: "11-Aug-25", comments: "5% cashback received", lastVerified: "" },
    { id: "18", cardId: "sbi-cashback", merchant: "Akshayakalpa", statementName: "AKSHAYAKALPA FARMS Bangalore IN", cashbackRate: "5%", contributor: "kaigalmane", date: "01-Sep-25", comments: "", lastVerified: "10-Sep-25" },
    { id: "19", cardId: "sbi-cashback", merchant: "Alibaba", statementName: "Alibaba.com Luxembourg LU", cashbackRate: "5%", contributor: "chidanand", date: "11-Nov-24", comments: "AliBaba 3.5%FX+18%GST", lastVerified: "29-Sep-2025" },
    { id: "20", cardId: "sbi-cashback", merchant: "All SI", statementName: "Netflix, Youtube, Hotstar etc....", cashbackRate: "0%", contributor: "Leo", date: "", comments: "", lastVerified: "" },
    { id: "21", cardId: "sbi-cashback", merchant: "Alliance Broadband", statementName: "PHONEPE BANGALORE IN", cashbackRate: "5%", contributor: "Coderanik", date: "26-Dec-24", comments: "From browser use AXIS Gateway and Use Phonepe under wallet option", lastVerified: "12-Dec-2024" },
    { id: "22", cardId: "sbi-cashback", merchant: "Amazon", statementName: "AMAZON PAY INDIA PRIVA Bangalore IN", cashbackRate: "5%", contributor: "vishal", date: "28-Jan-26", comments: "buy amazon gift card from amazon", lastVerified: "28-Jan-2026" },
    { id: "23", cardId: "sbi-cashback", merchant: "Amazon Flights", statementName: "AMAZON FLIGHTS BANGALORE IN", cashbackRate: "5%", contributor: "Chaitanya", date: "20-Nov-24", comments: "5% cashback received", lastVerified: "" },
    { id: "24", cardId: "sbi-cashback", merchant: "Amazon GV", statementName: "WWW AMAZON IN 1243054000 IN", cashbackRate: "5%", contributor: "Arkapal Sen", date: "13-Oct-24", comments: "", lastVerified: "21-Jan-2025" },
    { id: "25", cardId: "sbi-cashback", merchant: "Amazon GV or Shopping", statementName: "AMAZON PAY INDIA PRIVA BANGALORE IN", cashbackRate: "5%", contributor: "Apeksh", date: "11-Nov-24", comments: "received 5% cashback on Amazon Pay", lastVerified: "26-Oct-2025" },
    { id: "26", cardId: "sbi-cashback", merchant: "Amazon Japan", statementName: "AMAZON IRCTC MUMBAI IN", cashbackRate: "5%", contributor: "kn0w1", date: "01-Sep-24", comments: "Purchased in INR using Amazon conversion", lastVerified: "" },
    { id: "27", cardId: "sbi-cashback", merchant: "Amazon prime subscription payment", statementName: "AMAZON UTILITIES MUMBAI IN", cashbackRate: "", contributor: "sumit", date: "18-Aug-24", comments: "in sms merchant name was AMAZON, paid 1499, no cb.", lastVerified: "" },
    { id: "28", cardId: "sbi-cashback", merchant: "APEPDCL", statementName: "APEPDCL MUMBAI IN", cashbackRate: "5%", contributor: "dreamchild", date: "10-Dec-24", comments: "eb bill pay from official website APEPDCL", lastVerified: "10-Dec-2024" },
    { id: "29", cardId: "sbi-cashback", merchant: "Balmer Lawrie", statementName: "BALMAPP", cashbackRate: "", contributor: "Vins", date: "05-Feb-25", comments: "Website, pending statement generation", lastVerified: "" },
    { id: "30", cardId: "sbi-cashback", merchant: "Blissclub", statementName: "BLISSCLUB FITNESS PRIV BANGALORE IN", cashbackRate: "5%", contributor: "Eragon", date: "22-Nov-24", comments: "", lastVerified: "" },
    { id: "31", cardId: "sbi-cashback", merchant: "blusmart", statementName: "RAZ*BLU-SMART MOBILITY HTTPS://BLU-S IN", cashbackRate: "5%", contributor: "rohit", date: "20-Aug-24", comments: "", lastVerified: "" },
    { id: "32", cardId: "sbi-cashback", merchant: "BookMyShow", statementName: "ORBGEN TECHNOLOGIES PR Chennai IN", cashbackRate: "5%", contributor: "dreamchild", date: "02-Dec-24", comments: "booked movie ticket from BMS app", lastVerified: "2-Dec-2024" },
    { id: "33", cardId: "sbi-cashback", merchant: "Cashify app or cashify b2b app", statementName: "WWW CASHIFY COM BANGALORE IN", cashbackRate: "5%", contributor: "Arkapal Sen", date: "12-Oct-24", comments: "buying refurbished smartphone", lastVerified: "" },
    { id: "34", cardId: "sbi-cashback", merchant: "casestories.in", statementName: "DHAIRYA PRITESH VORA THANE IN", cashbackRate: "5%", contributor: "CyberPsych", date: "04-Oct-24", comments: "", lastVerified: "" },
    { id: "35", cardId: "sbi-cashback", merchant: "ClearTrip", statementName: "Paytm_CLEARTRIPPRIVATE MUMBAI IN", cashbackRate: "0%", contributor: "AlekhyaDas", date: "05-Nov-24", comments: "- Paid for bus,train - no CB", lastVerified: "" },
    { id: "36", cardId: "sbi-cashback", merchant: "Clinikally", statementName: "Clinikally Gurgaon IN", cashbackRate: "5%", contributor: "SAI", date: "01-Nov-24", comments: "", lastVerified: "29-Sep-2025" },
    { id: "37", cardId: "sbi-cashback", merchant: "DeoDap", statementName: "RAZ*DeoDap jkot GJ IN", cashbackRate: "5%", contributor: "chidanand", date: "06-Oct-24", comments: "Deodap dropshipping", lastVerified: "" },
    { id: "38", cardId: "sbi-cashback", merchant: "Dot & Key", statementName: "Dot And Key skincare kolkata inc", cashbackRate: "5%", contributor: "vedant", date: "24-Jan-25", comments: "", lastVerified: "" },
    { id: "39", cardId: "sbi-cashback", merchant: "Eatclub", statementName: "Ease My Trip Delhi IN", cashbackRate: "5%", contributor: "Hemanth", date: "21-Dec-24", comments: "", lastVerified: "" },
    { id: "40", cardId: "sbi-cashback", merchant: "Ebay", statementName: "eBay O*13-12303-47927 San Jose CA", cashbackRate: "5%", contributor: "chidanand", date: "11-Nov-24", comments: "Ebay international. 3.5%FX+18%GST", lastVerified: "" },
    { id: "41", cardId: "sbi-cashback", merchant: "Fedex", statementName: "FEDEX TSCS PVT LTD MUMBAI IN", cashbackRate: "5%", contributor: "chidanand", date: "06-Nov-24", comments: "", lastVerified: "" },
    { id: "42", cardId: "sbi-cashback", merchant: "Flipkart Grocery", statementName: "FLIPKART GROCERY IN", cashbackRate: "5%", contributor: "Karan", date: "23-Jan-25", comments: "gave 5% cashback on flipkart supermart (grocery)....", lastVerified: "" },
    { id: "43", cardId: "sbi-cashback", merchant: "Friday Style", statementName: "Kuberlo Hyderabad IN", cashbackRate: "0%", contributor: "Anonymous", date: "24-Dec-24", comments: "Shows jewellery MCC", lastVerified: "" },
    { id: "44", cardId: "sbi-cashback", merchant: "Goibibo Hotel or Flight Booking", statementName: "IBIBO GROUP PRIVATE LI GURGAON IN", cashbackRate: "0%", contributor: "AlekhyaDas", date: "01-Sep-24", comments: "", lastVerified: "" },
    { id: "45", cardId: "sbi-cashback", merchant: "Google Pay", statementName: "GPAY FASTAG MUMBAI IN", cashbackRate: "5%", contributor: "Sugavanesh", date: "11-Feb-25", comments: "Added card to GPAY app. Recharged fastag via card.", lastVerified: "9-Feb-2025" },
    { id: "46", cardId: "sbi-cashback", merchant: "Gostops", statementName: "Gostops Hospitality Pv CentralDelhi IN", cashbackRate: "5%", contributor: "SAI", date: "01-Nov-24", comments: "", lastVerified: "" },
    { id: "47", cardId: "sbi-cashback", merchant: "Gyftr SBI", statementName: "", cashbackRate: "0%", contributor: "Rakesh", date: "13-Nov-24", comments: "no cashback on SBI GYFTR portal", lastVerified: "5-Jan-2026" },
    { id: "48", cardId: "sbi-cashback", merchant: "Headphone Zone", statementName: "HEADPHONE ZONE PRIV Chennai IN", cashbackRate: "5%", contributor: "anon@420", date: "07-Feb-25", comments: "", lastVerified: "" },
    { id: "49", cardId: "sbi-cashback", merchant: "Indigo", statementName: "INDIGO AIRLINE GURGAON IN", cashbackRate: "5%", contributor: "chidanand", date: "27-Nov-24", comments: "", lastVerified: "4-Jun-2025" },
    { id: "50", cardId: "sbi-cashback", merchant: "Indigo", statementName: "INDIGO AIRLINE GURGAON HAR", cashbackRate: "5%", contributor: "Nesh", date: "20-Dec-24", comments: "Received 5% cashback", lastVerified: "20-Dec-2024" },
    { id: "51", cardId: "sbi-cashback", merchant: "Ixigo", statementName: "IXIGO BANGALORE IN", cashbackRate: "0%", contributor: "", date: "05-Nov-24", comments: "", lastVerified: "" },
    { id: "52", cardId: "sbi-cashback", merchant: "JioFibre Recharge", statementName: "Jio Platforms Limite Mumbai IN", cashbackRate: "5%", contributor: "SA", date: "10-Nov-24", comments: "", lastVerified: "" },
    { id: "53", cardId: "sbi-cashback", merchant: "JioFibre Recharge", statementName: "myjio", cashbackRate: "", contributor: "Vinayak", date: "10-Jan-25", comments: "Paid Jiofibre bill today, will update if cb received", lastVerified: "" },
    { id: "54", cardId: "sbi-cashback", merchant: "Ketch(Highlander clothing and other stuff)", statementName: "GETKETCH BANGALORE IN", cashbackRate: "5%", contributor: "S4", date: "01-Dec-24", comments: "Highlander clothing", lastVerified: "" },
    { id: "55", cardId: "sbi-cashback", merchant: "KPN", statementName: "KPN FARM FRESH PVT LTD COIMBATORE IN", cashbackRate: "0%", contributor: "dreamchild", date: "27-Nov-24", comments: "kpn grocery purchase", lastVerified: "27-Nov-2024" },
    { id: "56", cardId: "sbi-cashback", merchant: "Lap Gadgets", statementName: "RAZ*Lap Gadgets Surat GJ IN", cashbackRate: "5%", contributor: "Buddy_Maga", date: "11-Nov-24", comments: "", lastVerified: "" },
    { id: "57", cardId: "sbi-cashback", merchant: "Magicpin", statementName: "SAMAST TECHNOLOGIES PR", cashbackRate: "0%", contributor: "vissu295", date: "07-Dec-24", comments: "Bought GV", lastVerified: "11-Dec-2024" },
    { id: "58", cardId: "sbi-cashback", merchant: "Mahajan Electronics", statementName: "RAZ*MAHAJAN ELECTRONIC WWW.MAHAJANEL IN", cashbackRate: "5%", contributor: "anon@420", date: "09-Feb-25", comments: "", lastVerified: "" },
    { id: "59", cardId: "sbi-cashback", merchant: "makemytrip", statementName: "Cleartrip Private Limi Mumbai IN", cashbackRate: "5%", contributor: "chidanand", date: "12-Nov-24", comments: "", lastVerified: "" },
    { id: "60", cardId: "sbi-cashback", merchant: "Man Company", statementName: "THE MAN COMPANY GURGAON IN", cashbackRate: "5%", contributor: "Mohsin", date: "24-Dec-24", comments: "Helios Lifestyle Pvt Ltd Gurugram", lastVerified: "" },
    { id: "61", cardId: "sbi-cashback", merchant: "Meesho", statementName: "Myntra Designs Pvt Ltd BANGALORE IN", cashbackRate: "5%", contributor: "AlekhyaDas", date: "22-Aug-24", comments: "", lastVerified: "24-Dec-2024" },
    { id: "62", cardId: "sbi-cashback", merchant: "Nearbuy", statementName: "NEARBUY INDIA PVT LTD NOIDA IN", cashbackRate: "5%", contributor: "Buddy_Maga", date: "26-Jan-25", comments: "", lastVerified: "" },
    { id: "63", cardId: "sbi-cashback", merchant: "Nightingale Diaries", statementName: "SRINIVAS FINE ARTS PVT MUMBAI IN", cashbackRate: "5%", contributor: "Buddy_Maga", date: "02-Jan-25", comments: "", lastVerified: "" },
    { id: "64", cardId: "sbi-cashback", merchant: "NSDL PAN CARD", statementName: "NSDL BILLDESK MUMBAI IN", cashbackRate: "0%", contributor: "Rakesh", date: "22-Nov-24", comments: "no cashback on pan card application", lastVerified: "22-Nov-2024" },
    { id: "65", cardId: "sbi-cashback", merchant: "Order Your HSRP", statementName: "HSRP MUMBAI IN", cashbackRate: "5%", contributor: "Buddy_Maga", date: "19-Nov-24", comments: "45337", lastVerified: "" },
    { id: "66", cardId: "sbi-cashback", merchant: "Park+", statementName: "PARKPLUS IO NEW DELHI IN", cashbackRate: "5%", contributor: "Buddy_Maga", date: "06-Oct-24", comments: "Received cashback for IOCL voucher purchase", lastVerified: "31-Aug-25" },
    { id: "67", cardId: "sbi-cashback", merchant: "Park+ Myntra Gift card (park+ gives 6% off)", statementName: "Perviom technologies p https://parkp in", cashbackRate: "5%", contributor: "sumit, Sona", date: "01-Aug-24", comments: "paid electricity bill of 3500, didn't receive cb.Edit: Sona: paid for petrol but got 5% CB", lastVerified: "2-Aug-2025" },
    { id: "68", cardId: "sbi-cashback", merchant: "Park+ Myntra Gift card (park+ gives 6% off)", statementName: "PARKPLUS IO 9686689225 IN", cashbackRate: "5%", contributor: "Arkapal Sen", date: "16-Oct-24", comments: "testing myntra gift card in park+ for 5% or not", lastVerified: "" },
    { id: "69", cardId: "sbi-cashback", merchant: "playo", statementName: "Playo TechMash Solu Bangalore", cashbackRate: "5%", contributor: "rohit", date: "10-Oct-24", comments: "", lastVerified: "" },
    { id: "70", cardId: "sbi-cashback", merchant: "PlayStation membeship via ps app", statementName: "PlayStation Network LONDON GB", cashbackRate: "5%", contributor: "Ekavya", date: "24-Nov-24", comments: "Working as of May-2025", lastVerified: "30-Nov-2025" },
    { id: "71", cardId: "sbi-cashback", merchant: "Redbus", statementName: "REDBUS INDIA PRIVATE Bangalore IN", cashbackRate: "1%", contributor: "Deepak", date: "06-Nov-24", comments: "", lastVerified: "" },
    { id: "72", cardId: "sbi-cashback", merchant: "Redrail", statementName: "REDBUS BANGALORE IN", cashbackRate: "5%", contributor: "Gnani", date: "17-Nov-24", comments: "RedRail train booking", lastVerified: "14-Mar-2025" },
    { id: "73", cardId: "sbi-cashback", merchant: "Redrail", statementName: "RAZ*Redbus India Priva Bengaluru IN", cashbackRate: "0%", contributor: "sugavanesh", date: "11-Feb-25", comments: "RedRail train booking via mobile web. No cashback for the merchant name shown", lastVerified: "20-Sep-25" },
    { id: "74", cardId: "sbi-cashback", merchant: "RELIANCE J", statementName: "RELIANCE JIO INFOCOMM NOIDA IN", cashbackRate: "0%", contributor: "Deepak", date: "05-Nov-24", comments: "JIO prepaid recharge | No cashback", lastVerified: "29-Jun-2025" },
    { id: "75", cardId: "sbi-cashback", merchant: "Reliance retail limited", statementName: "Nakpro Nutrition Bengaluru IN", cashbackRate: "5%", contributor: "SAI", date: "01-Nov-24", comments: "", lastVerified: "" },
    { id: "76", cardId: "sbi-cashback", merchant: "Robu", statementName: "MACFOS LIMITED MUMBAI IN", cashbackRate: "5%", contributor: "anon@420", date: "02-Feb-25", comments: "", lastVerified: "" },
    { id: "77", cardId: "sbi-cashback", merchant: "SDM Ayurveda", statementName: "SDM YOGA AND NATURE CU SALAYA IN", cashbackRate: "5%", contributor: "chidanand", date: "26-Oct-24", comments: "", lastVerified: "" },
    { id: "78", cardId: "sbi-cashback", merchant: "SNITCH", statementName: "CAS*EC WHEELS INDIA PRIV", cashbackRate: "5%", contributor: "S4", date: "01-Dec-24", comments: "Snitch clothing", lastVerified: "" },
    { id: "79", cardId: "sbi-cashback", merchant: "Socials Bangalore", statementName: "DOTPE IN GURGAON IN", cashbackRate: "5%", contributor: "Eragon", date: "08-Nov-24", comments: "Paid using the dot.pe ordering site", lastVerified: "" },
    { id: "80", cardId: "sbi-cashback", merchant: "Souled Store", statementName: "The Souled Store PVT L Mumbai IN", cashbackRate: "5%", contributor: "Aditya", date: "21-Nov-24", comments: "", lastVerified: "" },
    { id: "81", cardId: "sbi-cashback", merchant: "Stanverse App (Amazon GV)", statementName: "STANVERSE TECHNOLOGIES Bengaluru IN", cashbackRate: "0%", contributor: "chidanand", date: "29-Oct-24", comments: "Raised complaint with RBI ombudsman. categorised as edu hence 0", lastVerified: "" },
    { id: "82", cardId: "sbi-cashback", merchant: "Starbucks Load", statementName: "STARBUCKS IN GURGAON IN", cashbackRate: "5%", contributor: "mgforce", date: "20-Oct-24", comments: "Loaded Rs 1000 into Starbucks Card", lastVerified: "" },
    { id: "83", cardId: "sbi-cashback", merchant: "Swiggy", statementName: "Swiggy IN Bangalore IN", cashbackRate: "5%", contributor: "AlekhyaDas", date: "05-Nov-24", comments: "", lastVerified: "" },
    { id: "84", cardId: "sbi-cashback", merchant: "Tata Simply Better", statementName: "RAZ*TATA CONSUMER PROD Mumbai MH IN", cashbackRate: "", contributor: "Buddy_Maga", date: "24-Oct-24", comments: "", lastVerified: "" },
    { id: "85", cardId: "sbi-cashback", merchant: "Tickertape", statementName: "Tickertape Bengaluru", cashbackRate: "5%", contributor: "rohit", date: "15-Aug-24", comments: "", lastVerified: "" },
    { id: "86", cardId: "sbi-cashback", merchant: "Timezone", statementName: "Timezone Entertainment INM IN", cashbackRate: "5%", contributor: "mgforce", date: "20-Oct-24", comments: "", lastVerified: "" },
    { id: "87", cardId: "sbi-cashback", merchant: "Titan", statementName: "Titan Company Limited Hosur IN", cashbackRate: "5%", contributor: "", date: "19-Nov-24", comments: "", lastVerified: "" },
    { id: "88", cardId: "sbi-cashback", merchant: "Tool World", statementName: "KWATRA ENTERPRISES North Delhi IN", cashbackRate: "5%", contributor: "anon@420", date: "09-Feb-25", comments: "", lastVerified: "" },
    { id: "89", cardId: "sbi-cashback", merchant: "URBAN COMPANY APP", statementName: "WWW URBANCLAP IN", cashbackRate: "0%", contributor: "AlekhyaDas", date: "01-Nov-24", comments: "", lastVerified: "" },
    { id: "90", cardId: "sbi-cashback", merchant: "VegNonVeg", statementName: "VEGNONVEG NEW DELHI IN", cashbackRate: "5%", contributor: "", date: "17-Dec-24", comments: "", lastVerified: "" },
    { id: "91", cardId: "sbi-cashback", merchant: "West Bengal Tourism", statementName: "WEST BENGAL TOURISM DE KOLKATA IN", cashbackRate: "5%", contributor: "AlekhyaDas", date: "05-Nov-24", comments: "", lastVerified: "" },
    { id: "92", cardId: "sbi-cashback", merchant: "Woohoo", statementName: "Pay*PINE LABS PRIVATE LIMITED WWW.WOOHOO.IN IN", cashbackRate: "0%", contributor: "manishholla", date: "01-Nov-24", comments: "Bought Amazon Prime Shopping Edition Voucher", lastVerified: "1-Nov-2024" },
    { id: "93", cardId: "sbi-cashback", merchant: "Zapvi", statementName: "Zapvi Surat IN", cashbackRate: "5%", contributor: "Anonymous", date: "24-Dec-24", comments: "Paid online on Zapvi website", lastVerified: "" },
    { id: "94", cardId: "sbi-cashback", merchant: "Zepto", statementName: "RAZ*GEDDIT CONVENIENCE HTTPS://WWW.Z IN", cashbackRate: "5%", contributor: "AlekhyaDas", date: "01-Nov-24", comments: "", lastVerified: "" },
    { id: "95", cardId: "sbi-cashback", merchant: "Zingoy Rupay Card", statementName: "www.zingoy.com Mumbai IN", cashbackRate: "0%", contributor: "Arkapal Sen", date: "13-Oct-24", comments: "2500rs rupay zingoy card", lastVerified: "" },

    // PhonePe Black - Sample entries (you can add more)
    { id: "96", cardId: "phonepe-black", merchant: "Swiggy", statementName: "Swiggy IN Bangalore IN", cashbackRate: "10%", contributor: "User1", date: "01-Jan-25", comments: "Premium card benefits", lastVerified: "" },
    { id: "97", cardId: "phonepe-black", merchant: "Zomato", statementName: "ZOMATO GURGAON IN", cashbackRate: "10%", contributor: "User2", date: "05-Jan-25", comments: "", lastVerified: "" },

    // Swiggy HDFC - Sample entries
    { id: "98", cardId: "swiggy-hdfc", merchant: "Swiggy", statementName: "Swiggy IN Bangalore IN", cashbackRate: "10%", contributor: "User3", date: "10-Jan-25", comments: "Best for Swiggy orders", lastVerified: "" },
    { id: "99", cardId: "swiggy-hdfc", merchant: "Swiggy Instamart", statementName: "SWIGGY INSTAMART BANGALORE IN", cashbackRate: "5%", contributor: "User4", date: "15-Jan-25", comments: "", lastVerified: "" },

    // Amazon Pay ICICI - Sample entries
    { id: "100", cardId: "amazon-pay-icici", merchant: "Amazon", statementName: "AMAZON PAY INDIA PRIVA BANGALORE IN", cashbackRate: "5%", contributor: "User5", date: "20-Jan-25", comments: "Great for Amazon shopping", lastVerified: "" },
    { id: "101", cardId: "amazon-pay-icici", merchant: "Amazon Prime", statementName: "AMAZON PRIME MUMBAI IN", cashbackRate: "5%", contributor: "User6", date: "25-Jan-25", comments: "", lastVerified: "" },
];

export interface Comment {
    id: string;
    merchantId: string;
    user: string;
    date: string;
    time: string;
    content: string;
    avatar?: string; // Optional avatar color/initials
}

export const mockComments: Comment[] = [
    { id: "c1", merchantId: "7", user: "Maulin", date: "09-Sep-25", time: "10:30 AM", content: "Confirmed 5% cashback on recent booking.", avatar: "bg-blue-500" },
    { id: "c2", merchantId: "7", user: "Traveler99", date: "12-Sep-25", time: "2:15 PM", content: "Works for pay at hotel too?", avatar: "bg-green-500" },
    { id: "c3", merchantId: "8", user: "maximi", date: "21-Dec-24", time: "09:45 AM", content: "Make sure to use the app for consistent cashback.", avatar: "bg-purple-500" },
    { id: "c4", merchantId: "12", user: "raghumahajan", date: "28-Nov-25", time: "11:20 AM", content: "Seat selection count as airline spend, got 5%.", avatar: "bg-red-500" },
    { id: "c5", merchantId: "22", user: "vishal", date: "28-Jan-26", time: "04:50 PM", content: "Gift card trick still working perfectly.", avatar: "bg-yellow-500" },
    { id: "c6", merchantId: "28", user: "dreamchild", date: "10-Dec-24", time: "01:10 PM", content: "APEPDCL website payment confirmed.", avatar: "bg-indigo-500" },
];
