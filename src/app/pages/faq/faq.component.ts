import { Component } from "@angular/core";
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from "@angular/animations";

interface FAQ {
  id: number;
  question: string;
  answer: string;
  isOpen: boolean;
}

@Component({
  selector: "app-faq",
  templateUrl: "./faq.component.html",
  styleUrls: ["./faq.component.scss"],
  animations: [
    trigger("expandCollapse", [
      state(
        "collapsed",
        style({
          height: "0",
          opacity: "0",
          padding: "0 1.5rem",
        })
      ),
      state(
        "expanded",
        style({
          height: "*",
          opacity: "1",
          padding: "1.5rem",
        })
      ),
      transition("collapsed <=> expanded", [
        animate("400ms cubic-bezier(0.4, 0.0, 0.2, 1)"),
      ]),
    ]),
    trigger("rotateIcon", [
      state(
        "collapsed",
        style({
          transform: "rotate(0deg)",
        })
      ),
      state(
        "expanded",
        style({
          transform: "rotate(180deg)",
        })
      ),
      transition("collapsed <=> expanded", [
        animate("300ms cubic-bezier(0.4, 0.0, 0.2, 1)"),
      ]),
    ]),
  ],
})
export class FaqComponent {
  currentYear: number = new Date().getFullYear();
  faqs: FAQ[] = [
    {
      id: 1,
      question: "What should I do if my payment fails?",
      answer:
        "If your payment fails, please check your payment method details and ensure you have sufficient funds. You can try using a different payment method or card. If the issue persists, please contact our customer support team for assistance.",
      isOpen: false,
    },
    {
      id: 2,
      question: "Refund Policy",
      answer:
        "To get a refund, you can contact us at care@homesweets.com. If your refund request is accepted, we'll initiate your refund in 48 hours. You can always contact us for any return question at care@homesweets.com. View our Refund & Return Policy.",
      isOpen: false,
    },
    {
      id: 3,
      question:
        "What should I do if a product is missing or damaged from my order?",
      answer:
        "Please contact our customer support immediately with your order number and photos of the damaged or missing items. We will arrange for a replacement or refund within 48 hours. For damaged products, please do not discard the packaging as we may need to see it for our records.",
      isOpen: false,
    },
    {
      id: 4,
      question: "When are you eligible for a refund/replacement?",
      answer:
        "You are eligible for a refund or replacement if: the product is defective or damaged upon arrival, wrong items were delivered, items are missing from your order, or products are past their expiration date. Claims must be made within 48 hours of delivery with supporting evidence.",
      isOpen: false,
    },
    {
      id: 5,
      question: "How to get a refund?",
      answer:
        "To request a refund, go to your Order History, select the order, click 'Request Refund', fill out the refund form with reason and photos if applicable, and submit. Our team will review your request within 24 hours and notify you of the decision via email.",
      isOpen: false,
    },
  ];

  toggleAccordion(index: number): void {
    this.faqs = this.faqs.map((faq, i) => ({
      ...faq,
      isOpen: i === index ? !faq.isOpen : false,
    }));
  }
}
