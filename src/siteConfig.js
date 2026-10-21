// Single source of truth for company contact details.
// Change the phone number, email or address here and it updates everywhere on the site.
export const siteConfig = {
  companyName: "Elsewhere Travel Co.",
  // Trip enquiries from the contact form are sent here.
  email: {
    display: "connect2devinder@gmail.com",
    address: "connect2devinder@gmail.com",
  },
  phone: {
    display: "+91 70184 90919",
    dial: "+917018490919",
  },
  address: {
    line1: "Dudhli, Bharari",
    line2: "Shimla, Himachal Pradesh 171003",
  },
};

export const siteAddress = `${siteConfig.address.line1}, ${siteConfig.address.line2}`;
