import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

const faqCategories = [
  {
    title: "Booking & Reservations",
    faqs: [
      {
        question: "How do I book a flight?",
        answer:
          "You can book a flight by using our search tool on the homepage. Enter your departure and arrival cities, select your travel dates, and choose from available flights. Complete the booking by providing passenger details and payment information.",
      },
      {
        question: "Can I book a flight for someone else?",
        answer:
          "Yes, you can book flights for other passengers. Simply enter their details during the booking process. Make sure all passenger information matches their travel documents.",
      },
      {
        question: "How far in advance can I book a flight?",
        answer:
          "You can book flights up to 11 months in advance. We recommend booking early for the best prices and seat selection, especially during peak travel seasons.",
      },
      {
        question: "What payment methods do you accept?",
        answer:
          "We accept all major credit cards (Visa, Mastercard, American Express), debit cards, and various digital payment methods including PayPal and Apple Pay.",
      },
    ],
  },
  {
    title: "Ticket Management",
    faqs: [
      {
        question: "How can I view my booked tickets?",
        answer:
          'Log in to your account and navigate to "My Tickets" section. You can view all your upcoming and past bookings, along with detailed flight information.',
      },
      {
        question: "Can I cancel my ticket?",
        answer:
          'Yes, you can request a cancellation through your account. Go to "My Tickets," select the booking you wish to cancel, and submit a cancellation request. Refund eligibility depends on your fare type and how close to departure you cancel.',
      },
      {
        question: "How do I upgrade my ticket class?",
        answer:
          'You can upgrade your ticket through the "My Tickets" section. Select your booking and click on "Upgrade." Available upgrade options and pricing will be displayed. Upgrades are subject to availability.',
      },
      {
        question: "Can I change my flight date?",
        answer:
          "Date changes may be possible depending on your fare type. Contact our customer support or visit the ticket management section in your account to explore change options and any applicable fees.",
      },
    ],
  },
  {
    title: "Baggage",
    faqs: [
      {
        question: "What is the baggage allowance?",
        answer:
          "Baggage allowance varies by ticket class. Economy: 1 cabin bag (7kg) + 1 checked bag (23kg). Business: 2 cabin bags + 2 checked bags (32kg each). First Class: 2 cabin bags + 3 checked bags (32kg each).",
      },
      {
        question: "How do I purchase additional baggage?",
        answer:
          'You can add extra baggage during booking or later through "My Tickets" section. Pre-purchased baggage is significantly cheaper than adding it at the airport.',
      },
      {
        question: "What items are prohibited in baggage?",
        answer:
          "Prohibited items include explosives, flammable materials, weapons, and certain chemicals. Check our complete list on the baggage policy page or consult TSA guidelines for detailed information.",
      },
      {
        question: "What if my baggage is lost or damaged?",
        answer:
          "Report lost or damaged baggage immediately at the airport baggage service counter. You can also file a claim through our website within 7 days of your flight. We will track and deliver recovered baggage to your address.",
      },
    ],
  },
  {
    title: "Account & Profile",
    faqs: [
      {
        question: "How do I create an account?",
        answer:
          'Click "Sign Up" on the top right of our website. Fill in your personal details, create a secure password, and verify your email address. Your account will be ready to use immediately.',
      },
      {
        question: "How do I reset my password?",
        answer:
          'Click "Forgot Password" on the login page. Enter your registered email address, and we will send you a password reset link. Follow the instructions in the email to create a new password.',
      },
      {
        question: "Can I update my profile information?",
        answer:
          "Yes, you can update your profile information through your account settings. Note that for security reasons, changing certain details like your name may require verification.",
      },
      {
        question: "Is my personal information secure?",
        answer:
          "Yes, we use industry-standard encryption and security measures to protect your personal and payment information. We never share your data with third parties without your consent.",
      },
    ],
  },
];

export default function CustomerFAQPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">FAQ</h1>
        <p className="text-muted-foreground">
          Find answers to common questions about booking, tickets, baggage, and
          more.
        </p>
      </div>

      <div className="space-y-6">
        {faqCategories.map((category) => (
          <Card key={category.title}>
            <CardHeader>
              <CardTitle>{category.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {category.faqs.map((faq, index) => (
                  <AccordionItem
                    key={index}
                    value={`${category.title}-${index}`}
                  >
                    <AccordionTrigger className="text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
