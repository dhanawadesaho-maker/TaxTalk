// TaxBot AI Response System with Context Memory
export interface TaxQuery {
  keywords: string[];
  responses: string[];
  followUp?: string;
  category: string;
}

export interface ConversationContext {
  userId: string;
  previousQueries: string[];
  currentTopic?: string;
  userProfile?: {
    isCA: boolean;
    businessType?: string;
    previousTopics: string[];
  };
}

// Store conversation contexts
const conversationContexts = new Map<string, ConversationContext>();

export const taxQueries: TaxQuery[] = [
  // Payment Process Queries
  {
    keywords: ['payment', 'pay tax', 'tax payment', 'advance tax', 'self assessment', 'challan'],
    category: 'payment',
    responses: [
      "**Tax Payment Process in India:**\n\n💳 **Online Payment Methods:**\n• Net Banking through authorized banks\n• Debit/Credit cards\n• NEFT/RTGS\n• UPI payments\n\n📋 **Payment Types:**\n• **Advance Tax**: Pay in 4 installments (15% by Jun 15, 45% by Sep 15, 75% by Dec 15, 100% by Mar 15)\n• **Self Assessment Tax**: Pay with ITR filing\n• **Regular Assessment**: After receiving demand notice\n\n🏦 **Steps to Pay:**\n1. Visit NSDL/tin-nsdl.com or incometaxindia.gov.in\n2. Select 'Pay Tax' option\n3. Choose challan type (280 for Income Tax)\n4. Enter PAN, assessment year, tax type\n5. Make payment and save challan\n\n⚠️ **Important**: Always save payment receipts for ITR filing!\n\nNeed help with specific payment scenarios?",
      
      "**Tax Payment Guidelines:**\n\n🗓️ **Payment Deadlines:**\n• Advance Tax: Quarterly (Jun 15, Sep 15, Dec 15, Mar 15)\n• TDS: 7th of next month\n• GST: 20th of next month\n• Annual Tax: July 31st with ITR\n\n💰 **Payment Calculation:**\n• Use income tax calculator on official website\n• Consider TDS already deducted\n• Add interest if paying late (1% per month)\n\n🔢 **Challan Types:**\n• ITNS 280: Income Tax\n• ITNS 281: TDS\n• ITNS 284: Self Assessment\n\n📱 **Quick Payment Tips:**\n• Use mobile apps for instant payment\n• Set reminders for due dates\n• Keep digital copies of all challans\n\nWhich specific payment do you need help with?"
    ]
  },

  // Required Documents
  {
    keywords: ['documents', 'required documents', 'papers needed', 'what documents', 'document list', 'paperwork'],
    category: 'documents',
    responses: [
      "**Required Documents for Tax Filing:**\n\n📄 **For Salaried Individuals:**\n• Form 16 from employer\n• Salary slips (all 12 months)\n• Bank statements\n• PAN Card\n• Aadhaar Card\n• Investment proofs (80C, 80D)\n• Home loan statements\n• Rent receipts (if claiming HRA)\n\n💼 **For Business/Professionals:**\n• Books of accounts\n• Profit & Loss statement\n• Balance Sheet\n• Bank statements (all accounts)\n• Purchase/Sales invoices\n• TDS certificates\n• Audit report (if applicable)\n\n🏠 **For Property Income:**\n• Rental agreements\n• Property tax receipts\n• Maintenance bills\n• Municipal tax receipts\n\n💹 **For Capital Gains:**\n• Purchase/Sale deeds\n• Broker statements\n• Indexation calculations\n• Investment proofs for exemptions\n\nWhich category applies to your situation?",
      
      "**Document Checklist by Income Type:**\n\n👨‍💼 **Salary Income:**\n✅ Form 16/16A\n✅ Salary certificate\n✅ Bank interest certificates\n✅ Investment receipts\n\n🏢 **Business Income:**\n✅ GST returns\n✅ Audited financials\n✅ Purchase/sales records\n✅ Expense vouchers\n\n🏘️ **Rental Income:**\n✅ Rent agreements\n✅ Property documents\n✅ Repair/maintenance bills\n✅ Municipal tax receipts\n\n📈 **Investment Income:**\n✅ Dividend statements\n✅ Mutual fund statements\n✅ Fixed deposit receipts\n✅ Capital gains statements\n\n💡 **Pro Tips:**\n• Maintain digital copies\n• Organize by financial year\n• Keep supporting documents for 6 years\n\nNeed specific document guidance for your income type?"
    ]
  },

  // Deadlines
  {
    keywords: ['deadline', 'due date', 'last date', 'when to file', 'filing date', 'time limit'],
    category: 'deadlines',
    responses: [
      "**Important Tax Deadlines for FY 2023-24:**\n\n📅 **Income Tax Deadlines:**\n• **ITR Filing**: July 31, 2024 (individuals)\n• **Audit Cases**: October 31, 2024\n• **Revised Returns**: December 31, 2024\n• **Belated Returns**: March 31, 2025 (with penalty)\n\n💼 **Business Deadlines:**\n• **Company ITR**: September 30, 2024\n• **Tax Audit**: September 30, 2024\n• **Transfer Pricing**: November 30, 2024\n\n💰 **Advance Tax Dates:**\n• **1st Installment**: June 15, 2024 (15%)\n• **2nd Installment**: September 15, 2024 (45%)\n• **3rd Installment**: December 15, 2024 (75%)\n• **4th Installment**: March 15, 2025 (100%)\n\n📊 **GST Deadlines:**\n• **GSTR-1**: 11th of next month\n• **GSTR-3B**: 20th of next month\n• **Annual Return**: December 31st\n\n⚠️ **Late Filing Penalties:**\n• Up to ₹10,000 for ITR\n• Interest @1% per month\n• Loss of carry forward benefits\n\nWhich deadline are you concerned about?",
      
      "**Monthly Tax Calendar:**\n\n📆 **Every Month:**\n• **7th**: TDS deposit due\n• **11th**: GSTR-1 filing\n• **15th**: PF deposit\n• **20th**: GSTR-3B filing\n\n🗓️ **Quarterly:**\n• **Advance Tax**: 15th of Jun/Sep/Dec/Mar\n• **TDS Returns**: End of month following quarter\n• **GST Returns**: Various dates\n\n📋 **Annual Deadlines:**\n• **July 31**: Individual ITR filing\n• **September 30**: Company ITR, Tax Audit\n• **October 31**: Audit case ITR\n• **December 31**: Revised ITR, GST Annual Return\n\n⏰ **Time Management Tips:**\n• Set calendar reminders\n• Prepare documents in advance\n• File early to avoid last-minute rush\n• Use CA services for complex cases\n\n🚨 **Penalty Avoidance:**\n• File even if you can't pay immediately\n• Use presumptive taxation if eligible\n• Maintain proper records throughout the year\n\nNeed help planning for upcoming deadlines?"
    ]
  },

  // Income Tax
  {
    keywords: ['income tax', 'itr', 'tax return', 'filing', 'return file', 'tax calculation'],
    category: 'income_tax',
    responses: [
      "**Complete Income Tax Filing Guide:**\n\n📋 **Step-by-Step ITR Process:**\n1. **Determine ITR Form**: ITR-1 (salary), ITR-2 (capital gains), ITR-3 (business), ITR-4 (presumptive)\n2. **Gather Documents**: Form 16, bank statements, investment proofs\n3. **Calculate Income**: Add all income sources\n4. **Claim Deductions**: 80C, 80D, 80E, etc.\n5. **Compute Tax**: Apply tax slabs\n6. **Adjust TDS/Advance Tax**: Reduce from total tax\n7. **File Online**: Use income tax portal\n8. **Verify**: E-verify or send signed copy\n\n💰 **Tax Slabs 2023-24 (New Regime):**\n• Up to ₹3 lakh: Nil\n• ₹3-6 lakh: 5%\n• ₹6-9 lakh: 10%\n• ₹9-12 lakh: 15%\n• ₹12-15 lakh: 20%\n• Above ₹15 lakh: 30%\n\n📊 **Common Deductions:**\n• 80C: ₹1.5 lakh (EPF, PPF, ELSS, Insurance)\n• 80D: ₹25,000 (Health Insurance)\n• 80E: Education loan interest\n• 24B: Home loan interest\n\nWhich ITR form do you need help with?",
      
      "**ITR Filing Made Simple:**\n\n🎯 **Choose Right ITR Form:**\n• **ITR-1**: Salary + interest income only\n• **ITR-2**: Salary + capital gains/losses\n• **ITR-3**: Business/professional income\n• **ITR-4**: Presumptive business income\n\n💻 **Online Filing Process:**\n1. Visit incometaxindia.gov.in\n2. Register/Login with PAN\n3. Select appropriate ITR form\n4. Fill income details\n5. Add deductions and exemptions\n6. Calculate tax liability\n7. Submit and e-verify\n\n🔍 **Common Mistakes to Avoid:**\n• Wrong ITR form selection\n• Missing income sources\n• Incorrect bank account details\n• Not claiming eligible deductions\n• Late filing penalties\n\n✅ **Post-Filing Checklist:**\n• Download acknowledgment\n• Verify within 120 days\n• Keep all documents safe\n• Track refund status\n\n💡 **Pro Tips:**\n• File early to avoid technical issues\n• Use pre-filled data from AIS\n• Double-check all calculations\n• Maintain digital records\n\nNeed help with specific income calculations?"
    ]
  },

  // GST
  {
    keywords: ['gst', 'goods and services tax', 'gstr', 'input credit', 'tax credit', 'gst registration'],
    category: 'gst',
    responses: [
      "**Complete GST Guide:**\n\n📝 **GST Registration Process:**\n1. **Eligibility Check**: Turnover > ₹40 lakhs (₹20 lakhs for services)\n2. **Online Application**: Visit gstn.org.in\n3. **Required Documents**: PAN, Aadhaar, business proof, bank statement\n4. **Application Review**: 3-7 working days\n5. **GSTIN Issued**: 15-digit unique number\n\n💰 **GST Rate Structure:**\n• **0%**: Essential items (rice, wheat, milk)\n• **5%**: Basic necessities (sugar, tea, medicines)\n• **12%**: Standard items (computers, processed food)\n• **18%**: Most goods and services\n• **28%**: Luxury items (cars, tobacco, aerated drinks)\n\n📊 **GST Returns Schedule:**\n• **GSTR-1**: Sales return (11th of next month)\n• **GSTR-3B**: Summary return (20th of next month)\n• **GSTR-9**: Annual return (December 31st)\n\n🔄 **Input Tax Credit (ITC):**\n• Claim credit on business purchases\n• Match with supplier's GSTR-1\n• Use for paying output tax\n• Cannot claim on personal expenses\n\n📱 **GST Compliance Tips:**\n• Maintain proper invoices\n• File returns on time\n• Reconcile ITC regularly\n• Use GST software for accuracy\n\nWhich GST aspect do you need help with?",
      
      "**GST Registration & Compliance:**\n\n🏢 **Who Must Register:**\n• Turnover > ₹40 lakhs (goods)\n• Turnover > ₹20 lakhs (services)\n• Inter-state supply (any amount)\n• E-commerce sellers\n• Input service distributors\n\n📋 **Registration Documents:**\n• PAN card of business\n• Aadhaar of authorized signatory\n• Business registration certificate\n• Bank account statement\n• Address proof of business premises\n• Digital signature (for companies)\n\n💻 **Online Registration Steps:**\n1. Create account on GST portal\n2. Fill GST REG-01 form\n3. Upload required documents\n4. Submit application with DSC/EVC\n5. Receive ARN (Application Reference Number)\n6. Wait for verification\n7. Get GSTIN certificate\n\n⚡ **Quick Registration Tips:**\n• Ensure all documents are clear\n• Use correct business address\n• Provide active mobile/email\n• Keep PAN details consistent\n\n🔧 **Post-Registration Setup:**\n• Download GST certificate\n• Update business documents\n• Set up accounting software\n• Train staff on GST compliance\n\nNeed help with GST registration process?"
    ]
  },

  // TDS
  {
    keywords: ['tds', 'tax deducted at source', 'tds return', 'tds rate', 'form 16', 'tds certificate'],
    category: 'tds',
    responses: [
      "**Complete TDS Guide:**\n\n💰 **TDS Rates & Thresholds:**\n• **Salary**: As per tax slabs (no TDS if annual < ₹2.5L)\n• **Professional Fees**: 10% (if > ₹30,000 annually)\n• **Rent**: 10% (if monthly > ₹50,000)\n• **Interest on Securities**: 10% (if > ₹5,000)\n• **Commission/Brokerage**: 5% (if > ₹15,000)\n• **Contractor Payments**: 1-2% (if > ₹30,000)\n\n📅 **TDS Compliance Calendar:**\n• **Deduction**: At time of payment\n• **Deposit**: By 7th of next month\n• **Returns**: Quarterly (Q1: Jul 31, Q2: Oct 31, Q3: Jan 31, Q4: May 31)\n• **Certificates**: Issue within prescribed time\n\n📋 **TDS Return Forms:**\n• **Form 24Q**: Salary TDS\n• **Form 26Q**: Non-salary TDS\n• **Form 27Q**: TDS on payments to non-residents\n• **Form 27EQ**: TCS (Tax Collected at Source)\n\n🔍 **TDS Certificate Details:**\n• Deductor details (TAN, name, address)\n• Deductee details (PAN, name)\n• Payment details (amount, TDS, date)\n• Challan details for verification\n\n⚠️ **Penalties for Non-Compliance:**\n• Late deposit: 1.5% interest per month\n• Non-deduction: Equal to TDS amount\n• Late filing: ₹200 per day\n\nWhich TDS scenario do you need help with?",
      
      "**TDS for Different Payment Types:**\n\n👨‍💼 **Salary TDS:**\n• Calculate annual tax liability\n• Deduct monthly based on projection\n• Adjust in March for actual income\n• Issue Form 16 by June 15\n\n💼 **Professional Services TDS:**\n• 10% on fees > ₹30,000 annually\n• Includes legal, medical, technical services\n• Issue TDS certificate quarterly\n• File Form 26Q\n\n🏠 **Rent TDS:**\n• 10% if monthly rent > ₹50,000\n• Applicable for individuals/HUFs\n• Get PAN from landlord\n• Higher rate if no PAN provided\n\n💹 **Investment TDS:**\n• Interest on FD/bonds: 10%\n• Dividend: 10% (if > ₹5,000)\n• Mutual fund redemption: Varies\n• Submit Form 15G/15H if no tax liability\n\n🔧 **TDS Management Tips:**\n• Maintain TDS register\n• Verify PAN of payees\n• Use TDS software for accuracy\n• Reconcile with Form 26AS\n• Keep all challan receipts\n\nNeed help calculating TDS for specific payments?"
    ]
  },

  // Business Registration
  {
    keywords: ['business registration', 'company registration', 'llp', 'partnership', 'proprietorship', 'startup'],
    category: 'business',
    responses: [
      "**Business Registration Guide:**\n\n🏢 **Business Structure Comparison:**\n\n**1. Sole Proprietorship:**\n• ✅ Easiest to start, minimal compliance\n• ✅ Complete control, direct tax benefits\n• ❌ Unlimited liability, limited growth potential\n• 💰 Cost: ₹5,000-10,000\n\n**2. Partnership Firm:**\n• ✅ Shared responsibility, easy formation\n• ✅ Tax benefits, flexible management\n• ❌ Unlimited liability, partner disputes\n• 💰 Cost: ₹10,000-15,000\n\n**3. LLP (Limited Liability Partnership):**\n• ✅ Limited liability, tax benefits\n• ✅ Flexible structure, perpetual existence\n• ❌ Annual compliance, audit requirements\n• 💰 Cost: ₹15,000-25,000\n\n**4. Private Limited Company:**\n• ✅ Limited liability, credibility, funding options\n• ✅ Perpetual succession, tax planning\n• ❌ High compliance, complex structure\n• 💰 Cost: ₹20,000-35,000\n\n📋 **Common Registration Requirements:**\n• PAN cards of promoters\n• Address proof of registered office\n• Identity proof of directors/partners\n• MOA & AOA (for companies)\n• Partnership deed (for partnerships)\n\nWhich business structure interests you?",
      
      "**Step-by-Step Business Registration:**\n\n🚀 **For Private Limited Company:**\n1. **Name Reservation**: Apply for unique name (RUN service)\n2. **Digital Signature**: Obtain DSC for directors\n3. **Director Identification**: Get DIN for all directors\n4. **SPICe+ Form**: File incorporation form\n5. **Bank Account**: Open current account\n6. **PAN & TAN**: Apply for tax registrations\n7. **GST Registration**: If turnover threshold met\n\n📝 **Required Documents:**\n• Identity proof (Aadhaar, Passport)\n• Address proof (utility bills, rent agreement)\n• Passport size photographs\n• Registered office proof\n• NOC from property owner\n• Bank statement of promoters\n\n⏱️ **Timeline & Costs:**\n• **Processing Time**: 10-15 days\n• **Government Fees**: ₹4,000-8,000\n• **Professional Fees**: ₹10,000-20,000\n• **Total Investment**: ₹15,000-30,000\n\n🎯 **Post-Incorporation Steps:**\n• Open business bank account\n• Apply for necessary licenses\n• Set up accounting system\n• Comply with labor laws\n• File annual returns\n\n💡 **Pro Tips:**\n• Choose business-friendly state\n• Plan for future funding needs\n• Understand compliance requirements\n• Consult CA for tax planning\n\nNeed help with specific registration process?"
    ]
  },

  // Tax Saving
  {
    keywords: ['tax saving', '80c', '80d', 'investment', 'deduction', 'exemption', 'save tax'],
    category: 'tax_saving',
    responses: [
      "**Complete Tax Saving Guide:**\n\n💰 **Section 80C Investments (₹1.5 Lakh Limit):**\n• **EPF Contribution**: Automatic deduction, 12% interest\n• **PPF**: 15-year lock-in, tax-free returns\n• **ELSS Mutual Funds**: 3-year lock-in, market returns\n• **Life Insurance**: Premium up to 10% of sum assured\n• **NSC**: 5-year term, compound interest\n• **Tax Saver FD**: 5-year lock-in, guaranteed returns\n• **Home Loan Principal**: Reduces outstanding amount\n• **Tuition Fees**: Children's education expenses\n\n🏥 **Section 80D - Health Insurance:**\n• **Self/Family**: ₹25,000 (₹50,000 if senior citizen)\n• **Parents**: ₹25,000 (₹50,000 if senior citizen)\n• **Total Maximum**: ₹1 lakh per year\n• **Preventive Health Checkup**: ₹5,000 additional\n\n🎓 **Other Key Deductions:**\n• **80E**: Education loan interest (no limit)\n• **80G**: Donations to approved funds\n• **80TTA/TTB**: Interest on savings account\n• **24B**: Home loan interest (₹2 lakh)\n\n📊 **Tax Planning Strategy:**\n1. **Start Early**: Begin investments in April\n2. **Diversify**: Don't put all money in one option\n3. **Consider Goals**: Align with financial objectives\n4. **Review Annually**: Adjust based on income changes\n\nWhich tax saving option suits your needs?",
      
      "**Smart Tax Saving Strategies:**\n\n🎯 **Best Tax Saving Investments by Risk:**\n\n**Low Risk (Guaranteed Returns):**\n• **PPF**: 7.1% tax-free, 15-year lock-in\n• **NSC**: 6.8% taxable, 5-year term\n• **Tax Saver FD**: 5-7% taxable, 5-year lock-in\n• **EPF**: 8.15% tax-free, job-linked\n\n**Medium Risk (Balanced):**\n• **ELSS Funds**: 10-12% potential, 3-year lock-in\n• **Hybrid Funds**: 8-10% potential, tax efficient\n• **Balanced Advantage Funds**: Dynamic allocation\n\n**Goal-Based Planning:**\n• **Retirement**: PPF + EPF + NPS\n• **Children's Education**: ELSS + Sukanya Samriddhi\n• **Home Purchase**: Home loan principal + ELSS\n• **Emergency Fund**: Liquid funds + savings account\n\n💡 **Advanced Tax Planning:**\n• **Salary Restructuring**: Convert salary to allowances\n• **HRA Optimization**: Claim maximum HRA benefit\n• **Medical Reimbursement**: ₹15,000 tax-free\n• **LTA**: Travel allowance optimization\n• **Food Coupons**: ₹2,200 per month tax-free\n\n📈 **Investment Timing:**\n• **April-December**: Systematic investment\n• **January-March**: Last-minute investments\n• **Avoid**: Lump sum in March (poor planning)\n\nNeed personalized tax saving advice?"
    ]
  },

  // Capital Gains
  {
    keywords: ['capital gains', 'ltcg', 'stcg', 'property sale', 'shares', 'mutual funds', 'capital loss'],
    category: 'capital_gains',
    responses: [
      "**Complete Capital Gains Guide:**\n\n📊 **Types of Capital Gains:**\n\n**Short Term Capital Gains (STCG):**\n• **Equity Shares**: 15% (if STT paid), holding < 12 months\n• **Mutual Funds**: 15% (equity), 20% (debt), holding < 12/36 months\n• **Property**: As per tax slab, holding < 24 months\n• **Other Assets**: As per tax slab, holding < 36 months\n\n**Long Term Capital Gains (LTCG):**\n• **Equity Shares**: 10% above ₹1 lakh (if STT paid)\n• **Equity Mutual Funds**: 10% above ₹1 lakh\n• **Property**: 20% with indexation benefit\n• **Debt Mutual Funds**: 20% with indexation\n\n🏠 **Property Capital Gains Exemptions:**\n• **Section 54**: Reinvest in residential property\n• **Section 54F**: Reinvest entire sale proceeds\n• **Section 54EC**: Invest in capital gain bonds (₹50 lakh limit)\n\n💹 **Equity Investment Tax Planning:**\n• **Harvest Losses**: Book losses to offset gains\n• **Hold for Long Term**: Benefit from lower tax rates\n• **Use ₹1 Lakh Exemption**: Plan LTCG realization\n• **SIP Strategy**: Reduce average cost, stagger gains\n\n📋 **Capital Gains Calculation:**\n1. **Sale Price**: Actual sale consideration\n2. **Less**: Cost of acquisition (indexed for LTCG)\n3. **Less**: Cost of improvement (indexed)\n4. **Less**: Expenses on transfer\n5. **Result**: Capital gain/loss\n\nNeed help calculating your capital gains?",
      
      "**Capital Gains Tax Planning:**\n\n🎯 **Strategic Planning for Different Assets:**\n\n**Equity Shares & Mutual Funds:**\n• **Timing**: Hold for >12 months for LTCG benefit\n• **Loss Harvesting**: Book losses before March 31\n• **Exemption Planning**: Use ₹1 lakh LTCG exemption annually\n• **SIP Benefits**: Different purchase dates = different holding periods\n\n**Real Estate:**\n• **Indexation Benefit**: Reduces taxable gains significantly\n• **Section 54 Planning**: Buy another house within 2 years\n• **Joint Ownership**: Split gains between family members\n• **Capital Gain Bonds**: NHAI/REC bonds for exemption\n\n**Debt Mutual Funds:**\n• **Hold >36 months**: Get indexation benefit\n• **Switch Strategy**: Debt to equity after 3 years\n• **Tax Efficiency**: Compare with FD taxation\n\n📈 **Advanced Strategies:**\n• **Gifting**: Transfer assets to spouse/children\n• **Staggered Sales**: Spread gains over multiple years\n• **Business vs Investment**: Different tax treatment\n• **NRI Considerations**: TDS and treaty benefits\n\n🔍 **Common Mistakes to Avoid:**\n• Not maintaining purchase records\n• Ignoring indexation benefits\n• Missing exemption deadlines\n• Not planning for advance tax\n• Incorrect cost of acquisition\n\n💡 **Documentation Required:**\n• Purchase/sale contracts\n• Broker statements\n• Bank statements\n• Improvement cost receipts\n• Indexation calculations\n\nWhich asset class do you need capital gains help with?"
    ]
  },

  // Audit & Compliance
  {
    keywords: ['audit', 'tax audit', 'statutory audit', 'compliance', 'books of accounts', 'audit report'],
    category: 'audit',
    responses: [
      "**Complete Audit & Compliance Guide:**\n\n📋 **Types of Audits:**\n\n**1. Tax Audit (Section 44AB):**\n• **Mandatory if**: Business turnover > ₹1 crore OR Professional income > ₹50 lakhs\n• **Due Date**: September 30th\n• **Form**: 3CD audit report\n• **Auditor**: Chartered Accountant only\n\n**2. Statutory Audit:**\n• **Companies**: All private/public companies\n• **LLPs**: Contribution > ₹25 lakhs OR turnover > ₹40 lakhs\n• **Due Date**: September 30th (companies)\n• **Compliance**: Companies Act requirements\n\n**3. GST Audit:**\n• **Mandatory if**: Annual turnover > ₹2 crores\n• **Due Date**: December 31st\n• **Form**: GSTR-9C reconciliation statement\n• **Auditor**: CA or CMA\n\n**4. Internal Audit:**\n• **Purpose**: Risk management, process improvement\n• **Frequency**: Ongoing/periodic\n• **Scope**: Operations, compliance, financial controls\n\n📊 **Audit Preparation Checklist:**\n• Maintain proper books of accounts\n• Reconcile bank statements\n• Prepare trial balance\n• Gather supporting documents\n• Ensure GST compliance\n• Review related party transactions\n\n⚠️ **Non-Compliance Penalties:**\n• Late audit report: ₹1,50,000\n• Incorrect information: Up to ₹10,00,000\n• Non-maintenance of books: ₹25,000\n\nWhich audit requirement do you need help with?",
      
      "**Audit Compliance Made Simple:**\n\n🎯 **Tax Audit Requirements:**\n\n**Who Needs Tax Audit:**\n• Business with turnover > ₹1 crore\n• Professional with gross receipts > ₹50 lakhs\n• Presumptive taxation users (if declaring <8%/6% profit)\n• Companies (mandatory regardless of turnover)\n\n**Books of Accounts to Maintain:**\n• Cash book and bank book\n• Journal and ledger\n• Trial balance\n• Profit & loss account\n• Balance sheet\n• Bills, vouchers, and contracts\n\n📅 **Audit Timeline:**\n• **April-March**: Maintain proper records\n• **April-August**: Prepare financial statements\n• **September**: Complete audit and file report\n• **October**: File ITR with audit report\n\n💼 **Choosing Right Auditor:**\n• Qualified Chartered Accountant\n• Experience in your industry\n• Understanding of tax laws\n• Reasonable fees structure\n• Good communication skills\n\n🔍 **Audit Process Steps:**\n1. **Planning**: Understand business operations\n2. **Vouching**: Verify transactions with documents\n3. **Verification**: Confirm assets and liabilities\n4. **Compliance Check**: Review tax provisions\n5. **Report Preparation**: Draft audit observations\n6. **Finalization**: Issue signed audit report\n\n💡 **Best Practices:**\n• Start preparation early\n• Maintain digital records\n• Regular internal reviews\n• Address audit queries promptly\n• Implement audit recommendations\n\nNeed help preparing for audit?"
    ]
  },

  // Penalties and Notices
  {
    keywords: ['penalty', 'notice', 'assessment', 'demand', 'late filing', 'interest', 'prosecution'],
    category: 'penalties',
    responses: [
      "**Tax Penalties & Notice Handling:**\n\n⚠️ **Common Tax Penalties:**\n\n**Income Tax Penalties:**\n• **Late ITR Filing**: ₹5,000 (up to ₹5L income), ₹10,000 (above ₹5L)\n• **Non-Filing**: Up to ₹10,000 + prosecution\n• **Concealment**: 50-200% of tax evaded\n• **Late Advance Tax**: 1% per month interest\n• **Incorrect Information**: Up to ₹10,000\n\n**GST Penalties:**\n• **Late GSTR-1**: ₹25 per day per return\n• **Late GSTR-3B**: ₹25 per day + 18% interest\n• **Non-Registration**: 10% of tax due\n• **Wrong ITC Claim**: 24% interest + penalty\n\n**TDS Penalties:**\n• **Late Deposit**: 1.5% per month interest\n• **Non-Deduction**: Equal to TDS amount\n• **Late Return**: ₹200 per day\n• **Incorrect Information**: ₹10,000-₹1,00,000\n\n📋 **Types of Notices:**\n• **Intimation u/s 143(1)**: Processing discrepancies\n• **Notice u/s 148**: Reopening assessment\n• **Notice u/s 142(1)**: Information/documents required\n• **Demand Notice**: Tax liability determined\n\n🎯 **How to Respond to Notices:**\n1. **Don't Panic**: Read notice carefully\n2. **Understand Demand**: Check calculation accuracy\n3. **Gather Documents**: Collect supporting evidence\n4. **Consult CA**: Get professional advice\n5. **Respond Timely**: Within prescribed time limit\n6. **File Appeal**: If assessment is incorrect\n\nReceived a specific notice? I can help you understand it!",
      
      "**Notice Response Strategy:**\n\n📨 **Common Notice Scenarios:**\n\n**Mismatch Notices:**\n• **TDS Mismatch**: Form 26AS vs ITR differences\n• **High Value Transactions**: Cash deposits, property purchase\n• **Income Discrepancy**: AIS vs declared income\n• **Response**: Provide supporting documents, explanations\n\n**Scrutiny Assessment:**\n• **Selection Criteria**: Computer-based, manual selection\n• **Information Required**: Books, vouchers, explanations\n• **Timeline**: Usually 6-12 months process\n• **Strategy**: Cooperate fully, provide accurate information\n\n**Reopening Cases:**\n• **Time Limit**: Up to 4 years (7 years for serious cases)\n• **Grounds**: Income escaped assessment\n• **Response Time**: Usually 30 days\n• **Action**: Review original return, gather evidence\n\n💡 **Best Response Practices:**\n• **Acknowledge Receipt**: Confirm notice received\n• **Maintain Records**: Keep all correspondence\n• **Professional Help**: Engage qualified CA\n• **Timely Response**: Never miss deadlines\n• **Complete Information**: Provide all requested details\n• **Follow Up**: Track case status regularly\n\n🛡️ **Penalty Minimization:**\n• **Voluntary Disclosure**: Before notice receipt\n• **Reasonable Cause**: Valid reasons for defaults\n• **Cooperation**: Full compliance with requests\n• **Settlement**: Consider Vivad se Vishwas scheme\n• **Appeal Process**: Challenge incorrect assessments\n\n📞 **Emergency Actions:**\n• **Immediate**: Consult tax professional\n• **Document**: Gather all relevant papers\n• **Calculate**: Verify demand accuracy\n• **Plan**: Prepare response strategy\n\nWhat type of notice have you received?"
    ]
  },

  // General Help
  {
    keywords: ['help', 'assistance', 'query', 'question', 'support', 'guidance'],
    category: 'general',
    responses: [
      "**Welcome to TaxBot - Your AI Tax Assistant! 🤖**\n\nI'm here to help you with comprehensive tax guidance. Here's what I can assist you with:\n\n📋 **Tax Filing & Compliance:**\n• Income Tax Return (ITR) filing process\n• GST registration and return filing\n• TDS compliance and certificates\n• Required documents and deadlines\n\n💼 **Business & Professional:**\n• Business registration (Company, LLP, Partnership)\n• Tax audit requirements and process\n• Books of accounts maintenance\n• Professional tax obligations\n\n💰 **Tax Planning & Savings:**\n• Section 80C, 80D investment options\n• Capital gains tax planning\n• Salary restructuring for tax efficiency\n• Advance tax payment strategies\n\n🔍 **Problem Resolution:**\n• Tax notice handling and responses\n• Penalty minimization strategies\n• Assessment and appeal process\n• Compliance issue resolution\n\n💡 **Quick Help Topics:**\n• Payment processes and methods\n• Document requirements for filing\n• Important deadlines and due dates\n• Tax calculations and rates\n\n**Just ask me anything like:**\n• \"How to file ITR for salary income?\"\n• \"GST registration documents required\"\n• \"Tax saving options under 80C\"\n• \"How to respond to income tax notice?\"\n\nWhat specific tax question can I help you with today? 😊"
    ]
  }
];

