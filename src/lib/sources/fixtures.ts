import type { RawReview } from "./types";

/**
 * Hand-written, realistic KardiaMobile-style reviews.
 *
 * The shapes are deliberately inconsistent to mirror a real upstream:
 *  - ratings appear as numbers ("5") and numeric strings ("4")
 *  - the review body lives under `body`, `text`, or `content`
 *  - dates come as ISO strings, human strings, and unix timestamps
 *  - some records are missing an author, a title, or an externalId
 *
 * The normalization layer is responsible for taming all of this.
 */
export const FIXTURE_REVIEWS: RawReview[] = [
  {
    externalId: "amzn-r-1001",
    productName: "KardiaMobile 1-Lead Personal EKG Monitor",
    rating: 5,
    title: "Gave me real peace of mind",
    body: "I have occasional palpitations and my doctor suggested tracking them. This caught an episode of AFib that my regular checkups missed. Setup took two minutes.",
    author: "Priya S.",
    date: "2026-07-08T09:12:00Z",
  },
  {
    externalId: "amzn-r-1002",
    productName: "KardiaMobile 1-Lead Personal EKG Monitor",
    rating: "4",
    title: "Works well, subscription is pushy",
    text: "The readings are accurate and match what my cardiologist sees. Only gripe is the app constantly nudging you toward the premium plan.",
    author: "Mark T.",
    reviewedAt: "2026-07-07",
  },
  {
    externalId: "amzn-r-1003",
    productName: "KardiaMobile 1-Lead Personal EKG Monitor",
    rating: 2,
    title: "Struggled to get a clean reading",
    content:
      "Maybe it's my dry hands but I get 'unclassified' results half the time. When it works it's great, when it doesn't it's frustrating.",
    author: "Anonymous",
    date: 1751500800000,
  },
  {
    // missing externalId on purpose -> normalizer must derive a content hash
    productName: "KardiaMobile 1-Lead Personal EKG Monitor",
    rating: 5,
    title: "Cardiologist recommended",
    body: "My doctor literally told me to buy this. Being able to email a PDF of my EKG before an appointment is a game changer.",
    author: "Grace L.",
    date: "2026-07-05T14:30:00Z",
  },
  {
    externalId: "amzn-r-1005",
    productName: "KardiaMobile 1-Lead Personal EKG Monitor",
    rating: "3",
    title: null,
    text: "It's fine. Does what it says. Battery in the device lasts ages. Wish it connected to more third party apps.",
    author: null,
    date: "July 3, 2026",
  },
  {
    externalId: "amzn-r-1006",
    productName: "KardiaMobile 6L 6-Lead Personal EKG",
    rating: 5,
    title: "The 6-lead is worth the upgrade",
    body: "Coming from the single lead, the extra leads give a much fuller picture. My electrophysiologist was impressed with the detail.",
    author: "Devon R.",
    date: "2026-07-06T08:00:00Z",
  },
  {
    externalId: "amzn-r-1007",
    productName: "KardiaMobile 6L 6-Lead Personal EKG",
    rating: 4,
    title: "Great for frequent monitoring",
    content:
      "I check a few times a day after my ablation. Readings are consistent. The stand is a bit flimsy but the device itself is solid.",
    author: "Helen W.",
    reviewedAt: "2026-07-04T19:45:00Z",
  },
  {
    externalId: "amzn-r-1008",
    productName: "KardiaMobile 6L 6-Lead Personal EKG",
    rating: "1",
    title: "Stopped connecting after an update",
    body: "Worked perfectly for three months then a phone update broke the Bluetooth pairing. Support was slow to respond.",
    author: "Raj P.",
    date: "2026-07-02",
  },
  {
    externalId: "amzn-r-1009",
    productName: "KardiaMobile 6L 6-Lead Personal EKG",
    rating: 5,
    title: "Accurate and fast",
    text: "30 seconds and I have a medical-grade reading. Compared it against a hospital ECG and it lined up.",
    author: "Sofia M.",
    date: "2026-07-01T11:20:00Z",
  },
  {
    externalId: "amzn-r-1010",
    productName: "KardiaMobile 6L 6-Lead Personal EKG",
    rating: 4,
    title: "Good but pricey",
    body: "Hardware is excellent. Just be aware the advanced determinations sit behind KardiaCare which is a yearly fee.",
    author: "Tom B.",
    date: "2026-06-29T16:10:00Z",
  },
  {
    externalId: "amzn-r-1011",
    productName: "KardiaMobile Card - Credit Card Sized EKG",
    rating: 5,
    title: "Fits in my wallet, use it everywhere",
    content:
      "The card format is genius. I travel a lot and it just lives in my wallet. Took a reading in an airport when I felt off.",
    author: "Aisha K.",
    date: "2026-06-28T07:55:00Z",
  },
  {
    externalId: "amzn-r-1012",
    productName: "KardiaMobile Card - Credit Card Sized EKG",
    rating: 3,
    title: "Convenient but finicky placement",
    text: "Love the form factor but you have to hold your fingers just right. Takes practice compared to the classic.",
    author: "Nate F.",
    reviewedAt: "2026-06-27",
  },
  {
    externalId: "amzn-r-1013",
    productName: "KardiaMobile Card - Credit Card Sized EKG",
    rating: 5,
    title: "Best for on-the-go peace of mind",
    body: "As someone with an anxiety-driven awareness of my heartbeat, being able to instantly confirm I'm in normal sinus rhythm is priceless.",
    author: "Jordan V.",
    date: "2026-06-25T13:05:00Z",
  },
  {
    externalId: "amzn-r-1014",
    productName: "KardiaMobile Card - Credit Card Sized EKG",
    rating: 2,
    title: "Reading quality below the classic",
    content:
      "I own both and the card gives me more 'unclassified' results. Fine as a backup, not my primary.",
    author: "Emily C.",
    date: "2026-06-24T10:00:00Z",
  },
  {
    externalId: "amzn-r-1015",
    productName: "KardiaMobile 1-Lead Personal EKG Monitor",
    rating: 5,
    title: "Detected AFib my watch missed",
    body: "My smartwatch kept saying everything was fine but this flagged AFib clearly. Showed it to my GP and got a referral the same week.",
    author: "William H.",
    date: "2026-06-23T18:40:00Z",
  },
  {
    externalId: "amzn-r-1016",
    productName: "KardiaMobile 1-Lead Personal EKG Monitor",
    rating: 4,
    title: "Reliable daily companion",
    text: "Six months of daily use, zero hardware issues. The historical trends in the app are genuinely useful for my doctor.",
    author: "Fatima Z.",
    date: "2026-06-22",
  },
  {
    externalId: "amzn-r-1017",
    productName: "KardiaMobile 6L 6-Lead Personal EKG",
    rating: 3,
    title: "Setup was harder than expected",
    body: "Pairing took several tries and the account creation flow is clunky. Once running though it's been dependable.",
    author: "Carlos D.",
    date: "2026-06-20T09:30:00Z",
  },
  {
    externalId: "amzn-r-1018",
    productName: "KardiaMobile Card - Credit Card Sized EKG",
    rating: 5,
    title: "Recommended to my whole family",
    content:
      "Bought three — one for me, my dad, and my brother. We all have a history of heart issues and this keeps us proactive.",
    author: "Meera J.",
    date: "2026-06-19T12:15:00Z",
  },
  {
    externalId: "amzn-r-1019",
    productName: "KardiaMobile 1-Lead Personal EKG Monitor",
    rating: 1,
    title: "Battery compartment failed",
    body: "The coin battery cover cracked within weeks and now it won't hold a battery. Disappointing for the price.",
    author: "Owen S.",
    date: "2026-06-18",
  },
  {
    externalId: "amzn-r-1020",
    productName: "KardiaMobile 6L 6-Lead Personal EKG",
    rating: 5,
    title: "Doctor was able to adjust my meds",
    text: "Sharing the recordings let my cardiologist fine-tune my medication remotely. Saved me two in-person visits.",
    author: "Beatrice N.",
    date: "2026-06-16T15:50:00Z",
  },
  {
    externalId: "amzn-r-1021",
    productName: "KardiaMobile 1-Lead Personal EKG Monitor",
    rating: 4,
    title: "Solid, does one thing well",
    body: "Not flashy, but it's accurate and dependable. Exactly what I wanted for tracking my occasional arrhythmia.",
    author: "Sam O.",
    date: "2026-06-15T08:20:00Z",
  },
  {
    externalId: "amzn-r-1022",
    productName: "KardiaMobile Card - Credit Card Sized EKG",
    rating: 4,
    title: "Great once you learn the grip",
    content:
      "First week was hit or miss, now I get clean readings every time. The portability really can't be beat.",
    author: "Lena G.",
    date: "2026-06-13T17:00:00Z",
  },
  {
    externalId: "amzn-r-1023",
    productName: "KardiaMobile 6L 6-Lead Personal EKG",
    rating: 5,
    title: "Invaluable after my diagnosis",
    body: "Newly diagnosed with AFib and this has been central to managing it. Being able to capture episodes when they happen is huge.",
    author: "Arthur P.",
    date: "2026-06-11T10:45:00Z",
  },
];
