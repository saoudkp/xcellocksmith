export interface Review {
  id: string;
  customerName: string;
  starRating: number;
  reviewDate: string;
  reviewText: string;
}

export const reviews: Review[] = [
  { id: "rev1", customerName: "Maria S.", starRating: 5, reviewDate: "2026-01-15", reviewText: "Locked out at 11 PM and they were here in 20 minutes! Professional, fast, and didn't damage my lock. Highly recommend!" },
  { id: "rev2", customerName: "James T.", starRating: 5, reviewDate: "2026-01-28", reviewText: "Lost my car keys and Xcel cut and programmed a new transponder key on-site. Saved me hundreds compared to the dealership." },
  { id: "rev3", customerName: "Linda K.", starRating: 5, reviewDate: "2026-02-03", reviewText: "Had all our office locks rekeyed after an employee left. Clean work, fair pricing, and they finished faster than expected." },
  { id: "rev4", customerName: "Robert M.", starRating: 5, reviewDate: "2026-02-10", reviewText: "Installed smart locks on our front and back doors. Very knowledgeable about the different options and set everything up perfectly." },
  { id: "rev5", customerName: "Sarah W.", starRating: 5, reviewDate: "2026-02-14", reviewText: "Broke my key in the ignition at a gas station. Xcel extracted it and cut a new key in under 30 minutes. Lifesaver!" },
];