export function getTaxBotResponse(userMessage: string, userId: string = 'default'): string {
  console.log('getTaxBotResponse called with:', userMessage, 'for user:', userId);
  
  // Get or create conversation context
  let context = conversationContexts.get(userId);
  if (!context) {
    context = {
      userId,
      previousQueries: [],
      currentTopic: undefined,
      userProfile: { isCA: false, previousTopics: [] }
    };
    conversationContexts.set(userId, context);
  }

  const message = userMessage.toLowerCase().trim();
  console.log('Processed message:', message);
  
  // Add to conversation history
  context.previousQueries.push(message);
  if (context.previousQueries.length > 10) {
    context.previousQueries = context.previousQueries.slice(-10); // Keep last 10 queries
  }

  // Handle greetings with context
  if (message.match(/^(hi|hello|hey|good morning|good afternoon|good evening)$/)) {
    const greeting = getContextualGreeting(context);
    return greeting;
  }

  // Handle thank you messages
  if (message.includes('thank') || message.includes('thanks')) {
    return getThankYouResponse(context);
  }

  // Handle follow-up questions with context
  if (message.includes('more') || message.includes('tell me more') || message.includes('explain')) {
    return getContextualFollowUp(context);
  }

  // Find matching query based on keywords
  for (const query of taxQueries) {
    if (query.keywords.some(keyword => message.includes(keyword))) {
      console.log('Found matching query for keywords:', query.keywords);
      context.currentTopic = query.category;
      
      // Add topic to user profile
      if (!context.userProfile?.previousTopics.includes(query.category)) {
        context.userProfile!.previousTopics.push(query.category);
      }
      
      const randomResponse = query.responses[Math.floor(Math.random() * query.responses.length)];
      console.log('Selected response:', randomResponse);
      
      // Add contextual elements to response
      const contextualResponse = addContextualElements(randomResponse, context, query.category);
      return contextualResponse;
    }
  }

  // Handle specific calculations with context
  if (message.includes('calculate') || message.includes('computation') || message.includes('how much')) {
    return getCalculationResponse(message, context);
  }

  // Handle current year specific queries
  if (message.includes('2024') || message.includes('2025') || message.includes('current year') || message.includes('this year')) {
    return getCurrentYearResponse(context);
  }

  // Context-aware default response
  return getContextualDefaultResponse(message, context);
}

