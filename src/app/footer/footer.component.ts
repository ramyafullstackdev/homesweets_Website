import { Component } from '@angular/core';
import { MessageService } from '../services';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-footer',
  standalone: false,
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  logoPath = 'assets/images/logo.jpg';
  description = 'We bring you the taste of authentic Indian Sweets & Snacks directly from the origin to your doorstep.';

  year = new Date().getFullYear();
  sections = [
    {
      title: 'Shop',
      links: [
        { label: 'Exclusive', route: '/exclusive' },
        { label: 'Under 499', route: '/under_499' },
        { label: 'New Launches', route: '/new_launches' },
        { label: 'Combos', route: '/combos' },
        { label: 'Pre-Orders', route: '/pre_orders' },
        { label: 'All Products', route: '/all_products' },
      ]
    },
    {
      title: 'Support',
      links: [
        { label: 'Contact Us', route: '/support/contact-us' },
        { label: 'FAQs', route: '/support/faq' },
        { label: 'Cancellation, Return & Refund', route: '/support/return-and-refund' },
        { label: 'Sell With Us', route: '/support/sell-with-us' }
      ]
    },
    {
      title: 'About Us',
      links: [
        { label: 'Packing & Shipment', route: '/about-us/package-shipment' },
        { label: 'Privacy Policy', route: '/about-us/policies/privacy-policy' },
        { label: 'Terms & Conditions', route: '/about-us/terms-and-conditions' },
        { label: 'Terms of Service', route: '/about-us/terms-of-services' }
      ]
    }
  ];


  newsletter = {
    title: 'Home Sweets',
    description: 'Sign up to get exclusive offers, the latest Home Sweets, and more',
    placeholder: 'Email',
    terms: {
      termsText: 'Terms and Conditions',
      termsRoute: '/about-us/terms-and-conditions',
      privacyText: 'Privacy Policy',
      privacyRoute: '/about-us/policies/privacy-policy'
    }
  };

  socialLinks = [
    { icon: 'bi-facebook', url: '#' },
    { icon: 'bi-instagram', url: '#' },
    { icon: 'bi-twitter-x', url: '#' }
  ];

  policyLinks = [
    { label: 'Refund policy', route: '/about-us/policies/refund-policy' },
    { label: 'Privacy policy', route: '/about-us/policies/privacy-policy' },
    { label: 'Terms of service', route: '/about-us/terms-of-services' },
    { label: 'Shipping policy', route: '/about-us/policies/shipping-policy' }
  ];
  private unsubscribe = new Subject<void>();

  constructor(private messageService: MessageService) {
    this.messageService.getMessageCategory()
      .pipe(takeUntil(this.unsubscribe))
      .subscribe((data) => {
        if (data && data.isCateory == true) {
          // this.sections[0].links = [];
          // data.navLinks.map((x: any) => {
            //  this.sections[0].links.push({label: x.label, route: x.link})
          // })
        }
      })
  }
}
