import { mutation } from "./_generated/server";

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if already seeded
    const existing = await ctx.db
      .query("objects")
      .withIndex("by_name", (q) => q.eq("name", "Account"))
      .first();
    if (existing) return "Already seeded";

    // --- Account ---
    const accountId = await ctx.db.insert("objects", {
      name: "Account",
      label: "Account",
      pluralLabel: "Accounts",
      isCustom: false,
      icon: "Building2",
    });
    const accountFields = [
      { name: "Name", label: "Name", type: "text", required: true, isNameField: true, sortOrder: 0 },
      { name: "Industry", label: "Industry", type: "picklist", required: false, isNameField: false, sortOrder: 1, picklistValues: ["Agriculture", "Apparel", "Banking", "Biotechnology", "Chemicals", "Communications", "Construction", "Consulting", "Education", "Electronics", "Energy", "Engineering", "Entertainment", "Environmental", "Finance", "Food & Beverage", "Government", "Healthcare", "Hospitality", "Insurance", "Machinery", "Manufacturing", "Media", "Not For Profit", "Recreation", "Retail", "Shipping", "Technology", "Telecommunications", "Transportation", "Utilities", "Other"] },
      { name: "Phone", label: "Phone", type: "phone", required: false, isNameField: false, sortOrder: 2 },
      { name: "Website", label: "Website", type: "url", required: false, isNameField: false, sortOrder: 3 },
      { name: "Description", label: "Description", type: "textarea", required: false, isNameField: false, sortOrder: 4 },
      { name: "BillingCity", label: "Billing City", type: "text", required: false, isNameField: false, sortOrder: 5 },
      { name: "BillingState", label: "Billing State", type: "text", required: false, isNameField: false, sortOrder: 6 },
      { name: "Type", label: "Type", type: "picklist", required: false, isNameField: false, sortOrder: 7, picklistValues: ["Prospect", "Customer - Direct", "Customer - Channel", "Channel Partner / Reseller", "Installation Partner", "Technology Partner", "Other"] },
      { name: "AnnualRevenue", label: "Annual Revenue", type: "currency", required: false, isNameField: false, sortOrder: 8 },
    ];
    for (const f of accountFields) {
      await ctx.db.insert("fields", {
        objectId: accountId,
        name: f.name,
        label: f.label,
        type: f.type,
        required: f.required,
        isNameField: f.isNameField,
        isCustom: false,
        sortOrder: f.sortOrder,
        picklistValues: (f as any).picklistValues,
      });
    }

    // --- Contact ---
    const contactId = await ctx.db.insert("objects", {
      name: "Contact",
      label: "Contact",
      pluralLabel: "Contacts",
      isCustom: false,
      icon: "User",
    });
    const contactFields = [
      { name: "FirstName", label: "First Name", type: "text", required: false, isNameField: false, sortOrder: 0 },
      { name: "LastName", label: "Last Name", type: "text", required: true, isNameField: true, sortOrder: 1 },
      { name: "Email", label: "Email", type: "email", required: false, isNameField: false, sortOrder: 2 },
      { name: "Phone", label: "Phone", type: "phone", required: false, isNameField: false, sortOrder: 3 },
      { name: "Title", label: "Title", type: "text", required: false, isNameField: false, sortOrder: 4 },
      { name: "AccountId", label: "Account", type: "lookup", required: false, isNameField: false, sortOrder: 5, lookupObject: "Account" },
      { name: "MailingCity", label: "Mailing City", type: "text", required: false, isNameField: false, sortOrder: 6 },
      { name: "MailingState", label: "Mailing State", type: "text", required: false, isNameField: false, sortOrder: 7 },
    ];
    for (const f of contactFields) {
      await ctx.db.insert("fields", {
        objectId: contactId,
        name: f.name,
        label: f.label,
        type: f.type,
        required: f.required,
        isNameField: f.isNameField,
        isCustom: false,
        sortOrder: f.sortOrder,
        lookupObject: (f as any).lookupObject,
      });
    }

    // --- Opportunity ---
    const opportunityId = await ctx.db.insert("objects", {
      name: "Opportunity",
      label: "Opportunity",
      pluralLabel: "Opportunities",
      isCustom: false,
      icon: "DollarSign",
    });
    const opportunityFields = [
      { name: "Name", label: "Opportunity Name", type: "text", required: true, isNameField: true, sortOrder: 0 },
      { name: "Amount", label: "Amount", type: "currency", required: false, isNameField: false, sortOrder: 1 },
      { name: "CloseDate", label: "Close Date", type: "date", required: true, isNameField: false, sortOrder: 2 },
      { name: "StageName", label: "Stage", type: "picklist", required: true, isNameField: false, sortOrder: 3, picklistValues: ["Prospecting", "Qualification", "Needs Analysis", "Value Proposition", "Id. Decision Makers", "Perception Analysis", "Proposal/Price Quote", "Negotiation/Review", "Closed Won", "Closed Lost"] },
      { name: "AccountId", label: "Account", type: "lookup", required: false, isNameField: false, sortOrder: 4, lookupObject: "Account" },
      { name: "Probability", label: "Probability (%)", type: "number", required: false, isNameField: false, sortOrder: 5 },
    ];
    for (const f of opportunityFields) {
      await ctx.db.insert("fields", {
        objectId: opportunityId,
        name: f.name,
        label: f.label,
        type: f.type,
        required: f.required,
        isNameField: f.isNameField,
        isCustom: false,
        sortOrder: f.sortOrder,
        picklistValues: (f as any).picklistValues,
        lookupObject: (f as any).lookupObject,
      });
    }

    // --- Sample Data ---
    // Accounts
    const acme = await ctx.db.insert("records", {
      objectId: accountId,
      data: {
        Name: "Acme Corporation",
        Industry: "Technology",
        Phone: "(415) 555-1234",
        Website: "https://acme.example.com",
        Type: "Customer - Direct",
        AnnualRevenue: "5000000",
        BillingCity: "San Francisco",
        BillingState: "CA",
      },
    });
    const globex = await ctx.db.insert("records", {
      objectId: accountId,
      data: {
        Name: "Globex Industries",
        Industry: "Manufacturing",
        Phone: "(212) 555-5678",
        Website: "https://globex.example.com",
        Type: "Prospect",
        AnnualRevenue: "12000000",
        BillingCity: "New York",
        BillingState: "NY",
      },
    });
    const initech = await ctx.db.insert("records", {
      objectId: accountId,
      data: {
        Name: "Initech",
        Industry: "Consulting",
        Phone: "(512) 555-9012",
        Type: "Customer - Channel",
        AnnualRevenue: "800000",
        BillingCity: "Austin",
        BillingState: "TX",
      },
    });

    // Contacts
    await ctx.db.insert("records", {
      objectId: contactId,
      data: {
        FirstName: "John",
        LastName: "Smith",
        Email: "jsmith@acme.example.com",
        Phone: "(415) 555-1111",
        Title: "CEO",
        AccountId: acme,
        MailingCity: "San Francisco",
        MailingState: "CA",
      },
    });
    await ctx.db.insert("records", {
      objectId: contactId,
      data: {
        FirstName: "Sarah",
        LastName: "Johnson",
        Email: "sjohnson@globex.example.com",
        Phone: "(212) 555-2222",
        Title: "VP of Sales",
        AccountId: globex,
        MailingCity: "New York",
        MailingState: "NY",
      },
    });
    await ctx.db.insert("records", {
      objectId: contactId,
      data: {
        FirstName: "Mike",
        LastName: "Davis",
        Email: "mdavis@initech.example.com",
        Phone: "(512) 555-3333",
        Title: "CTO",
        AccountId: initech,
      },
    });

    // Opportunities
    await ctx.db.insert("records", {
      objectId: opportunityId,
      data: {
        Name: "Acme - Enterprise License",
        Amount: "150000",
        CloseDate: "2026-03-31",
        StageName: "Negotiation/Review",
        AccountId: acme,
        Probability: "80",
      },
    });
    await ctx.db.insert("records", {
      objectId: opportunityId,
      data: {
        Name: "Globex - Platform Migration",
        Amount: "500000",
        CloseDate: "2026-06-30",
        StageName: "Proposal/Price Quote",
        AccountId: globex,
        Probability: "50",
      },
    });
    await ctx.db.insert("records", {
      objectId: opportunityId,
      data: {
        Name: "Initech - Consulting Package",
        Amount: "75000",
        CloseDate: "2026-04-15",
        StageName: "Qualification",
        AccountId: initech,
        Probability: "25",
      },
    });

    return "Seeded successfully";
  },
});