function getContextualGreeting(context: ConversationContext): string {
  // use safe access with fallback
  const previousTopics = context.userProfile?.previousTopics ?? [];

  if (previousTopics.length === 0) {
    return "Hello! 👋 Welcome to TaxBot, your comprehensive AI tax assistant!\n\nI'm here to help you with all aspects of taxation in India:\n\n📋 **Tax Filing**: ITR, GST returns, TDS compliance\n💼 **Business Setup**: Registration, audit requirements\n💰 **Tax Planning**: Savings, investments, deductions\n🔍 **Problem Solving**: Notices, penalties, assessments\n\nWhat tax question can I help you with today?";
  } else {
    const recentTopic = previousTopics[previousTopics.length - 1];
    return `Hello again! 👋 Welcome back to TaxBot!\n\nI see we've previously discussed ${getTopicDisplayName(recentTopic)}. I'm ready to help you with:\n\n• Continue our previous discussion\n• New tax queries or concerns\n• Updates on tax laws and deadlines\n• Any other tax-related questions\n\nWhat would you like to explore today?`;
  }
}


function getThankYouResponse(context: ConversationContext): string {
  const currentTopic = context.currentTopic;
  
  if (currentTopic) {
    return `You're very welcome! 😊 I'm glad I could help you with ${getTopicDisplayName(currentTopic)}.\n\nFeel free to ask me about:\n• Related ${getTopicDisplayName(currentTopic)} questions\n• Other tax matters\n• Compliance deadlines\n• Tax planning strategies\n\nI'm here whenever you need tax guidance! 🤝`;
  }
  
  return "You're welcome! 😊 I'm always here to help with your tax-related questions.\n\nRemember, I can assist you with:\n• Tax filing and compliance\n• Business registration and audit\n• Tax planning and savings\n• Notice handling and penalties\n\nDon't hesitate to ask anything about taxes! 💪";
}

function getContextualFollowUp(context: ConversationContext): string {
  const currentTopic = context.currentTopic;
  
  if (!currentTopic) {
    return "I'd be happy to provide more information! Could you please specify which tax topic you'd like me to elaborate on?\n\n• Income Tax filing\n• GST compliance\n• Business registration\n• Tax saving investments\n• Capital gains\n• Audit requirements\n\nWhat specific area interests you?";
  }
  
  // Provide detailed follow-up based on current topic
  const followUpResponses: Record<string, string> = {
    'income_tax': "Here are additional Income Tax insights:\n\n🎯 **Advanced ITR Tips:**\n• Use pre-filled data from AIS (Annual Information Statement)\n• Claim all eligible deductions systematically\n• Verify TDS credits match Form 26AS\n• Consider revised return if errors found\n\n📊 **Income Optimization:**\n• Salary restructuring for tax efficiency\n• HRA vs home loan interest comparison\n• Medical reimbursement planning\n• Leave encashment tax implications\n\nNeed specific guidance on any of these aspects?",
    
    'gst': "Advanced GST Compliance Strategies:\n\n🔄 **Input Tax Credit Optimization:**\n• Regular ITC reconciliation with GSTR-2A\n• Reverse charge mechanism compliance\n• E-invoice implementation for B2B\n• Proper documentation for ITC claims\n\n📈 **GST Planning:**\n• Composition scheme vs regular scheme analysis\n• Inter-state vs intra-state supply planning\n• E-way bill compliance for goods movement\n• Annual return preparation strategies\n\nWhich GST aspect needs deeper exploration?",
    
    'business': "Detailed Business Setup Guidance:\n\n🏢 **Post-Registration Compliance:**\n• Statutory registers maintenance\n• Board meeting requirements\n• Annual filing obligations\n• ROC compliance calendar\n\n💼 **Operational Setup:**\n• Business bank account opening\n• Accounting system implementation\n• Employee registration (PF, ESI)\n• License and permit requirements\n\nWhat specific business compliance area do you need help with?",
    
    'tax_saving': "Advanced Tax Planning Strategies:\n\n📊 **Portfolio Optimization:**\n• Asset allocation for tax efficiency\n• Debt vs equity fund taxation\n• ELSS vs PPF vs NPS comparison\n• Tax harvesting strategies\n\n🎯 **Family Tax Planning:**\n• Income splitting between spouses\n• Children's income tax implications\n• HUF formation for tax benefits\n• Gift tax planning\n\nWhich advanced strategy interests you most?"
  };
  
  return followUpResponses[currentTopic] || 
         `I'd be happy to provide more details about ${getTopicDisplayName(currentTopic)}. What specific aspect would you like me to explain further?`;
}

function getCalculationResponse(message: string, context: ConversationContext): string {
  if (message.includes('income tax') || message.includes('tax liability')) {
    return "**Income Tax Calculation Guide:**\n\n🧮 **Step-by-Step Calculation:**\n1. **Total Income**: Add all income sources\n2. **Deductions**: Subtract 80C, 80D, etc.\n3. **Taxable Income**: Total income - deductions\n4. **Tax Calculation**: Apply tax slabs\n5. **Add Cess**: 4% health & education cess\n6. **Less TDS/Advance Tax**: Reduce prepaid taxes\n7. **Final Liability**: Tax payable/refundable\n\n💰 **Tax Slabs 2023-24:**\n• Up to ₹3L: Nil • ₹3-6L: 5% • ₹6-9L: 10%\n• ₹9-12L: 15% • ₹12-15L: 20% • Above ₹15L: 30%\n\nProvide your income details for personalized calculation!";
  }
  
  if (message.includes('gst')) {
    return "**GST Calculation Made Simple:**\n\n📊 **GST Calculation Formula:**\n• **GST Amount** = (Taxable Value × GST Rate) ÷ 100\n• **Total Amount** = Taxable Value + GST Amount\n\n🔄 **Input Tax Credit:**\n• **ITC Available** = GST paid on purchases\n• **Net GST Payable** = Output GST - Input GST\n\n💡 **Example Calculation:**\n• Sale Value: ₹1,00,000\n• GST @18%: ₹18,000\n• Total Invoice: ₹1,18,000\n\nNeed help with specific GST calculations?";
  }
  
  return "I can help you calculate:\n\n🧮 **Tax Calculations:**\n• Income tax liability\n• GST on transactions\n• TDS on various payments\n• Capital gains tax\n• Advance tax installments\n\n📊 **Business Calculations:**\n• Presumptive taxation\n• Depreciation on assets\n• Professional tax\n• Audit thresholds\n\nWhat specific calculation do you need help with?";
}

function getCurrentYearResponse(context: ConversationContext): string {
  return "**Current Year Tax Information (FY 2023-24):**\n\n📅 **Important Deadlines:**\n• **ITR Filing**: July 31, 2024\n• **Advance Tax**: Mar 15, 2025 (final installment)\n• **GST Returns**: Monthly by 20th\n• **TDS Returns**: Quarterly\n\n💰 **Current Tax Rates:**\n• **Income Tax**: New regime rates (₹3L basic exemption)\n• **GST**: 5%, 12%, 18%, 28% slabs\n• **TDS**: Various rates (10% professional fees)\n• **Capital Gains**: 10% LTCG, 15% STCG (equity)\n\n🎯 **Key Changes:**\n• Increased standard deduction to ₹50,000\n• New tax regime as default\n• Enhanced rebate under section 87A\n• Updated GST return forms\n\nNeed specific current year guidance?";
}

function getContextualDefaultResponse(message: string, context: ConversationContext): string {
  const previousTopics = context.userProfile?.previousTopics ?? [];

  
  let contextualSuggestions = "";
  if (previousTopics.length > 0) {
    const recentTopic = previousTopics[previousTopics.length - 1];
    contextualSuggestions = `\n\n💡 **Based on our previous discussion about ${getTopicDisplayName(recentTopic)}:**\n• Continue with related queries\n• Explore advanced concepts\n• Get practical implementation tips`;
  }
  
  return `I understand you're asking about tax matters, but I need more specific information to provide accurate guidance.\n\n🔍 **Try asking about:**\n• "How to file Income Tax Return?"\n• "GST registration process and requirements"\n• "TDS rates for different payments"\n• "Tax saving investment options"\n• "Capital gains calculation method"\n• "Business registration procedures"\n• "How to respond to tax notices"\n• "Required documents for tax filing"${contextualSuggestions}\n\n💬 **Or simply describe your situation:**\n• "I received a tax notice"\n• "Need help with GST filing"\n• "Want to save tax on salary"\n• "Planning to start a business"\n\nI'm here to provide detailed, practical tax guidance! 😊`;
}

function addContextualElements(response: string, context: ConversationContext, category: string): string {
  // Add personalized elements based on conversation history
  let contextualAddition = "";
  
  if (context.previousQueries.length > 1) {
    contextualAddition = "\n\n💡 **Since we've been discussing tax matters, you might also want to know about:**";
    
    // Suggest related topics based on current category
    const relatedSuggestions = getRelatedTopics(category);
    contextualAddition += relatedSuggestions;
  }
  
  return response + contextualAddition;
}

function getRelatedTopics(category: string): string {
  const relatedTopics: Record<string, string> = {
    'income_tax': "\n• Tax saving strategies under various sections\n• Advance tax payment planning\n• TDS optimization for salary income",
    'gst': "\n• Business registration requirements\n• TDS compliance for business\n• Input tax credit optimization",
    'business': "\n• GST registration for new business\n• Tax audit requirements\n• Professional tax obligations",
    'tax_saving': "\n• Capital gains tax planning\n• Income tax calculation optimization\n• Long-term investment strategies",
    'payment': "\n• Advance tax planning\n• TDS payment compliance\n• Penalty avoidance strategies",
    'documents': "\n• Digital record maintenance\n• Audit preparation checklist\n• Compliance documentation"
  };
  
  return relatedTopics[category] || "\n• Related tax compliance matters\n• Planning and optimization strategies";
}

function getTopicDisplayName(category: string): string {
  const displayNames: Record<string, string> = {
    'income_tax': 'Income Tax',
    'gst': 'GST',
    'tds': 'TDS',
    'business': 'Business Registration',
    'tax_saving': 'Tax Saving',
    'capital_gains': 'Capital Gains',
    'audit': 'Audit & Compliance',
    'penalties': 'Penalties & Notices',
    'payment': 'Tax Payments',
    'documents': 'Documentation',
    'deadlines': 'Tax Deadlines'
  };
  
  return displayNames[category] || 'Tax Matters';
}

export function getFollowUpSuggestions(userMessage: string): string[] {
  const message = userMessage.toLowerCase();
  
  if (message.includes('income tax') || message.includes('itr')) {
    return [
      "Which ITR form should I use?",
      "What documents do I need for filing?",
      "How to calculate advance tax?",
      "Tax saving options under 80C"
    ];
  }
  
  if (message.includes('gst')) {
    return [
      "GST registration process",
      "How to claim input tax credit?",
      "GST return filing procedure",
      "E-way bill requirements"
    ];
  }
  
  if (message.includes('business') || message.includes('company')) {
    return [
      "Company vs LLP comparison",
      "Required documents for registration",
      "Annual compliance requirements",
      "Tax implications of business structure"
    ];
  }
  
  if (message.includes('tax saving') || message.includes('80c')) {
    return [
      "Best tax saving investments",
      "ELSS vs PPF comparison",
      "Health insurance tax benefits",
      "Home loan tax advantages"
    ];
  }
  
  if (message.includes('capital gains')) {
    return [
      "LTCG vs STCG differences",
      "Property sale tax implications",
      "Equity investment tax planning",
      "Capital gains exemptions available"
    ];
  }
  
  if (message.includes('tds')) {
    return [
      "TDS rates for different payments",
      "How to get TDS certificate?",
      "TDS return filing process",
      "Lower TDS deduction procedure"
    ];
  }
  
  if (message.includes('penalty') || message.includes('notice')) {
    return [
      "How to respond to tax notice?",
      "Penalty calculation method",
      "Appeal process for assessments",
      "Vivad se Vishwas scheme benefits"
    ];
  }
  
  if (message.includes('audit')) {
    return [
      "Tax audit vs statutory audit",
      "Books of accounts requirements",
      "Audit report preparation",
      "Post-audit compliance steps"
    ];
  }
  
  // Default suggestions based on common queries
  return [
    "Tell me about current tax deadlines",
    "Help with tax planning strategies",
    "GST compliance requirements",
    "Income tax filing guidance"
  ];
}